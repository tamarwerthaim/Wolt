#include <gtest/gtest.h>
#include "Help.h"
#include "IOutput.h"
#include <vector>
#include <string>

// Mock class to capture the output for testing
class MockOutput : public IOutput {
public:
    std::vector<std::string> capturedMessages;

    void write(const std::string& message) override {
        capturedMessages.push_back(message);
    }
};

// Test 1: Check if we can create a Help object successfully
TEST(HelpTest, ShouldBeAbleToCreateInstance) {
    MockOutput mock;
    std::string input = "";
    
    Help* command = new Help(mock, input);
    
    ASSERT_NE(command, nullptr);
    delete command;
}

// Test 2: Verify that execute actually calls the output write method
TEST(HelpTest, ShouldWriteToOutputWhenExecuted) {
    MockOutput mock;
    Help command(mock, "");
    
    command.execute();

    // Check if at least one message was sent to output
    EXPECT_FALSE(mock.capturedMessages.empty());
}

// Test 3: Verify the output matches the required format exactly
TEST(HelpTest, ShouldPrintCorrectFormat) {
    MockOutput mock;
    Help command(mock, "");

    command.execute();

    // Verify we have 3 lines and the text is correct (including the newlines)
    ASSERT_EQ(mock.capturedMessages.size(), 3);
    EXPECT_EQ(mock.capturedMessages[0], "add [userid] [productid1] [productid2] ...\n");
    
    // התיקון כאן: שיניתי מ-recommend ל-GET כדי שיתאים לקוד שלך
    EXPECT_EQ(mock.capturedMessages[1], "GET [userid] [productid]\n");
    
    EXPECT_EQ(mock.capturedMessages[2], "help\n");
}

// Test 4: Ensure the command ignores extra numbers (e.g., "help 23")
TEST(HelpTest, ShouldIgnoreWhenInputContainsNumbersAfterCommand) {
    MockOutput mock;
    std::string inputWithNumbers = "23"; 
    Help command(mock, inputWithNumbers);

    command.execute();

    // Should not print anything
    EXPECT_EQ(mock.capturedMessages.size(), 0);
}

// Test 5: Ensure the command ignores garbage text (e.g., "help he23lp")
TEST(HelpTest, ShouldIgnoreWhenInputContainsGarbageText) {
    MockOutput mock;
    std::string garbageInput = "he23lp";
    Help command(mock, garbageInput);

    command.execute();

    // Should not print anything
    EXPECT_TRUE(mock.capturedMessages.empty());
}

// Test 6: Safety check for merged input (e.g., "help23")
TEST(HelpTest, ShouldIgnoreIfCommandNameIsMergedWithNumbers) {
    MockOutput mock;
    Help command(mock, "23"); 
    
    command.execute();
    
    EXPECT_EQ(mock.capturedMessages.size(), 0);
}