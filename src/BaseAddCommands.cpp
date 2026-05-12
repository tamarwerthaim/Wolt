#include "BaseAddCommands.h"
#include "CommandException.h"
#include <sstream>
#include <algorithm>

BaseAddCommands::BaseAddCommands(IUserRepo& r) : repo(r) {}
// Helper method to parse the input string into the data struct
void BaseAddCommands::parseAndValidate(AddCommandData& outData) {
    // throw an exception if the input is empty
    if (input.empty()) throw InvalidInputException();

    // Use stringstream to read numbers one by one
    std::stringstream ss(input);

    // Try to read the user ID and make sure it is not negative
    if (!(ss >> outData.userId) || outData.userId < 0) {
        throw InvalidInputException();
    }

    int pid;
    // Keep reading product IDs until the end of the string
    while (ss >> pid) {
        // If we see a negative ID, the whole line is invalid
        if (pid < 0) throw InvalidInputException();
        outData.productIds.insert(pid);
    }

    // If the pipe is clogged and you haven't reached the end of the stream
    // (This means we found a letter or a special character)
    if (!ss.eof() && ss.fail()) {
        throw InvalidInputException();
    }

    // We must have at least one product to make the command valid
    if (outData.productIds.empty()) {
        throw InvalidInputException();
    }
}

User* BaseAddCommands::findUser(int userId) {
    // Get all current users to check if our user already exists
    std::vector<User*> allUsers = repo.getUsers();

    // Look for a user with a matching ID
    auto iterator = std::find_if(allUsers.begin(), allUsers.end(), [userId](const User* user) {
        return user->getID() == userId;
    });

    // If we didn't find the user, return nullptr
    if (iterator == allUsers.end()) return nullptr;
    // If found, return the existing user (dereference the iterator)
    return *iterator;
}

void BaseAddCommands::addProductsToUser(User* user, const AddCommandData& data) {
    if (user == nullptr) return;

    for (int pid : data.productIds) {
        user->addProduct(Product(pid));
    }
    repo.saveAllToFile();
}

// Parses the input string and validates the data.
void BaseAddCommands::setInput(std::string inp) { 
    this->input = inp;
}