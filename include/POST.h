#ifndef POST_H
#define POST_H

#include "ICommand.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include "User.h"
#include <vector>
#include <set>
#include <string>

#include "BaseAddCommands.h"

// This class handles the "POST" command to link products to users
class POST : public BaseAddCommands {  
public:
    // Constructor to initialize the repo and the input string
    POST(IUserRepo& repo, IOutput& output, const std::string& input);

    // The main function that runs the parsing and updates the user
    void execute() override;
};

#endif