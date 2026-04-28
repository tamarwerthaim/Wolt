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

void App::processCommand(const std::string& line) {
    // Create a stream to parse the line
    std::stringstream ss(line);
    std::string commandName;
    
    // Extract the first word as the command name
    ss >> commandName; 

    try {
        // Find the command object in our map
        ICommand* cmd = commands.at(commandName);
        
        // Get the rest of the line (the parameters)
        std::string remainingInput;
        std::getline(ss >> std::ws, remainingInput); 
        
        // Pass the parameters and run the command
        cmd->setInput(remainingInput); 
        cmd->execute();

    } catch (...) {
        // Ignore the line if the command is not found in the map
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