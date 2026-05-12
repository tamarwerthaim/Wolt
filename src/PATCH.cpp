#include "PATCH.h"
#include "Product.h"
#include <algorithm> //std::find_if
#include <set>
#include <vector>
#include <sstream>

PATCH::PATCH(IUserRepo& repo) : BaseAddCommands(repo) {}

void PATCH::execute(IOutput& out) {
    // Struct to hold the parsed user ID and product list
    AddCommandData data;

    // Check if the input format is valid and fill the 'data' struct
    // (This uses the logic from the base class)
    if (!parseAndValidate(data)) {
        out.write("400 Bad Request\n");
        return;
    }

    // Try to find the user in the repository
    User* existingUser = findUser(data.userId);

    // PATCH should only work if the user ALREADY exists in the system
    if (existingUser != nullptr) {
        // Use the base class method to add the products and save to file
        addProductsToUser(existingUser, data);
        
        // According to requirements: return 204 for a successful update
        out.write("204 No Content\n");
    } else {
        // If the user is not found, return 404
        out.write("404 Not Found\n");
    }
}