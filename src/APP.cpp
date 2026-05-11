#include "APP.h"
#include <sstream>
#include <algorithm>
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
        
        // Skip empty lines to avoid unnecessary processing
        if (!line.empty()) {
            processCommand(line, output);
        }
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
        ICommand* cmd = commands.at(commandName);
        // Set the parameters for the command and execute it
        cmd->setInput(params);
        cmd->execute(output);
    } catch (...) {
        // if not found, we catch the exception and write a 400 Bad Request response
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