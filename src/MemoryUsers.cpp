#include "MemoryUsers.h"
#include "User.h"
#include "Product.h"
#include <sstream>

// Constructor
MemoryUsers:: MemoryUsers(std::string dbFile) : filename(dbFile) {
    loadFromFile();
}

MemoryUsers:: ~MemoryUsers() {
    // Clean up dynamically allocated User objects
    for (auto user : users) {
        delete user;
    }
}

// Adds a new user pointer to our collection
void MemoryUsers:: addUser(User* user) {
    if (user != nullptr) {
        users.push_back(user);
        saveToFile(user);
    }
}

// Returns the entire list of users
std::vector<User*> MemoryUsers:: getUsers() {
    return users;
}

// Helper to save a single user to the file
void MemoryUsers::saveToFile(User* user) {
    // Open the file in append mode to add the new user without overwriting existing data
    std::ofstream outFile(filename, std::ios::app);
    if (outFile.is_open()) {
        // write the user ID followed by all product IDs, separated by spaces
        outFile << user->getID();
        for (const auto& p : user->getProducts()) {
            outFile << " " << p.getID();
        }
        // Add a newline at the end of each user's data
        outFile << "\n";
        outFile.close();
    }
}

// Helper to load all users when the program starts
void MemoryUsers::loadFromFile() {
    //
    std::ifstream inFile(filename);
    // If the file doesn't exist, we can simply return with an empty user list
    if (!inFile.is_open()) return;

    std::string line;
    // Read the file line by line, where each line represents a user and their products
    while (std::getline(inFile, line)) {
        if (line.empty()) continue;

        std::stringstream ss(line);
        int id;
        // The first integer in the line is the user ID
        if (ss >> id) {
            // Create a new User object to hold the loaded data
            User* newUser = new User(id);
            int prodId;
            // Read the rest of the integers in the line as product IDs and add them to the user
            while (ss >> prodId) {
                newUser->addProduct(Product(prodId));
            }
            // Add the newly created user to our in-memory collection
            users.push_back(newUser);
        }
    }
    // Close the file after reading all users
    inFile.close();
}