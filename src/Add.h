#ifndef ADD_H
#define ADD_H

#include "ICommand.h"
#include "IUserRepo.h"
#include "IInput.h"
#include "User.h"
#include <vector>
#include <set>

class Add : public ICommand {
private:
    IUserRepo& repo;
    IInput& input;

    User& getOrCreateUser(int userId);

public:
    Add(IUserRepo& repo, IInput& input);

    void execute() override;
};

#endif