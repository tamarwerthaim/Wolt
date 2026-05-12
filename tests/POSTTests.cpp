#include <gtest/gtest.h>
#include "POST.h"
#include "IOutput.h"
#include "IUserRepo.h"
#include "User.h"
#include "CommandException.h"
#include <vector>
#include <string>

class PostOutput : public IOutput {
public:
    std::string lastMessage;
    void write(const std::string& message) override { lastMessage = message; }
};

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

class POSTTest : public ::testing::Test {
protected:
    PostRepo repo;
    PostOutput out;
};

TEST_F(POSTTest, CreateNewUserSuccessfully) {
    POST command(repo);
    command.setInput("10 101 102"); 
    command.execute(out);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

TEST_F(POSTTest, FailIfUserAlreadyExists) {
    User* existing = new User(10);
    repo.addUser(existing);

    POST command(repo);
    command.setInput("10 101"); 
    
    EXPECT_THROW(command.execute(out), LogicalErrorException);
}

TEST_F(POSTTest, Return400ForEmptyInput) {
    POST command(repo);
    command.setInput("");
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

TEST_F(POSTTest, Return400IfNoProductsProvided) {
    POST command(repo);
    command.setInput("100"); 
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

TEST_F(POSTTest, Return400ForNonNumericInput) {
    POST command(repo);
    command.setInput("10 101 apple");
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

TEST_F(POSTTest, Return400ForNegativeIds) {
    POST command(repo);
    command.setInput("10 -101");
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
}

TEST_F(POSTTest, HandleDirtyInputWithTabsAndNewlines) {
    POST command(repo);
    command.setInput("  88 \t 101 \n 102    ");
    command.execute(out);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

TEST_F(POSTTest, ShouldTriggerSaveOnlyOnSuccess) {
    POST command(repo);
    command.setInput("abc 123"); 
    repo.saveCalled = false;
    
    EXPECT_THROW(command.execute(out), InvalidInputException);
    EXPECT_FALSE(repo.saveCalled);
}