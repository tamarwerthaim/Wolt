#include <gtest/gtest.h>
#include "POST.h"
#include "IOutput.h"
#include "IUserRepo.h"
#include "User.h"
#include "CommandException.h"
#include <vector>
#include <string>

// A simple IOutput implementation to capture output for testing
class PostOutput : public IOutput {
public:
    std::string lastMessage;
    void write(const std::string& message) override { lastMessage = message; }
};

// A simple IUserRepo implementation to store users in memory for testing
class PostRepo : public IUserRepo {
public:
    std::vector<User*> users;
    bool saveCalled = false;
    void addUser(User* user) override { users.push_back(user); }
    std::vector<User*> getUsers() override { return users; }
    void saveAllToFile() override { saveCalled = true; }
    User* getUserById(int id) override {
        for (auto u : users) if (u->getID() == id) return u;
        return nullptr;
    }
};

// Test fixture for testing the POST command
class POSTTest : public ::testing::Test {
protected:
    PostRepo repo;
    PostOutput out;
};

// Tests that the POST command successfully creates a new user with the specified product list 
TEST_F(POSTTest, CreateNewUserSuccessfully) {
    POST command(repo);
    command.setInput("10 101 102"); 
    command.execute(out);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

/* Tests that the POST command correctly handles the case where a user with the specified ID already exists in the system 
 * and that it throws an appropriate exception indicating a conflict.
*/ 
TEST_F(POSTTest, FailIfUserAlreadyExists) {
    User* existing = new User(10);
    repo.addUser(existing);

    POST command(repo);
    command.setInput("10 101"); 
    
    EXPECT_THROW(command.execute(out), LogicalErrorException);
}

// Tests that the POST command correctly handles the case where the input string is empty 
// and that it throws an appropriate exception indicating a bad request.
TEST_F(POSTTest, Return400ForEmptyInput) {
    POST command(repo);
    command.setInput("");
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

// Tests that the POST command correctly handles the case where the input string contains non-integer characters instead of valid user
TEST_F(POSTTest, Return400IfNoProductsProvided) {
    POST command(repo);
    command.setInput("100"); 
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

// Tests that the POST command correctly handles the case where the input string contains non-integer characters instead of valid user
TEST_F(POSTTest, Return400ForNonNumericInput) {
    POST command(repo);
    command.setInput("10 101 apple");
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

// Tests that the POST command correctly handles the case where the input string contains negative user or product IDs
TEST_F(POSTTest, Return400ForNegativeIds) {
    POST command(repo);
    command.setInput("10 -101");
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

// Tests that the POST command correctly handles the case where the input string contains leading/trailing whitespace and tab/newline characters
TEST_F(POSTTest, HandleDirtyInputWithTabsAndNewlines) {
    POST command(repo);
    command.setInput("  88 \t 101 \n 102    ");
    command.execute(out);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

// Tests that the POST command correctly handles the case where the input string contains extra parameters beyond the expected user ID
TEST_F(POSTTest, ShouldTriggerSaveOnlyOnSuccess) {
    POST command(repo);
    command.setInput("abc 123"); 
    repo.saveCalled = false;
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
    EXPECT_FALSE(repo.saveCalled);
}