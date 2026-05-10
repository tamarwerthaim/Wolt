#include "POST.h"
#include "Product.h"
#include <algorithm> //std::find_if
#include <set>
#include <vector>
#include <sstream>

POST::POST(IUserRepo& repo, const std::string& input, IOutput& output) : repo(repo), input(input), output(output) {}

void POST::execute() {
    // Check if the input format is valid
    AddCommandData data;
    // Checking the logical structure and fill the 'data' struct with values.
    if (!parseAndValidate(data)) {
        output.write("400 Bad Request\n"); 
        return;
    }

    // Try to find the user in the database
    User* existingUser = findUser(data.userId);

    // POST should only work if the user is new
    if (existingUser == nullptr) {
        createNewUser(data);
        output.write("201 Created\n");
    } else {
        // If user already exists, it's an error for POST
        output.write("404 Not Found\n");
    }
}

void POST::createNewUser(const AddCommandData& data) {
    // Create a new User object with the given ID
    User* newUser = new User(data.userId);
    
    // Add all products from the input list to the user
    for (int pid : data.productIds) {
        newUser->addProduct(Product(pid));
    }
    
    // Add the new user to the repository and save to file
    repo.addUser(newUser);
    repo.saveAllToFile();
}

// Parses the input string and validates the data.
void POST::setInput(std::string inp) { 
    this->input = inp;
}

bool POST::parseAndValidate(AddCommandData& outData) {
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

User* POST::findUser(int userId) {
    // Get all current users to check if our user already exists
    std::vector<User*> allUsers = repo.getUsers();

    // Look for a user with a matching ID
    auto iterator = std::find_if(allUsers.begin(), allUsers.end(), [userId](const User* user) {
        return user->getID() == userId;
    });

    // If we didn't find the user, return nullptr
    if (it == allUsers.end()) return nullptr;
    // If found, return the existing user (dereference the iterator)
    return *iterator;
}