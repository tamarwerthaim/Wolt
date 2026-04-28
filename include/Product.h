#ifndef PRODUCT_H
#define PRODUCT_H

class Product {
private:
    // filds
    int productID;

public:
    // Constructor to initialize product with an ID
    Product(int id);
    // Getter method - 'const' ensures it doesn't modify the object
    int getID() const;
    // Comparison operator for std::set ordering and duplicate detection
    bool operator<(const Product& other) const;
};

#endif