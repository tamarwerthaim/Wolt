#include "User.h"
#include <set>

//constructor
User::User(int id) : userID(id) {}

// Adds a product to the list.
void User::addProduct(const Product& p) {
    productList.insert(p);
}

// Returns a reference to the product list.
const std::set<Product>& User::getProducts() const {
    return productList;
}

//check if the product exist
int User::getID() const { 
    return userID; 
}

//check if the product exist
bool User::hasProduct(int id) const {
    for (const auto& product : productList) {
        if (product.getID() == id) {
            return true;
        }
    }
    return false;
}

// Remove a product from the user's list by its ID
void User::removeProduct(int productId) {
    std::erase_if(productList, [productId](const Product& p) {
        return p.getID() == productId;
    });
}