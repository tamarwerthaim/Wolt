#include <gtest/gtest.h>
#include "Product.h"
// try to create Product
TEST(ProductTests, ConstructorAndGet){
    Product p(101);
    EXPECT_EQ(p.getID(), 101);
}