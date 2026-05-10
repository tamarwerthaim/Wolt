#ifndef DELETE_H
#define DELETE_H

#include "ICommand.h"
#include "IOutput.h"
#include "IUserRepo.h"
#include <string>

class Delete : public ICommand {
private:
    IOutput* output;   
    IUserRepo* users;  
    std::string input;

public:
    // Constructor with dependency injection
    Delete(IOutput* output, IUserRepo* users);

    // Execute the delete command based on the input parameters
    void execute() override;

    // Set the input parameters for the delete command
    void setInput(std::string inp) override;
};

#endif