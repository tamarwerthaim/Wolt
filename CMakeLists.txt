cmake_minimum_required(VERSION 3.10)
project(ProductRecommendation)

set(CMAKE_CXX_STANDARD 17)
include_directories(include)
include_directories(src)
include_directories(.)

# --- Main Application Target ---
# Including all logic classes shown in the UML
add_executable(ProductRecommendation 
    src/main.cpp 
    src/User.cpp 
    src/Product.cpp
    src/Add.cpp
    src/MemoryUsers.cpp
    src/Help.cpp
    src/Recommend.cpp
    src/APP.cpp
    src/File.cpp
    src/Console.cpp
)

# --- Testing Infrastructure (WOLT-24) ---
find_package(GTest REQUIRED)
include_directories(${GTEST_INCLUDE_DIRS})

# The test executable targets the logic inside the 'Recommend' class
add_executable(unit_tests 
    tests/test_main.cpp 
    tests/RecommendTest.cpp 
    src/User.cpp 
    src/Product.cpp
    src/Recommend.cpp
    tests/UserTests.cpp
    tests/ProductTests.cpp
    src/Add.cpp
    tests/AddTests.cpp
    src/MemoryUsers.cpp
    tests/MemoryUsersTest.cpp
    src/MemoryUsers.cpp
    src/Recommend.cpp
    src/Console.cpp
    tests/ConsoleTests.cpp
    src/File.cpp
    tests/FileTests.cpp
    tests/HelpTests.cpp
    tests/appTest.cpp
    src/Help.cpp
    src/APP.cpp
)

# Link tests with GTest and threading support
target_link_libraries(unit_tests ${GTEST_LIBRARIES} pthread)