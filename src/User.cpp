#include "User.h"

User::User(int id) : userID(id) {}

void User::addProduct(const Product& p) {
    productList.push_back(p);
}

const std::vector<Product>& User::getProducts() const {
    return productList;
}

int User::getID() const { 
    return userID; 
}