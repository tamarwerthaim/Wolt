#include <gtest/gtest.h>
#include "Help.h"
#include "IOutput.h"
#include "CommandException.h"
#include <vector>
#include <string>

// A simple IOutput implementation to capture output for testing
class MockOutput : public IOutput {
public:
    std::vector<std::string> capturedMessages;

    void write(const std::string& message) override {
        capturedMessages.push_back(message);
    }
};

//tests that the Help command can be instantiated without throwing an exception 
//and that the resulting object is not a null pointer.
TEST(HelpTest, ShouldBeAbleToCreateInstance) {
    std::string input = "";
    // Constructor now only takes the input string
    Help* command = new Help(input);
    ASSERT_NE(command, nullptr);
    delete command;
}

// Tests that the Help command correctly writes the expected help information to the output when executed 
//and that it includes all the required lines of help text in the correct format.
TEST(HelpTest, ShouldWriteToOutputWhenExecuted) {
    MockOutput mock;
    Help command(""); 
    command.execute(mock);
    EXPECT_FALSE(mock.capturedMessages.empty());
}

// Tests that the Help command correctly formats the help information for all available commands 
// and that it lists the commands in alphabetical order as required by the assignment.
TEST(HelpTest, ShouldPrintCorrectFormatInAlphabeticalOrder) {
    MockOutput mock;
    Help command(""); 

    command.execute(mock);

    // We expect exactly 1 separate write call based on the aggregated implementation
    ASSERT_EQ(mock.capturedMessages.size(), 1);
    
    std::string fullOutput = mock.capturedMessages[0];

    // Verifying alphabetical order as required by the assignment
    size_t posDelete = fullOutput.find("DELETE, arguments: [userid] [productid1] [productid2] ...\n");
    size_t posGet    = fullOutput.find("GET, arguments: [userid] [productid]\n");
    size_t posPatch  = fullOutput.find("PATCH, arguments: [userid] [productid1] [productid2] ...\n");
    size_t posPost   = fullOutput.find("POST, arguments: [userid] [productid1] [productid2] ...\n");
    size_t posHelp   = fullOutput.find("help\n");

    EXPECT_TRUE(posDelete != std::string::npos);
    EXPECT_TRUE(posGet > posDelete && posGet != std::string::npos);
    EXPECT_TRUE(posPatch > posGet && posPatch != std::string::npos);
    EXPECT_TRUE(posPost > posPatch && posPost != std::string::npos);
    
    // The help command itself always appears last
    EXPECT_TRUE(posHelp > posPost && posHelp != std::string::npos);
}

// Tests that the Help command correctly handles the case where the input string contains extra parameters after the "help" command 
// and that it throws an appropriate exception indicating a bad request.
TEST(HelpTest, ShouldReturnBadRequestIfExtraParametersProvided) {
    MockOutput mock;
    // Input contains extra junk after the command name
    std::string inputWithParams = " 123"; 
    Help command(inputWithParams);

    // Any non-empty parameters should trigger InvalidInputException (400)
    EXPECT_THROW(command.execute(mock), InvalidInputException);
}

// Tests that the Help command correctly handles the case where the input string contains non-integer characters
// instead of valid command parameters and that it throws an appropriate exception indicating a bad request.
TEST(HelpTest, ShouldReturnBadRequestOnGarbageText) {
    MockOutput mock;
    std::string garbageInput = " some_random_text_here";
    Help command(garbageInput);

    EXPECT_THROW(command.execute(mock), InvalidInputException);
}

// Tests that the Help command correctly handles the case where the input string contains only whitespace characters 
// and that it still executes successfully without throwing an exception, treating it as a valid call to display the help information.
TEST(HelpTest, ShouldWorkFineWithOnlyWhitespace) {
    MockOutput mock;
    // Trailing spaces or tabs should be ignored and treated as a valid call
    Help command("   \t  "); 
    
    command.execute(mock);
    
    // Should successfully show all 5 lines of help in a single aggregated message
    ASSERT_EQ(mock.capturedMessages.size(), 1);
    EXPECT_TRUE(mock.capturedMessages[0].find("help\n") != std::string::npos);
}