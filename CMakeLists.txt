cmake_minimum_required(VERSION 3.10)
project(ProductRecommendation)

set(CMAKE_CXX_STANDARD 14)

# --- Main Application Target ---
# Including all logic classes shown in the UML
add_executable(ProductRecommendation 
    src/main.cpp 
    #src/User.cpp 
    #src/Product.cpp
    #src/MemoryUsers.cpp
    #src/Add.cpp
    #src/Help.cpp
    #src/Recommend.cpp
    #src/App.cpp
    #src/File.cpp
    #src/Console.cpp
)

# --- Testing Infrastructure (WOLT-24) ---
find_package(GTest REQUIRED)
include_directories(${GTEST_INCLUDE_DIRS})

# The test executable targets the logic inside the 'Recommend' class
add_executable(unit_tests 
    tests/test_main.cpp 
    #tests/RecommendTests.cpp 
    #src/User.cpp 
    #src/Product.cpp
    #src/MemoryUsers.cpp
    #src/Recommend.cpp
)

# Link tests with GTest and threading support
target_link_libraries(unit_tests ${GTEST_LIBRARIES} pthread)