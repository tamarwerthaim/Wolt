#include <gtest/gtest.h>
#include "PATCH.h"
#include "User.h"
#include "Product.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include "CommandException.h"
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

// tests that the PATCH command successfully updates an existing user's product list by adding new products 
// and that it returns the correct status message indicating a successful update.
TEST(PATCHTest, UpdateExistingUserSuccessfully) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    
    repo.addUser(new User(1));
    
    PATCH command(repo); 
    command.setInput("1 101 102");
    command.execute(out);

    EXPECT_EQ(out.lastMessage, "204 No Content\n");
    EXPECT_EQ(repo.getUserById(1)->getProducts().size(), 2);
}

// Tests that the PATCH command correctly handles the case where the specified user ID does not exist in the system 
// and that it throws an appropriate exception indicating that the user was not found.
TEST(PATCHTest, FailWhenUserNotFound) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    
    PATCH command(repo); 
    command.setInput("999 101");
    
    EXPECT_THROW(command.execute(out), LogicalErrorException);
}

// Tests that the PATCH command correctly handles the case where the input string contains non-integer characters instead of valid user
// and product IDs and that it throws an appropriate exception indicating a bad request.
TEST(PATCHTest, Return400ForInvalidInput) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    repo.addUser(new User(1));

    PATCH command(repo); 
    command.setInput("1 10a 102");
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

// Empty input string
TEST(PATCHTest, Return400ForEmptyInput) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    
    PATCH command(repo); 
    command.setInput("");
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

// Missing product IDs (only user ID provided)
TEST(PATCHTest, Return400IfNoProductsProvided) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    repo.addUser(new User(10));

    PATCH command(repo); 
    command.setInput("10");
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

// Handling duplicate products in the input string
TEST(PATCHTest, ShouldIgnoreDuplicateProductsInInput) {
    PatchFakeRepo repo;
    PatchMockOutput out;
    repo.addUser(new User(5));

    PATCH command(repo); 
    command.setInput("5 100 100");
    command.execute(out);

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

    PATCH command(repo); 
    command.setInput("1 60");
    command.execute(out);
    EXPECT_EQ(repo.getUserById(1)->getProducts().size(), 2);
    EXPECT_EQ(out.lastMessage, "204 No Content\n");
}