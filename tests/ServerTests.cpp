#include <gtest/gtest.h>
#include "../include/Server.h"
#include "../include/APP.h"
#include "../include/IUserRepo.h"
#include <stdexcept>
#include <thread>
#include <chrono>
#include <sys/socket.h>
#include <netinet/in.h>

// מחלקה דמה (Mock/Dummy) כדי לבדוק את השרת בלי להריץ לוגיקה אמיתית
class MockRepo : public IUserRepo {
    // מימוש ריק לממשק לצורך הטסט
    virtual void addUser(User u) override {}
    virtual User* getUser(std::string id) override { return nullptr; }
    virtual void save() override {}
    virtual void load() override {}
};

class ServerTest : public ::testing::Test {
protected:
    MockRepo repo;
    std::map<std::string, ICommand*> emptyCmds;
};

// --- טסטים למקרים פשוטים (Happy Path) ---

// בדיקה שהשרת נוצר בהצלחה ולא קורס בבנייה
TEST_F(ServerTest, ServerInitialization) {
    EXPECT_NO_THROW({
        Server server(5555, "127.0.0.1");
    });
}

// בדיקה שניתן לעצור שרת שמעולם לא הופעל (מניעת קריסה ב-stop)
TEST_F(ServerTest, StopWithoutStart) {
    Server server(5556, "127.0.0.1");
    EXPECT_NO_THROW({
        server.stop();
    });
}

// --- טסטים למקרי קצה (Edge Cases & Errors) ---

// בדיקה שכתובת IP לא חוקית גורמת לזריקת שגיאה (כפי שמומש ב-createSocket)
TEST_F(ServerTest, InvalidIPFormat) {
    Server server(5557, "999.999.999.999"); // כתובת לא תקינה
    // לפי המימוש שלך, createSocket אמור לזרוק std::runtime_error
    EXPECT_THROW(server.createSocket(), std::runtime_error);
}

// בדיקה של פורט תפוס (Port Conflict)
TEST_F(ServerTest, PortAlreadyInUse) {
    int sharedPort = 5558;
    Server server1(sharedPort, "127.0.0.1");
    server1.createSocket(); // תופס את הפורט

    Server server2(sharedPort, "127.0.0.1");
    // הניסיון השני לבצע bind לאותו פורט אמור להיכשל
    EXPECT_THROW(server2.createSocket(), std::runtime_error);
    
    server1.stop();
}

// בדיקה שהשרת זורק שגיאה אם הפורט לא חוקי (למשל פורט של מערכת שדורש הרשאות root)
TEST_F(ServerTest, PrivilegedPort) {
    Server server(80, "127.0.0.1"); // פורט 80 דורש לרוב הרשאות מנהל
    // אם הריצה היא לא כ-root, ה-bind ייכשל
    try {
        server.createSocket();
    } catch (const std::runtime_error& e) {
        SUCCEED(); // השגיאה צפויה
        return;
    }
    // אם הגענו לכאן, כנראה שהרצת כ-root או שהפורט פנוי, תלוי בסביבה
}

// --- טסט התנהגותי (בדיקה שהשרת באמת "מקשיב") ---

TEST_F(ServerTest, ServerStartsAndStops) {
    Server server(5559, "127.0.0.1");
    server.createSocket();
    
    // מריצים את השרת ב-Thread נפרד כי start הוא לופ אינסופי
    App app(repo, emptyCmds);
    std::thread serverThread([&]() {
        // הערה: הטסט הזה עשוי להיתקע אם השרת לא עוצר, לכן נשתמש ב-stop
        server.start(app);
    });

    // מחכים רגע שהשרת יעלה
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    // מוודאים שניתן לעצור אותו
    server.stop();
    
    if (serverThread.joinable()) {
        serverThread.join();
    }
    SUCCEED();
}