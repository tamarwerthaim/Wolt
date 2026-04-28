#include "Product.h"

Product::Product(int id) : productID(id) {}

int Product::getID() const { 
        return productID; 
}

bool Product::operator<(const Product& other) const {
    return this->productID < other.productID;
}