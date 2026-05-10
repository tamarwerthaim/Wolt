#include <gtest/gtest.h>
#include <fstream>
#include <sstream>
#include <vector>
#include "Delete.h"
#include "MemoryUsers.h"
#include "IOutput.h"
#include "User.h"
#include "Product.h"

// Mock output class to capture the output for assertions
class MockTerminalOutput : public IOutput {
public:
    std::string lastMessage;
    void write(const std::string& message) override { 
        lastMessage = message; 
    }
    void clear() { lastMessage = ""; }
};

class DeleteCommandTest : public ::testing::Test {
protected:
    MockTerminalOutput out;
    MemoryUsers* repo;
    const std::string testDb = "delete_test_db.txt";

    void SetUp() override {
        // Clean start for every test
        std::ofstream ofs(testDb, std::ios::trunc);
        ofs.close();
        repo = new MemoryUsers(testDb);
    }

    void TearDown() override {
        delete repo;
        std::remove(testDb.c_str());
    }
};

// --- SUCCESS CASES (204 No Content) ---

TEST_F(DeleteCommandTest, StandardSuccessfulDelete) {
    // Adding a user with a few products first
    User* u = new User(100);
    u->addProduct(Product(10));
    u->addProduct(Product(20));
    repo->addUser(u);

    Delete del(&out, repo);
    del.setInput("100 10"); // User 100 watched 10, now remove it
    del.execute();

    // The assignment is very specific: must be exactly "204 No Content"
    EXPECT_EQ(out.lastMessage, "204 No Content\n");

    // Double check the DB: user should still have 20 but NOT 10
    User* updatedUser = nullptr;
    for(auto user : repo->getUsers()) if(user->getID() == 100) updatedUser = user;
    
    ASSERT_NE(updatedUser, nullptr);
    EXPECT_FALSE(updatedUser->hasProduct(10));
    EXPECT_TRUE(updatedUser->hasProduct(20));
}

TEST_F(DeleteCommandTest, DeleteMultipleProductsAtOnce) {
    User* u = new User(1);
    for(int id : {10, 20, 30, 40}) u->addProduct(Product(id));
    repo->addUser(u);

    Delete del(&out, repo);
    del.setInput("1 10 20 30"); // Let's clear out 3 items in one go
    del.execute();

    EXPECT_EQ(out.lastMessage, "204 No Content\n");
    
    // Only product 40 should remain
    User* check = repo->getUsers()[0];
    EXPECT_EQ(check->getProducts().size(), 1);
    EXPECT_TRUE(check->hasProduct(40));
}

// --- LOGIC ERRORS (404 Not Found) ---

TEST_F(DeleteCommandTest, UserDoesNotExist) {
    Delete del(&out, repo);
    del.setInput("555 10"); // We haven't added user 555 yet
    del.execute();

    // Protocol says: structure is fine but data doesn't exist -> 404
    EXPECT_EQ(out.lastMessage, "404 Not Found\n");
}

TEST_F(DeleteCommandTest, UserExistsButDidNotWatchProduct) {
    User* u = new User(1);
    u->addProduct(Product(10));
    repo->addUser(u);

    Delete del(&out, repo);
    del.setInput("1 99"); // User 1 exists, but never watched product 99
    del.execute();

    EXPECT_EQ(out.lastMessage, "404 Not Found\n");
}

// --- SYNTAX ERRORS (400 Bad Request) ---

TEST_F(DeleteCommandTest, MissingProductArgument) {
    Delete del(&out, repo);
    del.setInput("1"); // We got a UserID but no ProductID to delete
    del.execute();

    // Syntax is wrong -> 400
    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

TEST_F(DeleteCommandTest, AlphabeticalGarbageInput) {
    Delete del(&out, repo);
    del.setInput("1 abc"); // 'abc' is not a valid product ID
    del.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

TEST_F(DeleteCommandTest, NegativeIdsAreInvalid) {
    Delete del(&out, repo);
    del.setInput("-5 10"); // Can't have a negative UserID
    del.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

TEST_F(DeleteCommandTest, TrailingGarbageAfterIds) {
    User* u = new User(1);
    u->addProduct(Product(10));
    repo->addUser(u);

    Delete del(&out, repo);
    del.setInput("1 10 someExtraText"); // IDs are okay but there is junk at the end
    del.execute();

    // Any non-compliant string format should trigger 400
    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}