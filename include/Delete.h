#ifndef DELETE_H
#define DELETE_H

#include "ICommand.h"
#include "IOutput.h"
#include "IUserRepo.h"
#include "CommandException.h"
#include <string>

class Delete : public ICommand {
private:
    IUserRepo* users;  
    std::string input;

public:
    // Constructor with dependency injection
    Delete(IUserRepo* users);

    // Execute the delete command based on the input parameters
    void execute(IOutput& output) override;

    // Set the input parameters for the delete command
    void setInput(std::string inp) override;

    // Helper function to parse the input string into a vector of integers
    void parseInput(std::vector<int>& params);

    // Check if the user has all the specified product IDs
    bool productExists(User* user, const std::vector<int>& productIds);

    // Delete the specified products from the user's list
    void deleteProducts(User* user, const std::vector<int>& productIds);

};

#endif