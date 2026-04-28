#ifndef USER_H
#define USERE_H

#include "Product.h"
#include <vector>

class User{
    private:
        int userID;
        std::vector<Product> productList;

    public:
        User(int id);
        void addProduct(const Product& p);
        const std::vector<Product>& getProducts() const;
        int getID() const;
};

#endif

