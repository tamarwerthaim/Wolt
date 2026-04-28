#include "MemoryUsers.h"

MemoryUsers:: MemoryUsers() {}

MemoryUsers:: ~MemoryUsers() {}

// Adds a new user pointer to our collection
void MemoryUsers:: addUser(User* user) {
    if (user != nullptr) {
        users.push_back(user);
    }
}

// Returns the entire list of users
std::vector<User*> MemoryUsers:: getUsers() {
    return users;
}