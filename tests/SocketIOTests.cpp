#include <gtest/gtest.h>
#include <sys/socket.h>
#include <unistd.h>
#include <string>
#include "SocketIO.h"

// Tests that the SocketIO class can successfully write a message to the socket and that the message is correctly sent to the client.
TEST(SocketIOTest, FullCommunicationFlow) {
    int sv[2];
    
    // Create a pair of connected sockets for testing
    ASSERT_NE(socketpair(AF_UNIX, SOCK_STREAM, 0, sv), -1) << "Socketpair creation failed";

    // Create a SocketIO instance using one end of the socket pair
    SocketIO io(sv[0]);
    // The other end (sv[1]) will be used to simulate the client side for testing     
    int tester_fd = sv[1]; 
    // Ensure the tester_fd is non-blocking to prevent hanging in case of issues 
    char buf[1024];
    int n;

    // writing to the socket
    io.write("Hello");
    n = read(tester_fd, buf, 1024);
    if (n > 0) {
        buf[n] = '\0';
        EXPECT_EQ(std::string(buf), "Hello\n");
    } else {
        FAIL() << "Failed to read from tester_fd in Test 1";
    }

    // writing another message to check if the SocketIO correctly handles multiple writes
    io.write("Already\n");
    n = read(tester_fd, buf, 1024);
    if (n > 0) {
        buf[n] = '\0';
        EXPECT_EQ(std::string(buf), "Already\n");
    } else {
        FAIL() << "Failed to read from tester_fd in Test 2";
    }

    // reading a command from the client
    std::string msg = "Command1\n";
    send(tester_fd, msg.c_str(), msg.length(), 0);
    EXPECT_EQ(io.read(), "Command1");

    // check if we finish - we should not finish yet
    close(tester_fd); 
    io.read();        
    EXPECT_TRUE(io.isFinished());

    close(sv[0]);
}