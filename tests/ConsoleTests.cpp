#include <gtest/gtest.h>
#include "Console.h"
#include <sstream>
#include <iostream>

class ConsoleTest : public ::testing::Test {
protected:
    std::streambuf* orig_cin;
    std::streambuf* orig_cout;
    std::istringstream test_input;
    std::ostringstream test_output;

    // Set up the test environment before each test
    void SetUp() override {
        // save the original state
        orig_cin = std::cin.rdbuf();
        orig_cout = std::cout.rdbuf();
        
        // redirect cin and cout to our test streams
        std::cin.rdbuf(test_input.rdbuf());
        std::cout.rdbuf(test_output.rdbuf());
    }

    void TearDown() override {
        // return the state like the beginning
        std::cin.rdbuf(orig_cin);
        std::cout.rdbuf(orig_cout);
    }

    // Helper function to simulate input for the Console
    void simulateInput(const std::string& input) {
        test_input.str(input);
        test_input.clear(); // restart status
    }
};

// Tests that the Console correctly writes a basic message to the output stream.
TEST_F(ConsoleTest, WriteBasicMessage) {
    Console c;
    c.write("Hello World");
    EXPECT_EQ(test_output.str(), "Hello World");
}

// Tests that the Console correctly reads a basic message from the input stream.
TEST_F(ConsoleTest, ReadBasicInput) {
    Console c;
    simulateInput("Hello\n");
    std::string result = c.read();
    EXPECT_EQ(result, "Hello");
}

// Tests that the Console correctly handles input with leading and trailing whitespace.
TEST_F(ConsoleTest, ReadInputWithSpaces) {
    Console c;
    simulateInput("Add Pizza 10\n");
    std::string result = c.read();
    EXPECT_EQ(result, "Add Pizza 10");
}

// Tests that the Console correctly handles an empty message and does not write anything to the output stream.
TEST_F(ConsoleTest, WriteEmptyMessage) {
    Console c;
    c.write("");
    EXPECT_EQ(test_output.str(), "");
}

// Tests that the Console correctly handles an empty line of input and returns an empty string.
TEST_F(ConsoleTest, ReadEmptyLine) {
    Console c;
    simulateInput("\n");
    std::string result = c.read();
    EXPECT_TRUE(result.empty());
}

// Tests that the Console correctly handles special characters in the input and output.
TEST_F(ConsoleTest, SpecialCharacters) {
    Console c;
    std::string special = "!@#$%^&*()_+";
    c.write(special);
    EXPECT_EQ(test_output.str(), special);
}

// Tests that the Console correctly handles a long message and does not truncate it.
TEST_F(ConsoleTest, LongInput) {
    Console c;
    std::string longStr(1000, 'a');
    simulateInput(longStr + "\n");
    EXPECT_EQ(c.read(), longStr);
}