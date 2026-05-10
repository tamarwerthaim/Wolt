#include <gtest/gtest.h>
#include "Help.h"
#include "IOutput.h"
#include <vector>
#include <string>

class MockOutput : public IOutput {
public:
    std::vector<std::string> capturedMessages;

    void write(const std::string& message) override {
        capturedMessages.push_back(message);
    }
};

// Test: Help command should be able to create an instance
TEST(HelpTest, ShouldBeAbleToCreateInstance) {
    MockOutput mock;
    std::string input = "";
    Help* command = new Help(mock, input);
    ASSERT_NE(command, nullptr);
    delete command;
}

// Test: Help command should write to output when executed
TEST(HelpTest, ShouldWriteToOutputWhenExecuted) {
    MockOutput mock;
    Help command(mock, "");
    command.execute();
    EXPECT_FALSE(mock.capturedMessages.empty());
}

// Test: Help command should print the correct format for all commands
TEST(HelpTest, ShouldPrintCorrectFormat) {
    MockOutput mock;
    Help command(mock, "");

    command.execute();

    // We expect exactly 5 lines of output for the 5 commands
    ASSERT_EQ(mock.capturedMessages.size(), 5);
    EXPECT_EQ(mock.capturedMessages[0], "DELETE, arguments: [userid] [productid1] [productid2] ...\n");
    EXPECT_EQ(mock.capturedMessages[1], "GET, arguments: [userid] [productid]\n");
    EXPECT_EQ(mock.capturedMessages[2], "PATCH, arguments: [userid] [productid1] [productid2] ...\n");
    EXPECT_EQ(mock.capturedMessages[3], "POST, arguments: [userid] [productid1] [productid2] ...\n");
    EXPECT_EQ(mock.capturedMessages[4], "help\n");
}

// Test: Help command should ignore extra parameters and return 400 Bad Request
TEST(HelpTest, ShouldIgnoreWhenInputContainsNumbersAfterCommand) {
    MockOutput mock;
    std::string inputWithNumbers = "23"; 
    Help command(mock, inputWithNumbers);

    command.execute();

    // Should return exactly one error message
    ASSERT_EQ(mock.capturedMessages.size(), 1);
    EXPECT_EQ(mock.capturedMessages[0], "400 Bad Request\n");
}

// Test: Help command should ignore extra garbage text and return 400 Bad Request
TEST(HelpTest, ShouldIgnoreWhenInputContainsGarbageText) {
    MockOutput mock;
    std::string garbageInput = "he23lp";
    Help command(mock, garbageInput);

    command.execute();

    ASSERT_EQ(mock.capturedMessages.size(), 1);
    EXPECT_EQ(mock.capturedMessages[0], "400 Bad Request\n");
}

// Test: Help command should ignore extra whitespace but still work
TEST(HelpTest, ShouldIgnoreIfCommandNameIsMergedWithNumbers) {
    MockOutput mock;
    Help command(mock, "23"); 
    
    command.execute();
    
    ASSERT_EQ(mock.capturedMessages.size(), 1);
    EXPECT_EQ(mock.capturedMessages[0], "400 Bad Request\n");
}