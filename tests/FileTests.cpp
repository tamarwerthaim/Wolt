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

// --- Basic flow tests ---

// 1. Check if the write function actually creates a file and saves the data
TEST_F(FileTest, WriteCreatesFileAndStoresData) {
    File f(testFileName);
    f.write("Hello Wolt");

    // Open the file manually to see if the content is really there
    std::ifstream checkFile(testFileName);
    std::string content;
    std::getline(checkFile, content);
    
    EXPECT_EQ(content, "Hello Wolt");
}

// 2. Make sure we can read a line from an existing file
TEST_F(FileTest, ReadReturnsCorrectLine) {
    createTestFile("First Line\nSecond Line");
    File f(testFileName);

    EXPECT_EQ(f.read(), "First Line");
}

// 3. Test the "bookmark" effect - reading multiple lines one after another
TEST_F(FileTest, ReadSequentiallyMovesBookmark) {
    createTestFile("Line A\nLine B\nLine C");
    File f(testFileName);

    EXPECT_EQ(f.read(), "Line A");
    EXPECT_EQ(f.read(), "Line B");
    EXPECT_EQ(f.read(), "Line C");
}

// --- Edge cases and error handling ---

// 4. What happens if we try to read a file that doesn't even exist?
TEST_F(FileTest, ReadNonExistentFileReturnsEmptyString) {
    File f("i_do_not_exist.txt");
    
    EXPECT_EQ(f.read(), "");
    // It should be marked as "finished" since there's nothing to read
    EXPECT_TRUE(f.isFinished()); 
}

// 5. Verify that isFinished() correctly detects the end of the file
TEST_F(FileTest, IsFinishedReturnsTrueAtEndOfFile) {
    createTestFile("Only One Line");
    File f(testFileName);

    f.read(); // Read the first line
    f.read(); // Try to read again (should hit EOF)
    
    EXPECT_TRUE(f.isFinished());
}

// 6. Check that writing doesn't delete old data (Append mode)
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

// 7. Make sure empty lines in the middle of a file don't break anything
TEST_F(FileTest, HandleEmptyLinesCorrectly) {
    createTestFile("Line 1\n\nLine 3");
    File f(testFileName);

    EXPECT_EQ(f.read(), "Line 1");
    EXPECT_EQ(f.read(), ""); // This is the empty line
    EXPECT_EQ(f.read(), "Line 3");
}