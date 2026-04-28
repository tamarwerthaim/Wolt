#include <gtest/gtest.h>
#include <vector>
#include "Recommend.h"
#include "MemoryUsers.h"
#include "User.h"
#include "Product.h"

// Tests for the recommendation engine logic
class RecommendTest : public ::testing::Test {
protected:
    MemoryUsers repo;

    void SetUp() override {
        // Setup can be added here if needed later
    }
};

// Basic test - check if scores and weight work for a similar user
TEST_F(RecommendTest, BasicFlowFromAppendix) {
    User u1(1); 
    u1.addProduct(Product(100)); u1.addProduct(Product(101)); 
    u1.addProduct(Product(102)); u1.addProduct(Product(103));
    u1.addProduct(Product(104)); // Current product context
    
    User u5(5); 
    u5.addProduct(Product(100)); u5.addProduct(Product(102)); 
    u5.addProduct(Product(103)); 
    u5.addProduct(Product(104)); // Shared context item
    u5.addProduct(Product(105)); // Expected recommendation
    
    repo.addUser(&u1);
    repo.addUser(&u5);

    Recommend cmd("1 104", nullptr, &repo);
    auto results = cmd.getRecommendations(1, 104); 
    
    ASSERT_FALSE(results.empty());
    EXPECT_EQ(results[0].getID(), 105); 
}

// Tie-breaker: if scores are the same, smaller ID should be first
TEST_F(RecommendTest, TieBreakerSort) {
    User u1(1); u1.addProduct(Product(100)); u1.addProduct(Product(999));
    
    User u2(2); u2.addProduct(Product(100)); u2.addProduct(Product(200)); u2.addProduct(Product(999));
    User u3(3); u3.addProduct(Product(100)); u3.addProduct(Product(150)); u3.addProduct(Product(999));

    repo.addUser(&u1); repo.addUser(&u2); repo.addUser(&u3);

    Recommend cmd("1 999", nullptr, &repo);
    auto results = cmd.getRecommendations(1, 999);

    ASSERT_GE(results.size(), 2);
    EXPECT_EQ(results[0].getID(), 150);
    EXPECT_EQ(results[1].getID(), 200);
}

// No common products between users means no recommendations
TEST_F(RecommendTest, NoSharedProductsEmptyResult) {
    User u1(1); u1.addProduct(Product(500));
    User u2(2); u2.addProduct(Product(111)); 

    repo.addUser(&u1); repo.addUser(&u2);

    Recommend cmd("1 500", nullptr, &repo);
    auto results = cmd.getRecommendations(1, 500);

    EXPECT_TRUE(results.empty());
}

// Case where the user ID isn't in the repository
TEST_F(RecommendTest, UserNotFoundInRepo) {
    User u1(1); u1.addProduct(Product(100));
    repo.addUser(&u1);

    Recommend cmd("99 100", nullptr, &repo);
    auto results = cmd.getRecommendations(99, 100); 

    EXPECT_TRUE(results.empty());
}

// Influence check: user with more common items counts more
TEST_F(RecommendTest, WeightMathVerification) {
    User target(1); 
    target.addProduct(Product(10)); target.addProduct(Product(20)); target.addProduct(Product(100));

    User userA(2);
    userA.addProduct(Product(10)); userA.addProduct(Product(20)); 
    userA.addProduct(Product(100)); userA.addProduct(Product(50));

    User userB(3);
    userB.addProduct(Product(10)); userB.addProduct(Product(100)); userB.addProduct(Product(60));

    repo.addUser(&target); repo.addUser(&userA); repo.addUser(&userB);

    Recommend cmd("1 100", nullptr, &repo);
    auto results = cmd.getRecommendations(1, 100);

    ASSERT_GE(results.size(), 2);
    EXPECT_EQ(results[0].getID(), 50); 
}

// Checking the 10-limit and sorting when many users recommend items
TEST_F(RecommendTest, MaxTenWithTieBreaker) {
    User target(1); 
    target.addProduct(Product(100));
    target.addProduct(Product(999)); 
    repo.addUser(&target);

    std::vector<User> users_pool;
    users_pool.reserve(15); 

    for(int i = 10; i <= 20; ++i) { 
        users_pool.emplace_back(i);
        users_pool.back().addProduct(Product(100)); 
        users_pool.back().addProduct(Product(999)); 
        users_pool.back().addProduct(Product(i + 1000)); 
        repo.addUser(&users_pool.back());
    }

    Recommend cmd("1 100", nullptr, &repo);
    auto results = cmd.getRecommendations(1, 100);

    ASSERT_EQ(results.size(), 10);
    EXPECT_EQ(results[0].getID(), 1010); 
    EXPECT_EQ(results[9].getID(), 1019); 
}

