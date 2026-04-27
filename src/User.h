#ifndef USER_H
#define USERE_H

#include "Product.h"
#include <vector>

class User{
    private:
        // filds
        int userID;
        // Internal collection to store user's products
        std::vector<Product> productList;

    public:
        // Constructor- Initializes a new user with a specific ID
        User(int id);

        // Adds a product to the list. 
        // Uses 'const Product&' to avoid unnecessary memory copying.
        void addProduct(const Product& p);

        // Returns a reference to the product list.
        // 'const' return type ensures the caller can read but not modify the list.
        const std::vector<Product>& getProducts() const;
        
        // Getter for the user ID. 'const' ensures the method is read-only.
        int getID() const;
};

#endif

