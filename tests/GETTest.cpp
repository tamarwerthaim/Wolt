#include <gtest/gtest.h>
#include <vector>
#include <fstream>
#include <string>
#include "GET.h"
#include "MemoryUsers.h"
#include "User.h"
#include "Product.h"
#include "IOutput.h"
#include "CommandException.h"

// A simple IOutput implementation to capture output for testing
class GetMockOutput : public IOutput {
public:
    std::string captured;
    void write(const std::string& message) override { captured += message; }
    void clear() { captured = ""; }
};

// Test fixture for testing the GET command
class GETTest : public ::testing::Test {
protected:
    MemoryUsers* repo;
    GetMockOutput out;

    void SetUp() override {
        // Clear the database file first
        std::ofstream ofs("users_db.txt", std::ios::trunc);
        ofs.close();

        // Fresh repo for every test
        repo = new MemoryUsers("users_db.txt");
    }

    // Clean up after each test
    void TearDown() override {
        delete repo;
    }
};

// tests that the GET command correctly generates product recommendations based on user similarity 
// and that it returns the expected product IDs in the correct order.
TEST_F(GETTest, BasicFlowFromAppendix) {
    User* u1 = new User(1); 
    u1->addProduct(Product(100)); u1->addProduct(Product(101)); 
    u1->addProduct(Product(102)); u1->addProduct(Product(103));
    u1->addProduct(Product(104)); // Current context
    
    User* u5 = new User(5); 
    u5->addProduct(Product(100)); u5->addProduct(Product(102)); 
    u5->addProduct(Product(103)); 
    u5->addProduct(Product(104)); // Shared context
    u5->addProduct(Product(105)); // Expected recommendation
    
    repo->addUser(u1);
    repo->addUser(u5);

    GET cmd(repo);
    auto results = cmd.getRecommendations(1, 104); 
    
    ASSERT_FALSE(results.empty());
    EXPECT_EQ(results[0].getID(), 105); 
}

// Tests that the GET command correctly handles the case where the input string is missing required parameters 
// and that it throws an appropriate exception.
TEST_F(GETTest, TieBreakerSort) {
    User* u1 = new User(1); u1->addProduct(Product(100)); u1->addProduct(Product(999));
    User* u2 = new User(2); u2->addProduct(Product(100)); u2->addProduct(Product(200)); u2->addProduct(Product(999));
    User* u3 = new User(3); u3->addProduct(Product(100)); u3->addProduct(Product(150)); u3->addProduct(Product(999));

    repo->addUser(u1); repo->addUser(u2); repo->addUser(u3);

    GET cmd(repo);
    auto results = cmd.getRecommendations(1, 999);

    ASSERT_GE(results.size(), 2);
    // 150 has smaller ID than 200, so it comes first in a tie
    EXPECT_EQ(results[0].getID(), 150);
    EXPECT_EQ(results[1].getID(), 200);
}

// Tests that the GET command correctly handles the case where the specified user ID does not exist in the repository
// and that it throws an appropriate exception.
TEST_F(GETTest, WeightMathVerification) {
    User* target = new User(1); 
    target->addProduct(Product(10)); target->addProduct(Product(20)); target->addProduct(Product(100));

    User* userA = new User(2);
    userA->addProduct(Product(10)); userA->addProduct(Product(20)); 
    userA->addProduct(Product(100)); userA->addProduct(Product(50));

    User* userB = new User(3);
    userB->addProduct(Product(10)); userB->addProduct(Product(100)); userB->addProduct(Product(60));

    repo->addUser(target); repo->addUser(userA); repo->addUser(userB);

    GET cmd(repo);
    auto results = cmd.getRecommendations(1, 100);

    // User A shares 2 items (weight 2), User B shares 1 item (weight 1)
    // Product 50 should have higher score than 60
    ASSERT_GE(results.size(), 2);
    EXPECT_EQ(results[0].getID(), 50); 
}

// Tests that the GET command correctly limits the number of recommendations to a maximum of 10 
// and that it returns the expected products when there are more than 10 potential recommendations.
TEST_F(GETTest, MaxTenLimit) {
    User* target = new User(1); 
    target->addProduct(Product(100));
    target->addProduct(Product(999)); // Anchor product to establish weight
    repo->addUser(target);

    // Add 15 users, each recommending a unique product
    for(int i = 10; i <= 25; ++i) { 
        User* u = new User(i);
        u->addProduct(Product(100)); 
        u->addProduct(Product(999)); // Shared anchor
        u->addProduct(Product(i + 1000)); 
        repo->addUser(u);
    }

    GET cmd(repo);
    auto results = cmd.getRecommendations(1, 100);

    // Even with 15 options, only return top 10
    EXPECT_EQ(results.size(), 10);
}

