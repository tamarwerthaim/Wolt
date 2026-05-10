#include <iostream>
#include <cassert>
#include <sys/socket.h>
#include <unistd.h>
#include "SocketIO.h"

void run_tests() {
    int sv[2];
    // יצירת זוג סוקטים שמחוברים זה לזה בזיכרון
    if (socketpair(AF_UNIX, SOCK_STREAM, 0, sv) == -1) {
        std::cerr << "Socketpair failed" << std::endl;
        return;
    }

    SocketIO io(sv[0]); // אובייקט הבדיקה שלנו
    int tester_fd = sv[1]; // הסוקט שדרכו נדמה את ה"לקוח"
    char buf[1024];

    // --- טסט 1: כתיבה בסיסית והוספת \n ---
    io.write("Hello");
    int n = read(tester_fd, buf, 1024);
    buf[n] = '\0';
    assert(std::string(buf) == "Hello\n");
    std::cout << "Test 1 (Basic Write) Passed!" << std::endl;

    // --- טסט 2: כתיבה עם \n קיים (מקרה קיצון) ---
    io.write("Already\n");
    n = read(tester_fd, buf, 1024);
    buf[n] = '\0';
    assert(std::string(buf) == "Already\n"); // לא אמור להיות \n\n
    std::cout << "Test 2 (Double Newline Avoidance) Passed!" << std::endl;

    // --- טסט 3: קריאה בסיסית עד ה-\n ---
    std::string msg = "Command1\n";
    send(tester_fd, msg.c_str(), msg.length(), 0);
    assert(io.read() == "Command1");
    std::cout << "Test 3 (Basic Read) Passed!" << std::endl;

    // --- טסט 4: זיהוי ניתוק (מקרה קיצון) ---
    close(tester_fd); // הלקוח מתנתק
    io.read();        // מנסים לקרוא
    assert(io.isFinished() == true);
    std::cout << "Test 4 (Disconnect Detection) Passed!" << std::endl;

    close(sv[0]);
    std::cout << "\nAll SocketIO tests passed successfully!" << std::endl;
}

int main() {
    run_tests();
    return 0;
}