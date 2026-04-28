#include <gtest/gtest.h>
#include <fstream>
#include "MemoryUsers.h"
#include "User.h"
#include "Product.h"

class MemoryUsersTest : public ::testing::Test {
protected:
    // We use a specific file for testing
    const std::string testFile = "test_db.txt";

    // Clean up the test file before each test
    void SetUp() override {
        std::remove(testFile.c_str());
    }

    // Clean up after the test is done
    void TearDown() override {
        std::remove(testFile.c_str());
    }
};

// Test if adding a user works in the current session
TEST_F(MemoryUsersTest, AddAndGetUsers) {
    MemoryUsers repo(testFile);
    
    User* u1 = new User(1);
    u1->addProduct(Product(101));
    
    repo.addUser(u1);
    
    auto allUsers = repo.getUsers();
    ASSERT_EQ(allUsers.size(), 1);
    EXPECT_EQ(allUsers[0]->getID(), 1);
}

// The "Restart" test: Save to file and reload in a new instance
TEST_F(MemoryUsersTest, PersistenceTest) {
    // Session 1: Create a repo and add a user
    {
        MemoryUsers repo(testFile);
        User* u1 = new User(1);
        u1->addProduct(Product(101));
        u1->addProduct(Product(102));
        repo.addUser(u1);
    } 

    // Session 2: Create a new repo and see if it loads the data
    MemoryUsers secondRepo(testFile);
    auto loadedUsers = secondRepo.getUsers();
    
    ASSERT_EQ(loadedUsers.size(), 1);
    EXPECT_EQ(loadedUsers[0]->getID(), 1);
    
    // Check if the products were restored correctly
    auto products = loadedUsers[0]->getProducts();
    ASSERT_EQ(products.size(), 2);
    
    auto it = products.begin();
    EXPECT_EQ(it->getID(), 101);
    
    it++;
    EXPECT_EQ(it->getID(), 102);
}

// Check if it handles multiple users correctly
TEST_F(MemoryUsersTest, MultipleUsersPersistence) {
    {
        MemoryUsers repo(testFile);
        User* u1 = new User(1); u1->addProduct(Product(10));
        User* u2 = new User(2); u2->addProduct(Product(20));
        
        repo.addUser(u1);
        repo.addUser(u2);
    }

    MemoryUsers secondRepo(testFile);
    auto loadedUsers = secondRepo.getUsers();
    
    EXPECT_EQ(loadedUsers.size(), 2);
    EXPECT_EQ(loadedUsers[0]->getID(), 1);
    EXPECT_EQ(loadedUsers[1]->getID(), 2);
}

// Check behavior when the database file is missing
TEST_F(MemoryUsersTest, NoFileBehavior) {
    MemoryUsers repo("non_existent_file.txt");
    EXPECT_TRUE(repo.getUsers().empty());
}