// Tests that the GET command does not recommend products that the user has already seen 
// and that it correctly filters out those products from the recommendation list.
TEST_F(GETTest, FilterAlreadySeenProducts) {
    User* target = new User(1);
    target->addProduct(10); target->addProduct(100);

    User* similar = new User(2);
    similar->addProduct(10); similar->addProduct(100); 
    similar->addProduct(50); // New product

    repo->addUser(target); repo->addUser(similar);

    GET cmd(repo);
    auto results = cmd.getRecommendations(1, 100);

    // Should not recommend products 10 or 100
    ASSERT_EQ(results.size(), 1);
    EXPECT_EQ(results[0].getID(), 50); 
}

// Tests that the GET command correctly handles the case where the input string contains non-integer characters 
// and that it throws an appropriate exception.
TEST_F(GETTest, ValidExecutionProtocol) {
    User* u1 = new User(1); u1->addProduct(100); u1->addProduct(500); u1->addProduct(200);
    User* u2 = new User(2); u2->addProduct(100); u2->addProduct(500); u2->addProduct(300);
    repo->addUser(u1); repo->addUser(u2);

    GET cmd(repo);
    cmd.setInput("1 100");
    cmd.execute(out);

    EXPECT_TRUE(out.captured.find("200 Ok") != std::string::npos);
    EXPECT_TRUE(out.captured.find("300") != std::string::npos);
}

// Tests that the GET command correctly handles the case where the input string contains multiple spaces between parameters
// and that it still processes the command successfully without throwing an exception.
TEST_F(GETTest, InputWithMultipleSpaces) {
    User* u1 = new User(1); u1->addProduct(100); u1->addProduct(500); u1->addProduct(200);
    User* u2 = new User(2); u2->addProduct(100); u2->addProduct(500); u2->addProduct(300);
    repo->addUser(u1); repo->addUser(u2);

    GET cmd(repo);
    cmd.setInput("1    100"); 
    cmd.execute(out);

    EXPECT_TRUE(out.captured.find("200 Ok") != std::string::npos);
    EXPECT_TRUE(out.captured.find("300") != std::string::npos);
}

// Tests that the GET command correctly handles the case where the input string is missing required parameters 
// and that it throws an appropriate exception.
TEST_F(GETTest, InvalidInputMissingId) {
    GET cmd(repo);
    cmd.setInput("1"); 
    EXPECT_THROW(cmd.execute(out), InvalidInputException);
}

// Tests that the GET command correctly handles the case where the input string contains non-integer characters instead of valid user 
// and product IDs and that it throws an appropriate exception.
TEST_F(GETTest, InvalidInputAlphaCharacters) {
    GET cmd(repo);
    cmd.setInput("1 abc"); 
    EXPECT_THROW(cmd.execute(out), InvalidInputException);
}

// Tests that the GET command correctly handles the case where the input string contains extra parameters beyond the expected user ID 
// and product ID and that it throws an appropriate exception.
TEST_F(GETTest, InvalidInputExtraData) {
    GET cmd(repo);
    cmd.setInput("1 100 200"); 
    EXPECT_THROW(cmd.execute(out), InvalidInputException);
}

// Tests that the GET command correctly handles the case where the specified product ID does not exist in any user's product list 
// and that it returns an empty recommendation list without throwing an exception.
TEST_F(GETTest, OrphanProductContextEmptyResult) {
    User* u1 = new User(1); u1->addProduct(100);
    repo->addUser(u1);

    GET cmd(repo);
    cmd.setInput("1 999"); 
    cmd.execute(out);

    EXPECT_TRUE(out.captured.find("200 Ok") != std::string::npos);
}

// Tests that the GET command correctly handles the case where the specified user ID does not exist in the repository 
// and that it throws an appropriate exception.
TEST_F(GETTest, UserNotFoundInRepoProtocol) {
    GET cmd(repo);
    cmd.setInput("99 100");
    EXPECT_THROW(cmd.execute(out), LogicalErrorException);
}