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
        std::ofstream ofs(testDb, std::ios::trunc);
        ofs.close();
        repo = new MemoryUsers(testDb);
    }

    void TearDown() override {
        delete repo;
        std::remove(testDb.c_str());
    }
};

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

TEST_F(DeleteCommandTest, UserDoesNotExistInSystem) {
    Delete del(repo);
    del.setInput("555 10"); 
    EXPECT_THROW(del.execute(out), LogicalErrorException);
}

TEST_F(DeleteCommandTest, UserFoundButProductMissing) {
    User* u = new User(1);
    u->addProduct(Product(10));
    repo->addUser(u);

    Delete del(repo);
    del.setInput("1 99"); 
    EXPECT_THROW(del.execute(out), LogicalErrorException);
}

TEST_F(DeleteCommandTest, MissingProductParameter) {
    Delete del(repo);
    del.setInput("1"); 
    EXPECT_THROW(del.execute(out), InvalidInputException);
}

TEST_F(DeleteCommandTest, NonNumericInputHandling) {
    Delete del(repo);
    del.setInput("1 abc"); 
    EXPECT_THROW(del.execute(out), InvalidInputException);
}

TEST_F(DeleteCommandTest, NegativeIdsAreBlocked) {
    Delete del(repo);
    del.setInput("-5 10"); 
    EXPECT_THROW(del.execute(out), InvalidInputException);
}

TEST_F(DeleteCommandTest, TrailingGarbageAfterValidIds) {
    User* u = new User(1);
    u->addProduct(Product(10));
    repo->addUser(u);

    Delete del(repo);
    del.setInput("1 10 someExtraText"); 
    EXPECT_THROW(del.execute(out), InvalidInputException);
}