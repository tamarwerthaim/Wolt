#ifndef POST_H
#define POST_H

#include "ICommand.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include "User.h"
#include <vector>
#include <set>
#include <string>

// This class handles the "POST" command to link products to users
class POST : public ICommand {
private:
    // Reference to the database where users are stored
    IUserRepo& repo; 
    // The string with the parameters (user ID and product IDs)  
    std::string input; 
    // Reference to the output interface for sending responses back to the client
    IOutput& output;

    // A struct to keep the data we extract from the input string
    struct AddCommandData {
        int userId;
        // Using a set to automatically ignore duplicate IDs
        std::set<int> productIds; 
    };

    // Extracts data from the string and checks if the input is valid
    bool parseAndValidate(AddCommandData& outData);

    // Finds the user in the repo
    User* POST::findUser(int userId)

    // Creates a new user
    void createNewUser(const AddCommandData& data)
    
public:
    // Constructor to initialize the repo and the input string
    POST(IUserRepo& repo, const std::string& input);

    // The main function that runs the parsing and updates the user
    void execute() override;

    // Set the input parameters for the add command
    void setInput(std::string inp);
};

#endif