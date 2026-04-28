#ifndef IUSERREPO_H
#define IUSERREPO_H
#include "User.h"
#include <vector>

class IUserRepo {
public:
    virtual ~IUserRepo() {}
    
    // add user to our reposity
    virtual void addUser(User* user) = 0;
    
    // return all the users in vector
    virtual std::vector<User*> getUsers() = 0;
};

#endif