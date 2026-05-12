#include "Help.h"
#include "IOutput.h"

//constructor
Help::Help(const std::string& input) : input(input) {}

void Help::execute(IOutput& out) {
    // Ignore the command if there are extra parameters or invalid text after "help"
    if (!input.empty() && input.find_first_not_of(" \t\n\r") != std::string::npos) {
        out.write("400 Bad Request\n");
        return;
    }
    // Display the help information for all commands
    displayAllCommands(out);
}

// Helper function to display all available commands and their usage
void Help::displayAllCommands(IOutput& out) {
    // printing by alphabetical order
    out.write("DELETE, arguments: [userid] [productid1] [productid2] ...\n");
    out.write("GET, arguments: [userid] [productid]\n");
    out.write("PATCH, arguments: [userid] [productid1] [productid2] ...\n");
    out.write("POST, arguments: [userid] [productid1] [productid2] ...\n");
    
    // help command appears last and has no "arguments" tag
    out.write("help\n");  
}

// Set the input parameters for the help command
void Help::setInput(std::string inp) { 
    this->input = inp;
}
