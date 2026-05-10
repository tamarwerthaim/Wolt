#ifndef HELP_H
#define HELP_H

#include "ICommand.h"
#include "IOutput.h"
#include <string>

class Help : public ICommand {
private:
    // fields
    IOutput& output;   
    std::string input; 

public:
    //constructor
    Help(IOutput& output, const std::string& input);

    // Prints the required help strings to the output
    void execute() override;

    // Set the input parameters for the help command
    void setInput(std::string inp);

    // Helper function to display all available commands and their usage
    void displayAllCommands();

};

#endif