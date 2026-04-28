#include "Add.h"
#include "Product.h"
#include <algorithm> //std::find_if
#include <set>
#include <vector>
#include <sstream>

Add::Add(IUserRepo& repo, const std::string& input) : repo(repo), input(input) {}

void Add::execute() {
    // empty AddCommandData
    AddCommandData data;
    
    // parseAndValidate get reference and If the input is correct-
    // fills parseAndValidate with the details
    if (!parseAndValidate(data)) {
        return;
    }

    // Get the user from the repository (create one if missing)
    User& user = getOrCreateUser(data.userId);

    // Loop through all unique products we found and add them to the user
    for (int pid : data.productIds) {
        user.addProduct(Product(pid));
    }
}

void Add::setInput(std::string inp) { 
    this->input = inp;
}

bool Add::parseAndValidate(AddCommandData& outData) {
    // Stop if the string is empty
    if (input.empty()) return false;

    // Use stringstream to read numbers one by one
    std::stringstream ss(input);

    // Try to read the user ID and make sure it is not negative
    if (!(ss >> outData.userId) || outData.userId < 0) return false;

    int pid;
    // Keep reading product IDs until the end of the string
    while (ss >> pid) {
        // If we see a negative ID, the whole line is invalid
        if (pid < 0) return false;
        outData.productIds.insert(pid);
    }

    // If the pipe is clogged and you haven't reached the end of the stream
    // (This means we found a letter or a special character)
    if (!ss.eof() && ss.fail()) return false;

    // We must have at least one product to make the command valid
    if (outData.productIds.empty()) return false;

    return true;
}

User& Add::getOrCreateUser(int userId) {
    // Get all current users to check if our user already exists
    std::vector<User*> allUsers = repo.getUsers();

    // Look for a user with a matching ID
    auto iterator = std::find_if(allUsers.begin(), allUsers.end(), [userId](const User* user) {
        return user->getID() == userId;
    });

    // If we didn't find the user, create a new one and add it to the repo
    if (iterator == allUsers.end()) {
        User* newUser = new User(userId);
        repo.addUser(newUser);
        return *newUser;
    }

    // If found, return the existing user (dereference the iterator)
    return **iterator;
}