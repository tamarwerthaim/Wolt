#include "Product.h"

//constructor
Product::Product(int id) : productID(id) {}

//getter for the product ID
int Product::getID() const { 
        return productID; 
}

// define the operator : <
bool Product::operator<(const Product& other) const {
    return this->productID < other.productID;
}