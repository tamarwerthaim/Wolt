#include "APP.h"
#include <sstream>
#include <algorithm>
#include "CommandException.h"
#include <cctype>

// The constructor injects all the dependencies
App::App(IUserRepo& rep, std::map<std::string, ICommand*> cmds)
    : repo(rep), commands(cmds) {
    // Everything is initialized via the initializer list
}

// Clean up the command pointers when the app is destroyed
App::~App() {
    cleanup();
}

//the main function - unning the app
void App::run(IInput& input, IOutput& output) {
    // The main loop - while the client connected
    while (!input.isFinished()) {
        std::string line = input.read();
        // Process the command from the input line
        processCommand(line, output);
    }
}

void App::processCommand(const std::string& line, IOutput& output) {
    // Create a stream to parse the line
    std::stringstream ss(line);
    std::string commandName;
    // Read the command name (the first word)
    ss >> commandName;

    // Convert the command name to uppercase to make it case-insensitive
    for (auto & c : commandName) {
        c = std::toupper(static_cast<unsigned char>(c));
    }

    // Read the rest of the line as parameters (if any)
    std::string params;
    std::getline(ss, params); 

    try {
        // Check if the command exists in our map
        if (commands.find(commandName) == commands.end()) {
            throw InvalidInputException();
        }
        // If it exists, get the command object
        ICommand* cmd = commands.at(commandName);
        // Set the parameters for the command and execute it
        cmd->setInput(params);
        cmd->execute(output);
    } catch (const CommandException& e) {
        output.write(e.what());
    } catch (...) {
        // Catch any other unexpected exceptions
        output.write("400 Bad Request\n");
    }
}

void App::cleanup() {
    // Since the map stores pointers, we need to free the memory manually
    for (auto const& [name, cmd] : commands) {
        delete cmd;
    }
    // Clear the map just to be safe
    commands.clear();
}