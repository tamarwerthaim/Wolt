#include <gtest/gtest.h>
#include "File.h"
#include <fstream>
#include <cstdio> // used for std::remove

class FileTest : public ::testing::Test {
protected:
    const std::string testFileName = "test_data.txt";

    // This runs before every test to make sure we start with a clean slate
    void SetUp() override {
        std::remove(testFileName.c_str());
    }

    // This cleans up the test file after each test finishes
    void TearDown() override {
        std::remove(testFileName.c_str());
    }

    // Small helper to quickly create a file with some text for testing
    void createTestFile(const std::string& content) {
        std::ofstream outFile(testFileName);
        outFile << content;
        outFile.close();
    }
};

// tests that the File class can successfully write a line to a new file and that the content is correctly stored.
TEST_F(FileTest, WriteCreatesFileAndStoresData) {
    File f(testFileName);
    f.write("Hello Wolt");

    // Open the file manually to see if the content is really there
    std::ifstream checkFile(testFileName);
    std::string content;
    std::getline(checkFile, content);
    
    EXPECT_EQ(content, "Hello Wolt");
}

// tests that the File class can read a line from a file and that it correctly returns the content of the line.
TEST_F(FileTest, ReadReturnsCorrectLine) {
    createTestFile("First Line\nSecond Line");
    File f(testFileName);

    EXPECT_EQ(f.read(), "First Line");
}

// tests that the File class can read multiple lines sequentially and that it correctly updates its internal state to return the next line on each read call.
TEST_F(FileTest, ReadSequentiallyMovesBookmark) {
    createTestFile("Line A\nLine B\nLine C");
    File f(testFileName);

    EXPECT_EQ(f.read(), "Line A");
    EXPECT_EQ(f.read(), "Line B");
    EXPECT_EQ(f.read(), "Line C");
}

// tests that the File class correctly handles the case where it tries to read from a file that does not exist and returns an empty string.
TEST_F(FileTest, ReadNonExistentFileReturnsEmptyString) {
    File f("i_do_not_exist.txt");
    
    EXPECT_EQ(f.read(), "");
    // It should be marked as "finished" since there's nothing to read
    EXPECT_TRUE(f.isFinished()); 
}

// tests that the File class correctly identifies when it has reached the end of the file 
// and that subsequent calls to read return an empty string.
TEST_F(FileTest, IsFinishedReturnsTrueAtEndOfFile) {
    createTestFile("Only One Line");
    File f(testFileName);

    f.read(); // Read the first line
    f.read(); // Try to read again (should hit EOF)
    
    EXPECT_TRUE(f.isFinished());
}

// tests that the File class can successfully append a line to an existing file without overwriting the previous content 
// and that both lines are correctly stored in the file.
TEST_F(FileTest, WriteAppendsAndDoesNotOverwrite) {
    createTestFile("Existing Content\n");
    File f(testFileName);
    
    f.write("New Content");

    std::ifstream checkFile(testFileName);
    std::string line1, line2;
    std::getline(checkFile, line1);
    std::getline(checkFile, line2);

    EXPECT_EQ(line1, "Existing Content");
    EXPECT_EQ(line2, "New Content");
}

// tests that the File class correctly handles empty lines in the file and that it returns an empty string
// for those lines when read is called.
TEST_F(FileTest, HandleEmptyLinesCorrectly) {
    createTestFile("Line 1\n\nLine 3");
    File f(testFileName);

    EXPECT_EQ(f.read(), "Line 1");
    EXPECT_EQ(f.read(), ""); // This is the empty line
    EXPECT_EQ(f.read(), "Line 3");
}