#include <gtest/gtest.h>
#include <fstream>
#include <sstream>
#include <vector>
#include "Delete.h"
#include "MemoryUsers.h"
#include "IOutput.h"
#include "User.h"
#include "Product.h"

/**
 * Human Note: Simple mock output to catch the server's responses.
 * We need to verify exact strings like "204 No Content".
 */
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
        // Clean start for the database file in every test
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
    // Setting up a user with some history
    User* u = new User(100);
    u->addProduct(Product(10));
    u->addProduct(Product(20));
    repo->addUser(u);

    // Constructor only takes the repo now
    Delete del(repo);
    del.setInput("100 10"); 
    // Injecting the output at execution time
    del.execute(out);

    // Requirement: Must be exactly "204 No Content"
    EXPECT_EQ(out.lastMessage, "204 No Content\n");

    // Verify the state: User exists but product 10 is gone
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

    Delete del(repo);
    del.setInput("1 10 20 30"); 
    del.execute(out);

    EXPECT_EQ(out.lastMessage, "204 No Content\n");
    
    // Only product 40 should remain in the set
    User* check = repo->getUsers()[0];
    EXPECT_EQ(check->getProducts().size(), 1);
    EXPECT_TRUE(check->hasProduct(40));
}

// --- LOGIC ERRORS (404 Not Found) ---

TEST_F(DeleteCommandTest, UserDoesNotExistInSystem) {
    Delete del(repo);
    del.setInput("555 10"); // User 555 is missing from DB
    del.execute(out);

    // If the ID is valid but the entity is missing -> 404
    EXPECT_EQ(out.lastMessage, "404 Not Found\n");
}

TEST_F(DeleteCommandTest, UserFoundButProductMissing) {
    User* u = new User(1);
    u->addProduct(Product(10));
    repo->addUser(u);

    Delete del(repo);
    del.setInput("1 99"); // Product 99 was never watched by User 1
    del.execute(out);

    EXPECT_EQ(out.lastMessage, "404 Not Found\n");
}

// --- SYNTAX ERRORS (400 Bad Request) ---

TEST_F(DeleteCommandTest, MissingProductParameter) {
    Delete del(repo);
    del.setInput("1"); // Only userID provided, missing products
    del.execute(out);

    // Malformed command -> 400
    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

TEST_F(DeleteCommandTest, NonNumericInputHandling) {
    Delete del(repo);
    del.setInput("1 abc"); // Letters are invalid for IDs
    del.execute(out);

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

TEST_F(DeleteCommandTest, NegativeIdsAreBlocked) {
    Delete del(repo);
    del.setInput("-5 10"); 
    del.execute(out);

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

TEST_F(DeleteCommandTest, TrailingGarbageAfterValidIds) {
    User* u = new User(1);
    u->addProduct(Product(10));
    repo->addUser(u);

    Delete del(repo);
    del.setInput("1 10 someExtraText"); 
    del.execute(out);

    // Extra text at the end of the line makes it a Bad Request
    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}