#include "POST.h"
#include "Product.h"
#include <algorithm> //std::find_if
#include "CommandException.h"
#include <set>
#include <vector>
#include <sstream>

POST::POST(IUserRepo& repo) : BaseAddCommands(repo) {}

void POST::execute(IOutput& out) {
    // Struct to hold the parsed user ID and product list
    AddCommandData data;

    // Check if the input format is valid and fill the 'data' struct with values
    parseAndValidate(data);

    // Look for the user in the repository
    User* existingUser = findUser(data.userId);

    // If the user already exists, we can't create it again, so we throw a logical error
    if (existingUser != nullptr) {
        throw LogicalErrorException();
    }

    // If the user doesn't exist, we create a new user, add it to the repo, and add the products to it
    User* newUser = new User(data.userId);
    repo.addUser(newUser); 
    addProductsToUser(newUser, data);
    // Write a success message to the output
    out.write("201 Created\n");
}
