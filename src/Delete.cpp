#include "Delete.h"

// Constructor with dependency injection
Delete::Delete(IOutput* output, IUserRepo* users) 
    : output(output), users(users) {}

void Delete::setInput(std::string inp) { 
    this->input = inp;
}

// Execute the delete command based on the input parameters
void Delete::execute() {
    std:: vector<int> params;
    // 1. Parse the input into a vector of integers (user ID + product IDs)
    if (!parseInput(params)) {
    // If parsing failed, it means the input was not in the correct format
    output->write("400 Bad Request\n");
        return;
    }
    int userId = params[0];
    // The rest of the params are product IDs to delete
    std::vector<int> productIds(params.begin() + 1, params.end());
    User* targetUser = users->getUserById(userId);
    // 2. Check if the user exists and if they have all the specified product IDs
    if (!targetUser || !productExists(targetUser, productIds)) {
        // If the user doesn't exist or doesn't have the specified products, return 404
        output->write("404 Not Found\n");
        return;
    }
    // 3. If everything is valid, delete the specified products from the user's list
    deleteProducts(targetUser, productIds);
    // 4. Return 204 No Content to indicate successful deletion
    output->write("204 No Content\n");
}

// Helper function to parse the input string into a vector of integers
bool Delete::parseInput(std::vector<int>& params) {
    std::stringstream ss(input);
    int num;
    while (ss >> num) {
        // Negative IDs are invalid
        if (num < 0) 
            return false;
        params.push_back(num);
    }
    // If we failed to read but we're not at the end, it means there was some non-integer garbage
    if (!ss.eof() && ss.fail()) 
        return false;
    // We need at least a user ID and one product ID to delete
    return params.size() >= 2;
}

// Check if the user has all the specified product IDs
bool Delete::productExists(User* user, const std::vector<int>& productIds) {
    for (int pid : productIds) {
        if (!user->hasProduct(pid)) {\
            // If any product ID is not found, return false
            return false;
        }
    }
    // All product IDs were found
    return true;
}

// Remove the specified products from the user's list
void Delete::deleteProducts(User* user, const std::vector<int>& productIds) {
    for (int pid : productIds) {
        user->removeProduct(pid);
    }
}
