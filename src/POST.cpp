#include "POST.h"
#include "Product.h"
#include <algorithm> //std::find_if
#include <set>
#include <vector>
#include <sstream>

POST::POST(IUserRepo& repo) : BaseAddCommands(repo) {}

void POST::execute(IOutput& out) {
    // Struct to hold the parsed user ID and product list
    AddCommandData data;

    // Check if the input format is valid and fill the 'data' struct with values
    if (!parseAndValidate(data)) {
        out.write("400 Bad Request\n"); 
        return;
    }

    // Look for the user in the repository
    User* existingUser = findUser(data.userId);

    // POST should only create a user if they are not in the system yet
    if (existingUser == nullptr) {
        // Create the new user and add them to the database
        User* newUser = new User(data.userId);
        repo.addUser(newUser); 
        
        // Use the base class method to add all products and save to file
        addProductsToUser(newUser, data);
        
        // Return success status for creation
        out.write("201 Created\n");
    } else {
        // If the user already exists, return 404 according to the project rules
        out.write("404 Not Found\n");
    }
}
