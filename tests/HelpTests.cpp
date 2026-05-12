#include <gtest/gtest.h>
#include "Help.h"
#include "IOutput.h"
#include <vector>
#include <string>

/**
 * Mock object to capture messages sent by the command.
 * Helps us verify exactly what the user would see in their terminal/socket.
 */
class MockOutput : public IOutput {
public:
    std::vector<std::string> capturedMessages;

    void write(const std::string& message) override {
        capturedMessages.push_back(message);
    }
};

// --- INSTANTIATION TESTS ---

TEST(HelpTest, ShouldBeAbleToCreateInstance) {
    std::string input = "";
    // Constructor now only takes the input string
    Help* command = new Help(input);
    ASSERT_NE(command, nullptr);
    delete command;
}

// --- FUNCTIONAL TESTS ---

TEST(HelpTest, ShouldWriteToOutputWhenExecuted) {
    MockOutput mock;
    Help command(""); 
    command.execute(mock);
    EXPECT_FALSE(mock.capturedMessages.empty());
}

TEST(HelpTest, ShouldPrintCorrectFormatInAlphabeticalOrder) {
    MockOutput mock;
    Help command(""); 

    command.execute(mock);

    // We expect exactly 5 separate write calls based on the implementation
    ASSERT_EQ(mock.capturedMessages.size(), 5);
    
    // Verifying alphabetical order as required by the assignment
    EXPECT_EQ(mock.capturedMessages[0], "DELETE, arguments: [userid] [productid1] [productid2] ...\n");
    EXPECT_EQ(mock.capturedMessages[1], "GET, arguments: [userid] [productid]\n");
    EXPECT_EQ(mock.capturedMessages[2], "PATCH, arguments: [userid] [productid1] [productid2] ...\n");
    EXPECT_EQ(mock.capturedMessages[3], "POST, arguments: [userid] [productid1] [productid2] ...\n");
    
    // The help command itself always appears last
    EXPECT_EQ(mock.capturedMessages[4], "help\n");
}

// --- INPUT VALIDATION TESTS (400 Bad Request) ---

TEST(HelpTest, ShouldReturnBadRequestIfExtraParametersProvided) {
    MockOutput mock;
    // Input contains extra junk after the command name
    std::string inputWithParams = " 123"; 
    Help command(inputWithParams);

    command.execute(mock);

    // Any non-empty parameters should trigger 400 Bad Request
    ASSERT_EQ(mock.capturedMessages.size(), 1);
    EXPECT_EQ(mock.capturedMessages[0], "400 Bad Request\n");
}

TEST(HelpTest, ShouldReturnBadRequestOnGarbageText) {
    MockOutput mock;
    std::string garbageInput = " some_random_text_here";
    Help command(garbageInput);

    command.execute(mock);

    ASSERT_EQ(mock.capturedMessages.size(), 1);
    EXPECT_EQ(mock.capturedMessages[0], "400 Bad Request\n");
}

TEST(HelpTest, ShouldWorkFineWithOnlyWhitespace) {
    MockOutput mock;
    // Trailing spaces or tabs should be ignored and treated as a valid call
    Help command("   \t  "); 
    
    command.execute(mock);
    
    // Should successfully show all 5 lines of help
    EXPECT_EQ(mock.capturedMessages.size(), 5);
    EXPECT_EQ(mock.capturedMessages[4], "help\n");
}