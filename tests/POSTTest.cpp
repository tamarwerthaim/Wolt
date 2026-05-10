#include <gtest/gtest.h>
#include "POST.h"
#include "User.h"
#include "Product.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include <vector>
#include <string>
#include <climits> 

// A fake output class to capture messages sent by the server
class MockOutput : public IOutput {
public:
    std::string lastMessage;
    // Save the message so we can check it in the test
    void write(std::string message) override {
        lastMessage = message;
    }
};

// A fake repository to store users in memory during tests
class FakeRepo : public IUserRepo {
public:
    std::vector<User*> users;
    std::vector<User*> getUsers() override { return users; }
    void addUser(User* user) override { users.push_back(user); }
    void saveAllToFile() override { /* Do nothing in tests */ }
    
    // Clean up memory to avoid leaks
    ~FakeRepo() {
        for (User* u : users) delete u;
    }
};

TEST(POSTTest, CreateNewUserSuccessfully) {
    FakeRepo repo;
    MockOutput out;
    // User 10 doesn't exist, this should work
    POST command(repo, out, "10 101 102"); 

    command.execute();

    // Verify the user was created and the status is 201
    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getID(), 10);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

TEST(POSTTest, HandleDuplicateProductsInInput) {
    FakeRepo repo;
    MockOutput out;
    // Input has duplicate product IDs (50, 50)
    POST command(repo, out, "1 50 50");  

    command.execute();

    // Verify user is created and duplicates are ignored by the set
    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getProducts().size(), 1);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

TEST(POSTTest, FailIfUserAlreadyExists) {
    FakeRepo repo;
    MockOutput out;
    
    // Setup: Add a user with ID 10 to the repository first
    repo.addUser(new User(10));
    
    // Try to run POST on the same ID (should fail for POST)
    POST command(repo, out, "10 101"); 
    command.execute();

    // No new user should be added
    EXPECT_EQ(repo.users.size(), 1);
    // According to the requirements, return 404 if user already exists
    EXPECT_EQ(out.lastMessage, "404 Not Found\n");
}


TEST(POSTTest, Return400ForEmptyInput) {
    FakeRepo repo;
    MockOutput out;
    POST command(repo, out, ""); 

    command.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

TEST(POSTTest, Return400IfNoProductsProvided) {
    FakeRepo repo;
    MockOutput out;
    // User ID 100 provided but no products
    POST command(repo, out, "100"); 

    command.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
    EXPECT_EQ(repo.users.size(), 0);
}

TEST(POSTTest, Return400ForNonNumericInput) {
    FakeRepo repo;
    MockOutput out;
    // "apple" is not a valid ID
    POST command(repo, out, "10 101 apple"); 

    command.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
    EXPECT_EQ(repo.users.size(), 0);
}

TEST(POSTTest, Return400ForNegativeIds) {
    FakeRepo repo;
    MockOutput out;
    // Negative IDs are not allowed
    POST command(repo, out, "10 -101"); 
    command.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
    EXPECT_EQ(repo.users.size(), 0);
}

TEST(POSTTest, SequentialDoublePostShouldFailSecondTime) {
    FakeRepo repo;
    MockOutput out;
    std::string input = "500 1 2 3";

    // First time: Should succeed
    POST cmd1(repo, out, input);
    cmd1.execute();
    EXPECT_EQ(out.lastMessage, "201 Created\n");

    // Second time: Same ID, should fail even if products are different
    POST cmd2(repo, out, "500 99"); 
    cmd2.execute();
    
    EXPECT_EQ(out.lastMessage, "404 Not Found\n");
    // Ensure we still have only one user in the repo
    EXPECT_EQ(repo.users.size(), 1);
}

TEST(POSTTest, HandleMaximumIntegerId) {
    FakeRepo repo;
    MockOutput out;
    // Use the largest possible integer as ID
    std::string largeId = std::to_string(INT_MAX) + " 101";
    POST command(repo, out, largeId);

    command.execute();

    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getID(), INT_MAX);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

// We need to update FakeRepo slightly to track if save was called
class SpyRepo : public FakeRepo {
public:
    bool saveCalled = false;
    void saveAllToFile() override { saveCalled = true; }
};

TEST(POSTTest, ShouldTriggerSaveOnlyOnSuccess) {
    SpyRepo repo;
    MockOutput out;

    // 1. Case: Failure (Bad Input)
    POST failCmd(repo, out, "abc 123");
    failCmd.execute();
    EXPECT_FALSE(repo.saveCalled); // Should NOT save on error

    // 2. Case: Success
    POST successCmd(repo, out, "777 1");
    successCmd.execute();
    EXPECT_TRUE(repo.saveCalled); // MUST save on success
}

TEST(POSTTest, HandleDirtyInputWithTabsAndNewlines) {
    FakeRepo repo;
    MockOutput out;
    // Input with tabs (\t) and multiple spaces
    std::string dirtyInput = "  88 \t 101 \n 102    "; 
    POST command(repo, out, dirtyInput);

    command.execute();

    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getID(), 88);
    EXPECT_EQ(repo.users[0]->getProducts().size(), 2);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

TEST(POSTTest, HandleHugeAmountOfUniqueProducts) {
    FakeRepo repo;
    MockOutput out;
    std::string input = "999";
    for(int i = 0; i < 500; i++) {
        input += " " + std::to_string(i); // Add products 0 to 499
    }

    POST command(repo, out, input);
    command.execute();

    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getProducts().size(), 500);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

TEST(POSTTest, HandleZeroIdsAndLeadingZeros) {
    FakeRepo repo;
    MockOutput out;
    // User ID is 0, Product ID is 07 (which should be treated as 7)
    POST command(repo, out, "0 07");

    command.execute();

    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users[0]->getID(), 0);
    EXPECT_EQ(*(repo.users[0]->getProducts().begin()), 7);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

TEST(POSTTest, RejectHexadecimalInput) {
    FakeRepo repo;
    MockOutput out;
    // 0x1A is 26 in Hex. A strict parser should probably reject this as "Bad Request"
    // or at least not treat it as a number if we only want decimals.
    POST command(repo, out, "10 0x1A");

    command.execute();

    // If your parser is strict, this should be a 400 error
    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

TEST(POSTTest, HandleExtremelyLongInputString) {
    FakeRepo repo;
    MockOutput out;
    
    // Create a string with a valid ID and 10,000 product IDs
    std::string longInput = "500";
    for(int i = 0; i < 10000; i++) {
        longInput += " " + std::to_string(i);
    }

    POST command(repo, out, longInput);
    
    // This should not crash and should complete successfully
    EXPECT_NO_THROW(command.execute());
    EXPECT_EQ(out.lastMessage, "201 Created\n");
    EXPECT_EQ(repo.users[0]->getProducts().size(), 10000);
}