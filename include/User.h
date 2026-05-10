#ifndef USER_H
#define USER_H

#include "Product.h"
#include <set>

class User{
    private:
        // filds
        int userID;
        // Internal collection to store user's products
        std::set<Product> productList;

    public:
        // Constructor- Initializes a new user with a specific ID
        User(int id);

        // Adds a product to the list. 
        // Uses 'const Product&' to avoid unnecessary memory copying.
        void addProduct(const Product& p);

        // Returns a reference to the product list.
        // 'const' return type ensures the caller can read but not modify the list.
        const std::set<Product>& getProducts() const;

        // Getter for the user ID. 'const' ensures the method is read-only.
        int getID() const;

        //check if the product exist
        bool hasProduct(int id) const;

        // Remove a product from the user's list by its ID
        void removeProduct(int productId);
};

#endif

