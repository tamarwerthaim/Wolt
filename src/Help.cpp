#include "Help.h"

//constructor
Help::Help() {}

void Help::execute(IOutput& out) {
    this->output = &out;
    // Ignore the command if there are extra parameters or invalid text after "help"
    if (!input.empty() && input.find_first_not_of(" \t\n\r") != std::string::npos) {
        output->write("400 Bad Request\n");
        return;
    }
    // Display the help information for all commands
    displayAllCommands();
}

// Helper function to display all available commands and their usage
void Help::displayAllCommands() {
    // printing by alphabetical order
    output->write("DELETE, arguments: [userid] [productid1] [productid2] ...\n");
    output->write("GET, arguments: [userid] [productid]\n");
    output->write("PATCH, arguments: [userid] [productid1] [productid2] ...\n");
    output->write("POST, arguments: [userid] [productid1] [productid2] ...\n");
    
    // help command appears last and has no "arguments" tag
    output->write("help\n");  
}

// Set the input parameters for the help command
void Help::setInput(std::string inp) { 
    this->input = inp;
}