#include <gtest/gtest.h>
#include <vector>
#include "Recommend.h"
#include "MemoryUsers.h"
#include "User.h"
#include "Product.h"

// Testing the recommendation logic for WOLT-19
class RecommendTest : public ::testing::Test {
protected:
    MemoryUsers repo;

    void SetUp() override {
        // Clearing the data before each test
    }
};

/**
 * Just checking that the basic math works.
 */
TEST_F(RecommendTest, BasicFlowFromAppendix) {
    // Setting up User 1 with some products
    User u1(1); 
    u1.addProduct(Product(100)); u1.addProduct(Product(101)); 
    u1.addProduct(Product(102)); u1.addProduct(Product(103));
    
    // User 5 shares 3 products with User 1, so his "weight" is 3
    User u5(5); 
    u5.addProduct(Product(100)); u5.addProduct(Product(102)); 
    u5.addProduct(Product(103)); 
    u5.addProduct(Product(105)); // This is the product we expect to see
    
    repo.addUser(u1);
    repo.addUser(u5);

    Recommend cmd(&repo); 
    auto results = cmd.getRecommendations(1, 104); 
    
    ASSERT_FALSE(results.empty());
    // Product 105 should be first because it got a score of 3
    EXPECT_EQ(results[0].getID(), 105); 
}

/**
 * What happens if two products have the same score?
 * The rules say: sort them by ID (the smaller ID comes first).
 */
TEST_F(RecommendTest, TieBreakerSort) {
    User u1(1); u1.addProduct(Product(100));
    
    // Two different users, each gives a weight of 1 to a different product
    User u2(2); u2.addProduct(Product(100)); u2.addProduct(Product(200));
    User u3(3); u3.addProduct(Product(100)); u3.addProduct(Product(150));

    repo.addUser(u1); repo.addUser(u2); repo.addUser(u3);

    Recommend cmd(&repo);
    auto results = cmd.getRecommendations(1, 999);

    // Both 150 and 200 have score 1, so 150 must be first
    ASSERT_GE(results.size(), 2);
    EXPECT_EQ(results[0].getID(), 150);
    EXPECT_EQ(results[1].getID(), 200);
}

/**
 * If no one shares any products with the user,
 * we shouldn't get any recommendations back.
 */
TEST_F(RecommendTest, NoSharedProductsEmptyResult) {
    User u1(1); u1.addProduct(Product(500));
    User u2(2); u2.addProduct(Product(111)); // No overlap at all

    repo.addUser(u1); repo.addUser(u2);

    Recommend cmd(&repo);
    auto results = cmd.getRecommendations(1, 500);

    EXPECT_TRUE(results.empty());
}

/**
 * Checking the behavior when the target user has already watched some products.
 * These products should be kept in the recommendations if they are popular among similar users.
 */
TEST_F(RecommendTest, KeepAlreadyWatchedProducts) {
    // User 1 already watched 101
    User u1(1); 
    u1.addProduct(Product(100)); 
    u1.addProduct(Product(101));

    // User 2 is similar and also watched 101 and 102
    User u2(2); 
    u2.addProduct(Product(100)); 
    u2.addProduct(Product(101)); 
    u2.addProduct(Product(102));

    repo.addUser(u1); 
    repo.addUser(u2);

    Recommend cmd(&repo);
    auto results = cmd.getRecommendations(1, 100);

    // 101 should still be there, and because 101 < 102, it should be first
    ASSERT_GE(results.size(), 2);
    EXPECT_EQ(results[0].getID(), 101); 
    EXPECT_EQ(results[1].getID(), 102);
}

/**
 * Checking the "Top 10" limit.
 * Even if there are 15 possible products, don't return more than 10.
 */
TEST_F(RecommendTest, MaxTenRecommendations) {
    User target(1); target.addProduct(Product(1));
    repo.addUser(target);

    // Creating 15 users to trigger 15 different recommendations
    for(int i = 2; i <= 16; ++i) {
        User u(i);
        u.addProduct(Product(1)); 
        u.addProduct(Product(1000 + i)); 
        repo.addUser(u);
    }

    Recommend cmd(&repo);
    auto results = cmd.getRecommendations(1, 1);

    // Make sure it cut the list at 10
    EXPECT_LE(results.size(), 10);
}