#include <gtest/gtest.h>
#include "Add.h"
#include "User.h"
#include "Product.h"
#include "IUserRepo.h"
#include <vector>
#include <string>

// A fake repository to store users in memory during tests
class FakeRepo : public IUserRepo {
public:
    std::vector<User*> users;
    std::vector<User*> getUsers() override { return users; }
    void addUser(User* user) override { users.push_back(user); }
    
    // Clean up memory after tests
    ~FakeRepo() {
        for (User* u : users) delete u;
    }
};

TEST(AddTest, ShouldDoNothingIfInputIsEmpty) {
    FakeRepo repo;
    std::string emptyInput = ""; 

    Add command(repo, emptyInput);
    command.execute();

    // Verify that no user was created
    EXPECT_EQ(repo.users.size(), 0);
}

TEST(AddTest, ShouldNotCreateUserIfNoProductsProvided) {
    FakeRepo repo;
    std::string onlyUser = "100"; // User ID exists but no products

    Add command(repo, onlyUser);
    command.execute();

    // Verify that the user was not created because the product list is empty
    EXPECT_EQ(repo.users.size(), 0);
}

TEST(AddTest, ShouldCreateUserIfMissing) {
    FakeRepo repo;
    Add command(repo, "10 101"); 
    command.execute();

    // Check if the user was created correctly with the right ID
    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getID(), 10);
}

TEST(AddTest, ShouldHandleDuplicateProductsInInput) {
    FakeRepo repo;
    Add command(repo, "1 50 50");  

    command.execute();

    // The set should ignore the duplicate product ID
    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getProducts().size(), 1);
}

TEST(AddTest, ShouldHandleMultipleSpacesInInput) {
    FakeRepo repo;
    // Input with many spaces between numbers
    Add command(repo, "7    1   2     3"); 

    command.execute();

    // Check if the parser ignored the extra spaces
    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getProducts().size(), 3);
}

TEST(AddTest, ShouldIgnoreEntireLineIfContainsInvalidWord) {
    FakeRepo repo;
    // Input contains a word "apple" instead of a number
    std::string messyInput = "10 101 apple 102"; 

    Add command(repo, messyInput);
    command.execute();

    // The whole line should be ignored
    EXPECT_EQ(repo.users.size(), 0);
}

TEST(AddTest, ShouldIgnoreLineIfTokenIsMixedAlphaNumeric) {
    FakeRepo repo;
    // Input contains "1a" which is invalid
    std::string mixedInput = "10 101 1a"; 

    Add command(repo, mixedInput);
    command.execute();

    // Verify the system rejected the mixed input
    EXPECT_EQ(repo.users.size(), 0);
}

TEST(AddTest, ShouldIgnoreLineWithFloatingPointNumbers) {
    FakeRepo repo;
    // Decimal numbers are not allowed
    Add command(repo, "10 101.5 102"); 
    command.execute();

    EXPECT_EQ(repo.users.size(), 0);
}

TEST(AddTest, ShouldIgnoreLineWithOverflowNumbers) {
    FakeRepo repo;
    // Very large number that exceeds int capacity
    Add command(repo, "10 99999999999999999999"); 
    command.execute();

    EXPECT_EQ(repo.users.size(), 0);
}

TEST(AddTest, ShouldIgnoreLineWithPunctuation) {
    FakeRepo repo;
    // Commas are not valid separators
    Add command(repo, "10, 101, 102"); 
    command.execute();

    EXPECT_EQ(repo.users.size(), 0);
}

TEST(AddTest, ShouldIgnoreNegativeIds) {
    FakeRepo repo;
    // ID numbers must be positive
    Add command(repo, "10 -101"); 
    command.execute();

    EXPECT_EQ(repo.users.size(), 0); 
}

TEST(AddTest, ShouldHandleLargeNumberOfProducts) {
    FakeRepo repo;
    int userId = 99;
    int numberOfProducts = 1000; 
    
    // Create a very long input string with 1000 products
    std::string largeInput = std::to_string(userId);
    for (int i = 1; i <= numberOfProducts; ++i) {
        largeInput += " " + std::to_string(i);
    }

    Add command(repo, largeInput);
    command.execute();

    // Verify that all 1000 products were added successfully
    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getID(), userId);
    EXPECT_EQ(repo.users[0]->getProducts().size(), numberOfProducts);
}