#include "Help.h"

//constructor
Help::Help(IOutput& output, const std::string& input) 
    : output(output), input(input) {}

void Help::execute() {
    // Ignore the command if there are extra parameters or invalid text after "help"
    if (!input.empty() && input.find_first_not_of(" \t\n\r") != std::string::npos) {
        return;
    }

    // print all commands
    output.write("add [userid] [productid1] [productid2] ...\n");
    output.write("GET [userid] [productid]\n");
    output.write("help\n");
}

// Set the input parameters for the help command
void Help::setInput(std::string inp) { 
    this->input = inp;
}