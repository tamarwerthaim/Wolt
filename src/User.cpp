#include "User.h"
#include <set>

User::User(int id) : userID(id) {}

void User::addProduct(const Product& p) {
    productList.insert(p);
}

const std::set<Product>& User::getProducts() const {
    return productList;
}

int User::getID() const { 
    return userID; 
}