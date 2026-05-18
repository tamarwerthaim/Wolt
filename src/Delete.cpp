#include "Delete.h"
#include "CommandException.h"
#include <set>

// Constructor with dependency injection
Delete::Delete(IUserRepo* users) : users(users) {}

// Set the input parameters for the delete command
void Delete::setInput(std::string inp) { 
    this->input = inp;
}

// Execute the delete command based on the input parameters
void Delete::execute(IOutput& out) {
    // Set the output pointer for use in this function
    std:: vector<int> params;
    // Parse the input into a vector of integers (user ID + product IDs)
    parseInput(params);

    int userId = params[0];
    // The rest of the params are product IDs to delete
    std::vector<int> productIds(params.begin() + 1, params.end());
    User* targetUser = users->getUserById(userId);
    // Check if the user exists and if they have all the specified product IDs
    if (!targetUser || !productExists(targetUser, productIds)) {
        throw LogicalErrorException();
    }
    // If everything is valid, delete the specified products from the user's list
    deleteProducts(targetUser, productIds);
    // Save the updated user data to the file after deletion
    users->saveAllToFile();
    // Return 204 No Content to indicate successful deletion
    out.write("204 No Content\n");
}

// Helper function to parse the input string into a vector of integers
void Delete::parseInput(std::vector<int>& params) {
    std::stringstream ss(input);
    int num;
    while (ss >> num) {
        // Negative IDs are invalid
        if (num < 0) throw InvalidInputException();
        params.push_back(num);
    }
    // If we failed to read but we're not at the end, it means there was some non-integer garbage
    if (!ss.eof() && ss.fail()) throw InvalidInputException();
    // We need at least a user ID and one product ID to delete
    if (params.size() < 2) throw InvalidInputException();
}

// Check if the user has all the specified product IDs
bool Delete::productExists(User* user, const std::vector<int>& productIds) {
    // Use a set to track seen product IDs
    std::set<int> seenProducts;
    for (int pid : productIds) {
        if (seenProducts.count(pid) > 0 || !user->hasProduct(pid)) {
            // If any product ID is already seen or not found, return false
            return false;
        }
        // Mark this product ID as seen
        seenProducts.insert(pid);
    }
    // All product IDs were found
    return true;
}

// Remove the specified products from the user's list
void Delete::deleteProducts(User* user, const std::vector<int>& productIds) {
    // Remove each specified product ID from the user's product list
    for (int pid : productIds) {
        user->removeProduct(pid);
    }
}
