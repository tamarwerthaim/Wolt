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

    void SetUp() override {
        // save the original state
        orig_cin = std::cin.rdbuf();
        orig_cout = std::cout.rdbuf();
        
    
        std::cin.rdbuf(test_input.rdbuf());
        std::cout.rdbuf(test_output.rdbuf());
    }

    void TearDown() override {
        // return the state like the begining
        std::cin.rdbuf(orig_cin);
        std::cout.rdbuf(orig_cout);
    }

    void simulateInput(const std::string& input) {
        test_input.str(input);
        test_input.clear(); // restart status
    }
};

TEST_F(ConsoleTest, WriteBasicMessage) {
    Console c;
    c.write("Hello World");
    EXPECT_EQ(test_output.str(), "Hello World\n");
}

TEST_F(ConsoleTest, ReadBasicInput) {
    Console c;
    simulateInput("Hello\n");
    std::string result = c.read();
    EXPECT_EQ(result, "Hello");
}

//input with more than one spaces
TEST_F(ConsoleTest, ReadInputWithSpaces) {
    Console c;
    simulateInput("Add Pizza 10\n");
    std::string result = c.read();
    EXPECT_EQ(result, "Add Pizza 10");
}

//empty message
TEST_F(ConsoleTest, WriteEmptyMessage) {
    Console c;
    c.write("");
    EXPECT_EQ(test_output.str(), "\n");
}

TEST_F(ConsoleTest, ReadEmptyLine) {
    Console c;
    simulateInput("\n");
    std::string result = c.read();
    EXPECT_TRUE(result.empty());
}

//special chars
TEST_F(ConsoleTest, SpecialCharacters) {
    Console c;
    std::string special = "!@#$%^&*()_+";
    c.write(special);
    EXPECT_EQ(test_output.str(), special + "\n");
}

//long input
TEST_F(ConsoleTest, LongInput) {
    Console c;
    std::string longStr(1000, 'a');
    simulateInput(longStr + "\n");
    EXPECT_EQ(c.read(), longStr);
}