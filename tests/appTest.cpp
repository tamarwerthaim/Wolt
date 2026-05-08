#include <gtest/gtest.h>
#include <fstream>
#include <sstream>
#include <map>
#include <string>
#include "Add.h"
#include "GET.h"
#include "Help.h"
#include "MemoryUsers.h"
#include "IOutput.h"

// 1. Fixed the write signature to match IOutput.h (const std::string& instead of string)
class TerminalOutput : public IOutput {
public:
    std::string capturedText;
    void write(const std::string& message) override { capturedText += message; }
    void clear() { capturedText = ""; }
};

class TerminalSimulationTest : public ::testing::Test {
protected:
    TerminalOutput* out;
    MemoryUsers* repo;
    std::map<std::string, ICommand*> commands;

    void SetUp() override {
    system("mkdir -p /app/data");  // ensure directory exists in Docker
    
    std::ofstream ofs("/app/data/terminal_test.txt", std::ios::trunc);
    ofs.close();

    out = new TerminalOutput();
    repo = new MemoryUsers("/app/data/terminal_test.txt");

    commands["add"] = new Add(*repo, ""); 
    // CHANGE: Added "" back to match GET.h constructor signature
    commands["GET"] = new GET("", out, repo); 
    commands["help"] = new Help(*out, "");
}


    void TearDown() override {
        for (auto const& [key, val] : commands) { delete val; }
        delete out;
        delete repo;
    }

    void runCommand(std::string fullLine) {
        std::stringstream ss(fullLine);
        std::string cmdName;
        ss >> cmdName; 

        std::string params;
        std::getline(ss, params); 

        if (commands.count(cmdName)) {
            // Check if your interface uses setInput or setParams
            commands[cmdName]->setInput(params); 
            commands[cmdName]->execute();
        }
    }
};

// --- BASIC LOGIC TESTS ---

// Test: Simple add and recommend flow
TEST_F(TerminalSimulationTest, BasicFlow) {
    // Added '999' as a shared product so weight is 1
    runCommand("add 1 10 999 20"); 
    runCommand("add 2 10 999 30");
    
    out->clear();
    runCommand("GET 1 10");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n30\n"); // UPDATED: Included status code
}

// Test: Check tie-breaker (smaller ID first)
TEST_F(TerminalSimulationTest, TieBreakerCheck) {
    runCommand("add 1 10 999");
    runCommand("add 2 10 999 500");
    runCommand("add 3 10 999 200");
    
    out->clear();
    runCommand("GET 1 10");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n200 500\n"); // UPDATED: Included status code
}

// Test: Check weights (influence of similar users)
TEST_F(TerminalSimulationTest, WeightsInfluence) {
    runCommand("add 1 10 20 21");
    runCommand("add 2 10 20 21 300"); // Weight 2 (shares 20, 21)
    runCommand("add 3 10 20 400");    // Weight 1 (shares 20)
    
    out->clear();
    runCommand("GET 1 10");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n300 400\n"); // UPDATED: Included status code
}

// ... in MaxTenLimit test, make sure each user shares one extra product ...
TEST_F(TerminalSimulationTest, MaxTenLimit) {
    runCommand("add 1 100 999"); // 999 is shared
    for(int i = 2; i <= 15; ++i) {
        std::string cmd = "add " + std::to_string(i) + " 100 999 " + std::to_string(1000 + i);
        runCommand(cmd);
    }
    out->clear();
    runCommand("GET 1 100");
    
    int count = 0;
    std::stringstream ss(out->capturedText);
    std::string temp;
    // Skip status code
    ss >> temp; // 200
    ss >> temp; // Ok
    while(ss >> temp) count++;
    EXPECT_EQ(count, 10);
}

// --- INPUT FORMATTING TESTS ---

// Test: Extra spaces in input
TEST_F(TerminalSimulationTest, ExtraSpaces) {
    // We add two users who share product 999 to create similarity
    runCommand("add    5      100    999");
    runCommand("add    6      100    999    200");
    
    out->clear();
    runCommand("GET       5       100");
    // Now user 6 is similar (weight 1), so 200 is recommended
    EXPECT_EQ(out->capturedText, "200 Ok\n\n200\n"); // UPDATED: Included status code
}

// Test: Garbage text at the end
TEST_F(TerminalSimulationTest, TrailingGarbage) {
    runCommand("add 1 10 20");
    runCommand("add 2 10 30");
    out->clear();
    runCommand("GET 1 10 extra_stuff"); // Should fail and return
    EXPECT_EQ(out->capturedText, "400 Bad Request\n"); // UPDATED: Expect error status
}

// Test: Letters instead of numbers
TEST_F(TerminalSimulationTest, NonNumericInput) {
    out->clear();
    runCommand("add 1 abc 20"); 
    runCommand("GET 1 10");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n\n"); // UPDATED: Included status code
}

// --- PERSISTENCE & SYSTEM TESTS ---

// Test: Help command
TEST_F(TerminalSimulationTest, HelpCommand) {
    out->clear();
    runCommand("help");
    EXPECT_FALSE(out->capturedText.empty());
}

// Test: Data persists after "restart"
TEST_F(TerminalSimulationTest, PersistenceCheck) {
    runCommand("add 88 10 999");
    runCommand("add 99 10 999 30"); 
    
    MemoryUsers repo2("/app/data/terminal_test.txt");    
    // CHANGE: Added "" back to match GET.h constructor signature
    GET getCmd("", out, &repo2); 
    
    out->clear();
    getCmd.setInput(" 88 10");
    getCmd.execute();
    
    EXPECT_EQ(out->capturedText, "200 Ok\n\n30\n"); // UPDATED: Included status code
}

TEST_F(TerminalSimulationTest, DataPersistenceAfterRestart) {
    runCommand("add 1 100 999");
    runCommand("add 2 100 999 300");
    
    MemoryUsers repo2("/app/data/terminal_test.txt");    
    // CHANGE: Added "" back to match GET.h constructor signature
    GET getCmd("", out, &repo2); 
    
    out->clear();
    getCmd.setInput(" 1 100");
    getCmd.execute();
    
    EXPECT_NE(out->capturedText.find("300"), std::string::npos);
}

// test: handle spaces and tabs before, between and after
TEST_F(TerminalSimulationTest, MessyWhitespace) {
    runCommand("   add    10      500    999");
    runCommand("   add    11      500    999    600");
    
    out->clear();
    runCommand("    GET      10       500   ");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n600\n"); // UPDATED: Included status code
}

// test: garbage characters between parameters
TEST_F(TerminalSimulationTest, GarbageBetweenParams) {
    // user 1, then junk '!!!', then product 100
    runCommand("add 1 !!! 100"); 
    
    // the command should fail because '!!!' is not an int
    EXPECT_TRUE(repo->getUsers().empty());
}

// test: garbage characters after the command
TEST_F(TerminalSimulationTest, GarbageAfterCommand) {
    runCommand("add 1 100 200");
    runCommand("add 2 100 300");
    
    out->clear();
    // correct command + extra junk at the end
    runCommand("GET 1 100 some_extra_junk");
    
    // output should be error because we return on extra garbage
    EXPECT_EQ(out->capturedText, "400 Bad Request\n"); // UPDATED: Expect error status
}

// test: garbage characters before the command name
TEST_F(TerminalSimulationTest, GarbageBeforeCommand) {
    out->clear();
    // junk before 'add'
    runCommand("??? add 1 100 200");
    
    // system should not find command named "???"
    EXPECT_TRUE(repo->getUsers().empty());
}