#include "Add.h"
#include "Product.h"
#include <algorithm> //std::find_if
#include <set>
#include <vector>

Add::Add(IUserRepo& repo, IInput& input) : repo(repo), input(input) {}

void Add::execute() {
    int userId = input.readInt();
    std::vector<int> rawProductIds = input.readIntList();

    if (rawProductIds.empty()) {
        return; 
    }

    std::set<int> uniqueProductIds(rawProductIds.begin(), rawProductIds.end());

    User& user = getOrCreateUser(userId);

    for (int pid : uniqueProductIds) {
        user.addProduct(Product(pid));
    }
}

User& Add::getOrCreateUser(int userId) {
    // create vector of all users 
    std::vector<User>& allUsers = repo.getUsers();

    // check if the user are exict
    // find if- find the first object that..
    // auto- std::vector<User>::iterator
    auto iterator = std::find_if(allUsers.begin(), allUsers.end(), [userId](const User& user) {
        return user.getId() == userId;
    });

    // the user are not exict
    if (iterator == allUsers.end()) {
        // create user
        repo.addUser(User(userId));
        // the last reference
        return allUsers.back();
    }

    return *iterator;
}