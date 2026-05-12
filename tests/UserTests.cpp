#include <gtest/gtest.h>
#include "User.h"
#include "Product.h"

// try to create User
TEST(UserTests, ConstructorAndGet){
    User u(55);
    EXPECT_EQ(u.getID(), 55);
}

// try to add product
TEST(UserTests, AddProductToUser) {
    User u(1);
    Product p(101);
    u.addProduct(p);
    ASSERT_EQ(u.getProducts().size(), 1);
    EXPECT_TRUE(u.hasProduct(101));
}

// try to add some products
TEST(UserTests, AddSomeProducts) {
    User u(1);
    u.addProduct(Product(101));
    u.addProduct(Product(102));
    u.addProduct(Product(103));

    ASSERT_EQ(u.getProducts().size(), 3);
    EXPECT_TRUE(u.hasProduct(101));
    EXPECT_TRUE(u.hasProduct(102));
    EXPECT_TRUE(u.hasProduct(103));
}

//try to add the same product
TEST(UserTests, AddSameProducts){
    User u(1);
    u.addProduct(Product(101));
    u.addProduct(Product(101));

    ASSERT_EQ(u.getProducts().size(), 1);
    EXPECT_TRUE(u.hasProduct(101));  
}