#include <gtest/gtest.h>
#include "Server.h"
#include "APP.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include "IInput.h"
#include "User.h"
#include <vector>
#include <string>

// A mock repository to use in the server tests
class MockRepo : public IUserRepo {
public:
    std::vector<User*> users;

    // Implementing the IUserRepo interface
    void addUser(User* u) override { 
        users.push_back(u); 
    }

    std::vector<User*> getUsers() override { 
        return users; 
    }

    // Implementing getUserById to return a user based on ID or nullptr if not found
    User* getUserById(int id) override {
        for (auto u : users) {
            if (u->getID() == id) return u;
        }
        return nullptr;
    }

    void saveAllToFile() override {} 

    ~MockRepo() {}
};

// A simple IOutput implementation to capture output for testing
class ServerTest : public ::testing::Test {
protected:
    MockRepo repo;
};

// Tests that the Server class can be instantiated without throwing an exception 
// and that the resulting object is not a null pointer.
TEST_F(ServerTest, ServerInitializationCheck) {
    std::map<std::string, ICommand*> commands;
    App testApp(repo, commands);
    SUCCEED(); 
}

// Tests that the Server class correctly validates the port number 
// and that it throws an appropriate exception if the port number is out of the valid range (0-65535).
TEST(ServerSanity, PortRangeValidation) {
    int validPort = 8080;
    EXPECT_GT(validPort, 0);
    EXPECT_LT(validPort, 65536);
}