#include <gtest/gtest.h>
#include <fstream>
#include "MemoryUsers.h"
#include "User.h"
#include "Product.h"

// Test fixture for testing the MemoryUsers class
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

// Tests that the MemoryUsers class can successfully add a user to the repository 
// and that it can retrieve the list of users, confirming that the added user is present in the retrieved list.
TEST_F(MemoryUsersTest, AddAndGetUsers) {
    MemoryUsers repo(testFile);
    
    User* u1 = new User(1);
    u1->addProduct(Product(101));
    
    repo.addUser(u1);
    
    auto allUsers = repo.getUsers();
    ASSERT_EQ(allUsers.size(), 1);
    EXPECT_EQ(allUsers[0]->getID(), 1);
}
// Tests that users and products are correctly saved and loaded.
TEST_F(MemoryUsersTest, PersistenceTest) {
    {
        MemoryUsers repo(testFile);
        User* u1 = new User(1);
        u1->addProduct(Product(101));
        u1->addProduct(Product(102));
        repo.addUser(u1);
    } 

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

// Tests adding multiple users and retrieving their IDs and products.
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

// Tests that a user can be found and loaded correctly by ID.
TEST_F(MemoryUsersTest, NoFileBehavior) {
    MemoryUsers repo("non_existent_file.txt");
    EXPECT_TRUE(repo.getUsers().empty());
}