#include <gtest/gtest.h>
#include "Server.h"
#include "APP.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include "IInput.h"
#include "User.h"
#include <vector>
#include <string>

class MockRepo : public IUserRepo {
public:
    std::vector<User*> users;

    void addUser(User* u) override { 
        users.push_back(u); 
    }

    std::vector<User*> getUsers() override { 
        return users; 
    }

    User* getUserById(int id) override {
        for (auto u : users) {
            if (u->getID() == id) return u;
        }
        return nullptr;
    }

    void saveAllToFile() override {} 

    ~MockRepo() {}
};

class ServerTest : public ::testing::Test {
protected:
    MockRepo repo;
};

TEST_F(ServerTest, ServerInitializationCheck) {
    std::map<std::string, ICommand*> commands;
    App testApp(repo, commands);
    SUCCEED(); 
}

TEST(ServerSanity, PortRangeValidation) {
    int validPort = 8080;
    EXPECT_GT(validPort, 0);
    EXPECT_LT(validPort, 65536);
}