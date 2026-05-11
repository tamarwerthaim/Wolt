#ifndef HELP_H
#define HELP_H

#include "ICommand.h"
#include "IOutput.h"
#include <string>

class Help : public ICommand {
private:
    // fields
    IOutput* output;   
    std::string input; 

public:
    //constructor
    Help();

    // Prints the required help strings to the output
    void execute(IOutput& output) override;

    // Set the input parameters for the help command
    void setInput(std::string inp);

    // Helper function to display all available commands and their usage
    void displayAllCommands();

};

#endif