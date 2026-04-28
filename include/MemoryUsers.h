#ifndef MEMORY_USERS_H
#define MEMORY_USERS_H

#include "IUserRepo.h"
#include <vector>

class MemoryUsers : public IUserRepo {
private:
    // field
    std::vector<User*> users;

public:
    // Constructor
    MemoryUsers();
    // destructor to clean up any dynamically allocated memory
    virtual ~MemoryUsers();

    // Adds a new user pointer to our collection
    void addUser(User* user) override;

    // Returns the entire list of users
    std::vector<User*> getUsers() override;
};

#endif