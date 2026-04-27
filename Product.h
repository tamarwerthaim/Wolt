#ifndef PRODUCT_H
#define PRODUCT_H

class Product {
private:
    int productID;

public:
    Product(int id);
    int getID() const;
};

#endif