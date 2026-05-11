#ifndef PATCH_H
#define PATCH_H

#include "ICommand.h"
#include "IUserRepo.h"
#include "IOutput.h"
#include "User.h"
#include <vector>
#include <set>
#include <string>

#include "BaseAddCommands.h"

// This class handles the "PATCH" command to add products to an EXISTING user
class PATCH : public BaseAddCommands {
public:
    // Constructor passes everything to the base class
    PATCH(IUserRepo& repo);

    // The main logic for updating an existing user
    void execute(IOutput& output) override;
};

#endif