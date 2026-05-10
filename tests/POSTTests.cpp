#include <gtest/gtest.h>
#include "POST.h"
#include "User.h"
#include "Product.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include <vector>
#include <string>
#include <climits> 

// Mock output to capture terminal messages
class PostOutput : public IOutput {
public:
    std::string lastMessage;
    void write(const std::string& message) override {
        lastMessage = message;
    }
};

// Mock repository for managing users in memory
class PostRepo : public IUserRepo {
public:
    std::vector<User*> users;
    std::vector<User*> getUsers() override { return users; }
    void addUser(User* user) override { users.push_back(user); }
    void saveAllToFile() override { /* Not needed for unit tests */ }
    
    ~PostRepo() {
        for (User* u : users) {
            if (u != nullptr) delete u;
        }
        users.clear();
    }
    
    User* getUserById(int id) override {
        for (User* u : users) {
            if (u != nullptr && u->getID() == id) return u;
        }
        return nullptr;
    }
};

// --- POST Command Tests ---

// Verifies a user is successfully created with valid input
TEST(POSTTest, CreateNewUserSuccessfully) {
    PostRepo repo;
    PostOutput out;
    POST command(repo, out, "10 101 102"); 

    command.execute();

    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users.at(0)->getID(), 10);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

// Ensures duplicate product IDs are filtered out
TEST(POSTTest, HandleDuplicateProductsInInput) {
    PostRepo repo;
    PostOutput out;
    POST command(repo, out, "1 50 50");  

    command.execute();

    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users.at(0)->getProducts().size(), 1); 
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}

// Returns 404 if the user ID already exists in the system
TEST(POSTTest, FailIfUserAlreadyExists) {
    PostRepo repo;
    PostOutput out;
    repo.addUser(new User(10));
    
    POST command(repo, out, "10 101"); 
    command.execute();

    EXPECT_EQ(repo.users.size(), 1);
    EXPECT_EQ(out.lastMessage, "404 Not Found\n");
}

// Returns 400 if the input string is empty
TEST(POSTTest, Return400ForEmptyInput) {
    PostRepo repo;
    PostOutput out;
    POST command(repo, out, ""); 

    command.execute();
    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

// Returns 400 if only the user ID is provided without products
TEST(POSTTest, Return400IfNoProductsProvided) {
    PostRepo repo;
    PostOutput out;
    POST command(repo, out, "100"); 

    command.execute();
    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

// Returns 400 if the input contains non-numeric characters
TEST(POSTTest, Return400ForNonNumericInput) {
    PostRepo repo;
    PostOutput out;
    POST command(repo, out, "10 101 apple"); 

    command.execute();
    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

// Returns 400 if IDs are negative numbers
TEST(POSTTest, Return400ForNegativeIds) {
    PostRepo repo;
    PostOutput out;
    POST command(repo, out, "10 -101"); 
    command.execute();

    EXPECT_EQ(out.lastMessage, "400 Bad Request\n");
}

// Verifies that re-adding the same user fails the second time
TEST(POSTTest, SequentialDoublePostShouldFailSecondTime) {
    PostRepo repo;
    PostOutput out;
    POST cmd1(repo, out, "500 1 2 3");
    cmd1.execute();
    EXPECT_EQ(out.lastMessage, "201 Created\n");

    POST cmd2(repo, out, "500 99"); 
    cmd2.execute();
    
    EXPECT_EQ(out.lastMessage, "404 Not Found\n");
    EXPECT_EQ(repo.users.size(), 1);
}

// Mock repo to verify if the save function was triggered
class PostSpyRepo : public PostRepo {
public:
    bool saveCalled = false;
    void saveAllToFile() override { saveCalled = true; }
};

// Ensures the file is updated only after a successful POST
TEST(POSTTest, ShouldTriggerSaveOnlyOnSuccess) {
    PostSpyRepo repo;
    PostOutput out;

    // Should not save on error
    POST failCmd(repo, out, "abc 123");
    failCmd.execute();
    EXPECT_FALSE(repo.saveCalled);

    // Should save on success
    POST successCmd(repo, out, "777 1");
    successCmd.execute();
    EXPECT_TRUE(repo.saveCalled);
}

// Tests if the command parses input correctly with extra whitespace
TEST(POSTTest, HandleDirtyInputWithTabsAndNewlines) {
    PostRepo repo;
    PostOutput out;
    POST command(repo, out, "  88 \t 101 \n 102    "); 

    command.execute();
    ASSERT_EQ(repo.users.size(), 1);
    EXPECT_EQ(repo.users.at(0)->getID(), 88);
    EXPECT_EQ(out.lastMessage, "201 Created\n");
}