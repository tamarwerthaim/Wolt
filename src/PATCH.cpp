#include "PATCH.h"
#include "Product.h"
#include <algorithm> //std::find_if
#include "CommandException.h"
#include <set>
#include <vector>
#include <sstream>

PATCH::PATCH(IUserRepo& repo) : BaseAddCommands(repo) {}

void PATCH::execute(IOutput& out) {
    // Struct to hold the parsed user ID and product list
    AddCommandData data;

    // Check if the input format is valid and fill the 'data' struct
    // (This uses the logic from the base class)
    parseAndValidate(data);

    // Try to find the user in the repository
    User* existingUser = findUser(data.userId);

    // If the user doesn't exist, we can't update it, so we throw a logical error
    if (existingUser == nullptr) {
        throw LogicalErrorException();
    }

    // If the user exists, we add the new products to their list and write a success message
    addProductsToUser(existingUser, data);
    out.write("204 No Content\n");
}