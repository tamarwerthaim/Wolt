#include "Product.h"

// constractor
Product::Product(int id) : productID(id) {}

// return ID
int Product::getID() const { 
        return productID; 
}