#include <gtest/gtest.h>
#include <fstream>
#include <sstream>
#include <map>
#include <string>
#include <vector>
#include "POST.h"
#include "PATCH.h"
#include "GET.h"
#include "Help.h"
#include "Delete.h"
#include "MemoryUsers.h"
#include "IOutput.h"
#include "CommandException.h" 

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
        // Ensure clean environment for Docker
        system("mkdir -p /app/data"); 
        std::ofstream ofs("/app/data/terminal_test.txt", std::ios::trunc);
        ofs.close();

        out = new TerminalOutput();
        repo = new MemoryUsers("/app/data/terminal_test.txt");

        // Initializing the command map exactly like main.cpp
        commands["POST"] = new POST(*repo);      // Takes reference
        commands["PATCH"] = new PATCH(*repo);    // Takes reference
        commands["HELP"] = new Help();           // Default constructor
        commands["GET"] = new GET(repo);         // Takes pointer
        commands["DELETE"] = new Delete(repo);   // Takes pointer
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

        // Emulating the App::processCommand logic (uppercase and execute with output)
        for (auto & c : cmdName) c = std::toupper(static_cast<unsigned char>(c));

        try {
            if (commands.count(cmdName)) {
                commands[cmdName]->setInput(params); 
                commands[cmdName]->execute(*out);
            } else {
                out->write("400 Bad Request\n");
            }
        } catch (const CommandException& e) {
            out->write(e.what());
        } catch (...) {
            out->write("400 Bad Request\n");
        }
    }
};

// --- CORE LOGIC TESTS ---

TEST_F(TerminalSimulationTest, BasicFlowPostAndGet) {
    runCommand("POST 1 10 999 20"); 
    runCommand("POST 2 10 999 30");
    
    out->clear();
    runCommand("GET 1 10");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n30\n");
}

TEST_F(TerminalSimulationTest, FullCycleWithDelete) {
    runCommand("POST 1 10 999 20");
    runCommand("POST 2 10 999 30");
    
    out->clear();
    runCommand("DELETE 2 999");
    EXPECT_EQ(out->capturedText, "204 No Content\n");

    out->clear();
    runCommand("GET 1 10");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n\n"); 
}

TEST_F(TerminalSimulationTest, TieBreakerCheck) {
    runCommand("POST 1 10 999");
    runCommand("POST 2 10 999 500");
    runCommand("POST 3 10 999 200");
    
    out->clear();
    runCommand("GET 1 10");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n200 500\n");
}

// --- ERROR HANDLING TESTS ---

TEST_F(TerminalSimulationTest, UnknownCommandReturns400) {
    out->clear();
    runCommand("UNKNOWN_CMD 1 2 3");
    EXPECT_EQ(out->capturedText, "400 Bad Request\n");
}

TEST_F(TerminalSimulationTest, InvalidGetInputReturns400) {
    out->clear();
    runCommand("GET 1 abc"); 
    EXPECT_EQ(out->capturedText, "400 Bad Request\n");
}

TEST_F(TerminalSimulationTest, TrailingGarbageOnDelete) {
    runCommand("POST 1 10 20");
    out->clear();
    runCommand("DELETE 1 10 some_junk"); 
    EXPECT_EQ(out->capturedText, "400 Bad Request\n");
}

// --- SYSTEM & WHITESPACE TESTS ---

TEST_F(TerminalSimulationTest, CaseInsensitivityCheck) {
    runCommand("post 1 10 999 20"); 
    out->clear();
    runCommand("get 1 10");
    EXPECT_TRUE(out->capturedText.find("200 Ok") != std::string::npos);
}

TEST_F(TerminalSimulationTest, MessyWhitespaceHandling) {
    runCommand("   POST    10   500   999");
    runCommand("POST 11 500 999 600");
    
    out->clear();
    runCommand("    GET   10   500   ");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n600\n");
}

TEST_F(TerminalSimulationTest, HelpCommandOutput) {
    out->clear();
    runCommand("HELP");
    EXPECT_FALSE(out->capturedText.empty());
    EXPECT_TRUE(out->capturedText.find("DELETE") != std::string::npos);
}

TEST_F(TerminalSimulationTest, PersistenceCheck) {
    runCommand("POST 88 10 999");
    runCommand("POST 99 10 999 30"); 
    
    MemoryUsers repo2("/app/data/terminal_test.txt");    
    GET getCmd(&repo2); 
    
    out->clear();
    getCmd.setInput(" 88 10");
    
    try {
        getCmd.execute(*out);
    } catch (const CommandException& e) {
        out->write(e.what());
    }
    
    EXPECT_EQ(out->capturedText, "200 Ok\n\n30\n");
}