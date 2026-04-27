cmake_minimum_required(VERSION 3.10)
project(ProductRecommendation)

# Use C++14 standard as required for the project
set(CMAKE_CXX_STANDARD 14)

# Define the main executable target
# Ensure all .cpp source files in the src directory are listed here
add_executable(ProductRecommendation 
    src/main.cpp 
    #src/User.cpp 
    #src/RecommendationEngine.cpp
)

# --- Testing Infrastructure (Temporarily disabled for WOLT-8) ---
# To re-enable testing, uncomment these lines once the tests directory is restored.
# find_package(GTest REQUIRED)
# include_directories(${GTEST_INCLUDE_DIRS})

# add_executable(unit_tests 
#     tests/test_main.cpp 
#     tests/RecommendationTests.cpp 
#     src/User.cpp 
#     src/RecommendationEngine.cpp
# )

# target_link_libraries(unit_tests ${GTEST_LIBRARIES} pthread)