// Filter check: don't recommend products the user already has
TEST_F(RecommendTest, HighSimilarityButAlmostAllSeen) {
    User target(1);
    target.addProduct(10); target.addProduct(20); target.addProduct(30); target.addProduct(100);

    User similar(2);
    similar.addProduct(10); similar.addProduct(20); similar.addProduct(30); 
    similar.addProduct(100); similar.addProduct(50); 

    repo.addUser(&target); repo.addUser(&similar);

    Recommend cmd("1 100", nullptr, &repo);
    auto results = cmd.getRecommendations(1, 100);

    ASSERT_EQ(results.size(), 1);
    EXPECT_EQ(results[0].getID(), 50); 
}

// All items offered are already seen - expecting empty results
TEST_F(RecommendTest, TargetUserSawEverything) {
    User target(1);
    target.addProduct(Product(10)); target.addProduct(Product(20)); target.addProduct(Product(100));
    repo.addUser(&target);

    User similar(2);
    similar.addProduct(Product(100)); similar.addProduct(Product(10)); similar.addProduct(Product(20));
    repo.addUser(&similar);

    Recommend cmd("1 100", nullptr, &repo);
    auto results = cmd.getRecommendations(1, 100);

    EXPECT_TRUE(results.empty());
}

// Product 999 doesn't exist in any user list
TEST_F(RecommendTest, OrphanProductContext) {
    User u1(1); u1.addProduct(Product(100));
    User u2(2); u2.addProduct(Product(200));
    
    repo.addUser(&u1);
    repo.addUser(&u2);

    Recommend cmd("1 999", nullptr, &repo);
    auto results = cmd.getRecommendations(1, 999);

    EXPECT_TRUE(results.empty());
}

// Duplicate test: handles adding the same user multiple times
TEST_F(RecommendTest, IntegrityCheckDuplicateData) {
    User target(1); 
    target.addProduct(Product(100));
    target.addProduct(Product(999)); 
    repo.addUser(&target);

    User u2(2);
    u2.addProduct(Product(100));
    u2.addProduct(Product(999));
    u2.addProduct(Product(200)); 
    
    repo.addUser(&u2);
    repo.addUser(&u2); 

    Recommend cmd("1 100", nullptr, &repo);
    auto results = cmd.getRecommendations(1, 100);

    ASSERT_FALSE(results.empty());
    EXPECT_EQ(results[0].getID(), 200);
}
// Check if the parser handles many spaces between IDs correctly
TEST_F(RecommendTest, InputWithMultipleSpaces) {
    // Both users watch 104 (context) and 999 (shared anchor)
    User u1(1); 
    u1.addProduct(Product(104)); 
    u1.addProduct(Product(999));
    
    User u2(2); 
    u2.addProduct(Product(104)); 
    u2.addProduct(Product(999)); 
    u2.addProduct(Product(105)); // Recommendation
    
    repo.addUser(&u1); 
    repo.addUser(&u2);

    // This creates the command with the "spaced" string
    Recommend cmd("1    104", nullptr, &repo);
    
    // We call the logic - weight will be 1
    auto results = cmd.getRecommendations(1, 104);

    ASSERT_FALSE(results.empty());
    EXPECT_EQ(results[0].getID(), 105);
}

// Check that input with only one number is invalid
TEST_F(RecommendTest, InvalidInputMissingId) {
    // String has only userId, missing productId
    Recommend cmd("1", nullptr, &repo);
    
    auto results = cmd.getRecommendations(0, 0); 
    EXPECT_TRUE(results.empty());
}

// Check that non-numeric input (letters) causes a failure
TEST_F(RecommendTest, InvalidInputAlphaCharacters) {
    // "abc" instead of a numeric ID
    Recommend cmd("1 abc", nullptr, &repo);
    
    auto results = cmd.getRecommendations(0, 0);
    EXPECT_TRUE(results.empty());
}

// Check that having more than 2 parameters is invalid
TEST_F(RecommendTest, InvalidInputExtraData) {
    Recommend cmd("1 100 200", nullptr, &repo);
    
    auto results = cmd.getRecommendations(0, 0);
    EXPECT_TRUE(results.empty());
}

// Check that a completely empty string is handled safely
TEST_F(RecommendTest, EmptyInputString) {
    Recommend cmd("", nullptr, &repo);
    
    auto results = cmd.getRecommendations(0, 0);
    EXPECT_TRUE(results.empty());
}