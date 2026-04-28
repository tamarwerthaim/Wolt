#ifndef IUSERREPO_H
#define IUSERREPO_H
#include "User.h"
#include <vector>

class IUserRepo {
public:
    // Virtual destructor to ensure proper cleanup of derived classes
    virtual ~IUserRepo() {}

    // add a new user pointer to our collection
    virtual void addUser(User* user) = 0;

    // return the entire list of users
    virtual std::vector<User*> getUsers() = 0;

    // Save all users to the file
    virtual void saveAllToFile() {}
};

#endif