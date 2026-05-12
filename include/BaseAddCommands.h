#ifndef BASE_ADD_COMMANDS_H
#define BASE_ADD_COMMANDS_H

#include "ICommand.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include "CommandException.h"
#include <set>
#include <string>

// Base class for commands that add products to users (POST/PATCH)
class BaseAddCommands : public ICommand {
protected:
    // Reference to the database where users are stored
    IUserRepo& repo; 
    // The string with the parameters (user ID and product IDs)  
    std::string input; 

    // A struct to keep the data we extract from the input string
    struct AddCommandData {
        int userId;
        // Using a set to automatically ignore duplicate IDs
        std::set<int> productIds; 
    };

    // Extracts data from the string and checks if the input is valid
    void parseAndValidate(AddCommandData& outData);

    // Finds the user in the repo
    User* findUser(int userId);

    // TODO
    void addProductsToUser(User* user, const AddCommandData& data);

public:
    BaseAddCommands(IUserRepo& r);
    
    virtual ~BaseAddCommands() = default;

    void setInput(std::string inp);
};

#endif