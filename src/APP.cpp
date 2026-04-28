#include "APP.h"
#include <sstream>

// The constructor injects all the dependencies
App::App(IInput& in, IOutput& out, IUserRepo& rep, std::map<std::string, ICommand*> cmds)
    : input(in), output(out), repo(rep), commands(cmds) {
    // Everything is initialized via the initializer list
}

// Clean up the command pointers when the app is destroyed
App::~App() {
    cleanup();
}

//the main function - unning the app
void App::run() {
    // The main loop
    while (true) {
        std::string line = input.read();
        
        // Skip empty lines to avoid unnecessary processing
        if (!line.empty()) {
            processCommand(line);
        }
    }
}

//the work on one line
void App::processCommand(const std::string& line) {
    std::stringstream ss(line);
    std::string commandName;
    // Read the command name (the first word)
    ss >> commandName;

    // Read the rest of the line as parameters (if any)
    std::string params;
    std::getline(ss, params); 

    try {
        ICommand* cmd = commands.at(commandName);
        // Set the parameters for the command and execute it
        cmd->setInput(params);
        cmd->execute();
    } catch (...) {
        // If the command is not found continue without crashing
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