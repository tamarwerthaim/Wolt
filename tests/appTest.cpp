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

// A simple IOutput implementation to capture output for testing
class TerminalOutput : public IOutput {
public:
    std::string capturedText;
    void write(const std::string& message) override { capturedText += message; }
    void clear() { capturedText = ""; }
};

// A test fixture to set up the environment for testing the App with a simulated terminal
class TerminalSimulationTest : public ::testing::Test {
protected:
    TerminalOutput* out;
    MemoryUsers* repo;
    std::map<std::string, ICommand*> commands;

    // Set up the test environment before each test
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

    // Clean up after each test
    void TearDown() override {
        for (auto const& [key, val] : commands) { delete val; }
        delete out;
        delete repo;
    }

    // Helper function to simulate running a command as if it were entered in the terminal
    void runCommand(std::string fullLine) {
        std::stringstream ss(fullLine);
        std::string cmdName;
        ss >> cmdName; 

        std::string params;
        std::getline(ss, params); 

        // Emulating the App::processCommand logic (uppercase and execute with output)
        for (auto & c : cmdName) c = std::toupper(static_cast<unsigned char>(c));

        // Execute the command and capture output, handling exceptions as the App would
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

// Tests adding users and recommending products based on similarity.
TEST_F(TerminalSimulationTest, BasicFlowPostAndGet) {
    runCommand("POST 1 10 999 20"); 
    runCommand("POST 2 10 999 30");
    
    out->clear();
    runCommand("GET 1 10");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n30\n");
}

// Tests that deleting a product from a user works correctly and that the recommendation system updates accordingly.
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

// Tests that when two users have the same similarity score, 
// the system correctly uses the tie-breaking rule to recommend the product with the smaller ID.
TEST_F(TerminalSimulationTest, TieBreakerCheck) {
    runCommand("POST 1 10 999");
    runCommand("POST 2 10 999 500");
    runCommand("POST 3 10 999 200");
    
    out->clear();
    runCommand("GET 1 10");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n200 500\n");
}

// tests that the system correctly handles invalid input formats and returns appropriate error messages without crashing.
TEST_F(TerminalSimulationTest, UnknownCommandReturns400) {
    out->clear();
    runCommand("UNKNOWN_CMD 1 2 3");
    EXPECT_EQ(out->capturedText, "400 Bad Request\n");
}

// Tests that the system correctly handles invalid input formats and returns appropriate error messages without crashing.
TEST_F(TerminalSimulationTest, InvalidGetInputReturns400) {
    out->clear();
    runCommand("GET 1 abc"); 
    EXPECT_EQ(out->capturedText, "400 Bad Request\n");
}

// Tests that the system correctly handles invalid input formats and returns appropriate error messages without crashing.
TEST_F(TerminalSimulationTest, TrailingGarbageOnDelete) {
    runCommand("POST 1 10 20");
    out->clear();
    runCommand("DELETE 1 10 some_junk"); 
    EXPECT_EQ(out->capturedText, "400 Bad Request\n");
}

// Tests that the system correctly handles invalid input formats and returns appropriate error messages without crashing.
TEST_F(TerminalSimulationTest, CaseInsensitivityCheck) {
    runCommand("post 1 10 999 20"); 
    out->clear();
    runCommand("get 1 10");
    EXPECT_TRUE(out->capturedText.find("200 Ok") != std::string::npos);
}

// Tests that the system correctly handles extra whitespace in the input and still processes the command successfully.
TEST_F(TerminalSimulationTest, MessyWhitespaceHandling) {
    runCommand("   POST    10   500   999");
    runCommand("POST 11 500 999 600");
    
    out->clear();
    runCommand("    GET   10   500   ");
    EXPECT_EQ(out->capturedText, "200 Ok\n\n600\n");
}

// Tests that the help command returns the correct information about available commands and their usage.
TEST_F(TerminalSimulationTest, HelpCommandOutput) {
    out->clear();
    runCommand("HELP");
    EXPECT_FALSE(out->capturedText.empty());
    EXPECT_TRUE(out->capturedText.find("DELETE") != std::string::npos);
}

// Tests that the system correctly saves user data to the file and can read it back, 
// ensuring that the recommendations are consistent across different instances of the repository.
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