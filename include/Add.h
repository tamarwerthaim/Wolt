#ifndef ADD_H
#define ADD_H

#include "ICommand.h"
#include "IUserRepo.h"
#include "IInput.h"
#include "User.h"
#include <vector>
#include <set>
#include <string>

// This class handles the "add" command to link products to users
class Add : public ICommand {
private:
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
    bool parseAndValidate(AddCommandData& outData);
    
    // Finds the user in the repo or creates a new one if he doesn't exist
    User& getOrCreateUser(int userId);
    
public:
    // Constructor to initialize the repo and the input string
    Add(IUserRepo& repo, const std::string& input);

    // The main function that runs the parsing and updates the user
    void execute() override;

    // Set the input parameters for the add command
    void setInput(std::string inp);
};

#endif