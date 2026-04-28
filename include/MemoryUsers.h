#ifndef MEMORY_USERS_H
#define MEMORY_USERS_H

#include "IUserRepo.h"
#include <vector>
#include <string>
#include <fstream>

class MemoryUsers : public IUserRepo {
private:
    // field
    std::vector<User*> users;
    std::string filename;
    
    // Helper to load all users when the program starts
    void loadFromFile();

public:
    // Constructor
    MemoryUsers(std::string dbFile = "all_users.txt");
    // destructor to clean up any dynamically allocated memory
    virtual ~MemoryUsers();

    // Adds a new user pointer to our collection
    void addUser(User* user) override;

    // Returns the entire list of users
    std::vector<User*> getUsers() override;

    // Save all users to the file
    void saveAllToFile() override;

};

#endif