#include <gtest/gtest.h>
#include <sys/socket.h>
#include <unistd.h>
#include <string>
#include "SocketIO.h"

TEST(SocketIOTest, FullCommunicationFlow) {
    int sv[2];
    
    // 1. יצירת זוג סוקטים
    ASSERT_NE(socketpair(AF_UNIX, SOCK_STREAM, 0, sv), -1) << "Socketpair creation failed";

    SocketIO io(sv[0]);     // האובייקט שלך
    int tester_fd = sv[1];  // ה"לקוח" המדומה
    char buf[1024];
    int n;

    // --- טסט 1: כתיבה בסיסית והוספת \n ---
    io.write("Hello");
    n = read(tester_fd, buf, 1024);
    if (n > 0) {
        buf[n] = '\0';
        EXPECT_EQ(std::string(buf), "Hello\n");
    } else {
        FAIL() << "Failed to read from tester_fd in Test 1";
    }

    // --- טסט 2: כתיבה עם \n קיים (מניעת כפל) ---
    io.write("Already\n");
    n = read(tester_fd, buf, 1024);
    if (n > 0) {
        buf[n] = '\0';
        EXPECT_EQ(std::string(buf), "Already\n");
    } else {
        FAIL() << "Failed to read from tester_fd in Test 2";
    }

    // --- טסט 3: קריאה בסיסית מהסוקט ---
    std::string msg = "Command1\n";
    send(tester_fd, msg.c_str(), msg.length(), 0);
    EXPECT_EQ(io.read(), "Command1");

    // --- טסט 4: זיהוי ניתוק ---
    close(tester_fd); // סגירת הצד של הלקוח
    io.read();        // ניסיון קריאה שאמור להיכשל
    EXPECT_TRUE(io.isFinished());

    // ניקוי
    close(sv[0]);
}