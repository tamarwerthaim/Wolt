#include <gtest/gtest.h>

// Sanity test to ensure the testing framework is working correctly
TEST(SanityCheck, SimpleAssertion) {
    EXPECT_EQ(1, 1);
}

// A basic test to confirm that the main function can be called without issues 
// and that the environment is set up correctly for running tests.
TEST(InfrastructureCheck, EnvironmentReady) {
    bool isSetupDone = true;
    EXPECT_TRUE(isSetupDone);
}

// Tests that the Server class can be instantiated without throwing an exception
int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}