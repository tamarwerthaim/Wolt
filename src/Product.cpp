#include "Product.h"

Product::Product(int id) : productID(id) {}

int Product::getID() const { 
        return productID; 
}