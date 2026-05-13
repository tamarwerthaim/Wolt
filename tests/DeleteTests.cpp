#include <gtest/gtest.h>
#include <fstream>
#include <sstream>
#include <vector>
#include "Delete.h"
#include "MemoryUsers.h"
#include "IOutput.h"
#include "User.h"
#include "Product.h"
#include "CommandException.h"

// A simple IOutput implementation to capture output for testing
class MockTerminalOutput : public IOutput {
public:
    std::string lastMessage;
    void write(const std::string& message) override { 
        lastMessage = message; 
    }
    void clear() { lastMessage = ""; }
};

// Test fixture for testing the Delete command
class DeleteCommandTest : public ::testing::Test {
protected:
    MockTerminalOutput out;
    MemoryUsers* repo;
    const std::string testDb = "delete_test_db.txt";

    // Set up the test environment before each test
    void SetUp() override {
        std::ofstream ofs(testDb, std::ios::trunc);
        ofs.close();
        repo = new MemoryUsers(testDb);
    }

    // Clean up after each test
    void TearDown() override {
        delete repo;
        std::remove(testDb.c_str());
    }
};

// Tests that the Delete command successfully deletes a product from a user's list and returns the correct status message.
TEST_F(DeleteCommandTest, StandardSuccessfulDelete) {
    User* u = new User(100);
    u->addProduct(Product(10));
    u->addProduct(Product(20));
    repo->addUser(u);

    Delete del(repo);
    del.setInput("100 10"); 
    del.execute(out);

    EXPECT_EQ(out.lastMessage, "204 No Content\n");

    User* updatedUser = nullptr;
    for(auto user : repo->getUsers()) if(user->getID() == 100) updatedUser = user;
    
    ASSERT_NE(updatedUser, nullptr);
    EXPECT_FALSE(updatedUser->hasProduct(10));
    EXPECT_TRUE(updatedUser->hasProduct(20));
}

// Tests that the Delete command can handle deleting multiple products at once and updates the user's product list accordingly.
TEST_F(DeleteCommandTest, DeleteMultipleProductsAtOnce) {
    User* u = new User(1);
    for(int id : {10, 20, 30, 40}) u->addProduct(Product(id));
    repo->addUser(u);

    Delete del(repo);
    del.setInput("1 10 20 30"); 
    del.execute(out);

    EXPECT_EQ(out.lastMessage, "204 No Content\n");
    
    User* check = repo->getUsers()[0];
    EXPECT_EQ(check->getProducts().size(), 1);
    EXPECT_TRUE(check->hasProduct(40));
}

// Tests that the Delete command correctly handles the case where the specified user does not exist in the system
// and returns an appropriate error message.
TEST_F(DeleteCommandTest, UserDoesNotExistInSystem) {
    Delete del(repo);
    del.setInput("555 10"); 
    EXPECT_THROW(del.execute(out), LogicalErrorException);
}

// Tests that the Delete command correctly handles the case where the specified product ID does not exist in the user's list 
// and returns an appropriate error message.
TEST_F(DeleteCommandTest, UserFoundButProductMissing) {
    User* u = new User(1);
    u->addProduct(Product(10));
    repo->addUser(u);

    Delete del(repo);
    del.setInput("1 99"); 
    EXPECT_THROW(del.execute(out), LogicalErrorException);
}

// Tests that the Delete command correctly handles the case where the input string is missing required parameters
// and returns an appropriate error message.
TEST_F(DeleteCommandTest, MissingProductParameter) {
    Delete del(repo);
    del.setInput("1"); 
    EXPECT_THROW(del.execute(out), InvalidInputException);
}

// Tests that the Delete command correctly handles the case where the input string contains non-numeric characters instead of valid user
// and product IDs and returns an appropriate error message.
TEST_F(DeleteCommandTest, NonNumericInputHandling) {
    Delete del(repo);
    del.setInput("1 abc"); 
    EXPECT_THROW(del.execute(out), InvalidInputException);
}

// Tests that the Delete command correctly handles the case where the input string contains negative numbers for user
// or product IDs and returns an appropriate error message.
TEST_F(DeleteCommandTest, NegativeIdsAreBlocked) {
    Delete del(repo);
    del.setInput("-5 10"); 
    EXPECT_THROW(del.execute(out), InvalidInputException);
}

// Tests that the Delete command correctly handles the case where the input string contains extra non-numeric text
// after valid user and product IDs and returns an appropriate error message.
TEST_F(DeleteCommandTest, TrailingGarbageAfterValidIds) {
    User* u = new User(1);
    u->addProduct(Product(10));
    repo->addUser(u);

    Delete del(repo);
    del.setInput("1 10 someExtraText"); 
    EXPECT_THROW(del.execute(out), InvalidInputException);
}