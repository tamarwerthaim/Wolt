#include "App.h"
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
    // Extract the first word as the command name - ss stay with the rest line
    ss >> commandName;

    try {
        // Look up the command in the map; throws an exception if the command name is invalid.
        ICommand* cmd = commands.at(commandName);
        
        // run execute on the currect object
        cmd->execute(ss);

    } catch (...) {
        //if the command doesnt exist, dont do anything and move to the next loop
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