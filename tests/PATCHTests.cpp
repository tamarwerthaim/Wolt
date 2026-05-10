#include <gtest/gtest.h>
#include "PATCH.h"
#include "User.h"
#include "Product.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include <vector>
#include <string>

// Simple output mock to capture what the command prints
class PatchMockOutput : public IOutput {
public:
    std::string lastMessage;
    void write(const std::string& message) override { lastMessage = message; }
};

// Simple repo mock to store users in memory
class PatchFakeRepo : public IUserRepo {
public:
    std::vector<User*> users;
    std::vector<User*> getUsers() override { return users; }
    void addUser(User* user) override { users.push_back(user); }
    void saveAllToFile() override { /* Do nothing in tests */ }
    
    User* getUserById(int id) override {
        for (User* u : users) {
            if (u->getID() == id) return u;
        }
        return nullptr;
    }

    ~PatchFakeRepo() {
        for (User* u : users) delete u;
    }
};

// Successful update of an existing user
TEST(PATCHTest, UpdateExistingUserSuccessfully) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    
    // Setup: Add a user with ID 1 to the repo first
    repo.addUser(new User(1));
    
    // Command: PATCH user 1 with products 101 and 102
    PATCH command(repo, out, "1 101 102"); 
    command.execute();

    // Verify: Should return 204 and user should have 2 products
    EXPECT_EQ(out.lastMessage, "204 No Content\n");
    EXPECT_EQ(repo.getUserById(1)->getProducts().size(), 2);
}

// Failure when user does not exist
TEST(PATCHTest, FailWhenUserNotFound) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    
    // Command: Try to patch user 999 (doesn't exist)
    PATCH command(repo, out, "999 101"); 
    command.execute();

    // Verify: According to requirements, should return 404
    EXPECT_EQ(out.lastMessage, "404 Not Found\n");
}

// Invalid input format (e.g., characters instead of IDs)
TEST(PATCHTest, Return400ForInvalidInput) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    repo.addUser(new User(1));

    // Command: Input contains letters
    PATCH command(repo, out, "1 10a 102"); 
    command.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

// Empty input string
TEST(PATCHTest, Return400ForEmptyInput) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    
    PATCH command(repo, out, ""); 
    command.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

// Missing product IDs (only user ID provided)
TEST(PATCHTest, Return400IfNoProductsProvided) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    repo.addUser(new User(10));

    PATCH command(repo, out, "10"); 
    command.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

// Handling duplicate products in the input string
TEST(PATCHTest, ShouldIgnoreDuplicateProductsInInput) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    repo.addUser(new User(5));

    // Input has product 100 twice
    PATCH command(repo, out, "5 100 100"); 
    command.execute();

    // Verify: 204 returned, but only 1 product added (due to set)
    EXPECT_EQ(out.lastMessage, "204 No Content\n");
    EXPECT_EQ(repo.getUserById(5)->getProducts().size(), 1);
}

// Adding products to a user who already has products
TEST(PATCHTest, MergeProductsWithExistingList) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    
    User* u = new User(1);
    u->addProduct(Product(50)); // User already watched product 50
    repo.addUser(u);

    // PATCH adds product 60
    PATCH command(repo, out, "1 60"); 
    command.execute();

    // Total products should now be 2 (50 and 60)
    EXPECT_EQ(repo.getUserById(1)->getProducts().size(), 2);
    EXPECT_EQ(out.lastMessage, "204 No Content\n");
}