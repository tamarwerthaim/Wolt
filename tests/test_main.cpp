#include <gtest/gtest.h>

// Sanity test to ensure the testing framework is working correctly
TEST(SanityCheck, SimpleAssertion) {
    EXPECT_EQ(1, 1);
}

TEST(InfrastructureCheck, EnvironmentReady) {
    bool isSetupDone = true;
    EXPECT_TRUE(isSetupDone);
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}