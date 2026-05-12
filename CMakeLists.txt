cmake_minimum_required(VERSION 3.10)
project(WoltRecommendationSystemV2)

# --- General Settings ---
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Inclusion of directories for headers
include_directories(src)
include_directories(.)
include_directories(include)

# --- Main Application Target (Server) ---
# Added new Command classes (POST, GET, PATCH, DELETE) and Networking (Server, SocketIO)
add_executable(ProductRecommendation 
    src/main.cpp 
    src/Server.cpp
    src/SocketIO.cpp
    src/APP.cpp
    src/User.cpp 
    src/Product.cpp
    src/MemoryUsers.cpp
    src/File.cpp
    src/Console.cpp
    src/Help.cpp
    src/POST.cpp     
    src/GET.cpp       
    src/PATCH.cpp
    src/BaseAddCommands.cpp  
    src/CommandException.cpp   
    src/Delete.cpp
)

# Linking pthread is required for socket-based networking in Linux
target_link_libraries(ProductRecommendation pthread)

# --- Testing Infrastructure ---
find_package(GTest REQUIRED)
include_directories(${GTEST_INCLUDE_DIRS})

# The test executable includes all logic classes and their corresponding tests
add_executable(unit_tests 
    tests/test_main.cpp 
    # Logic Classes
    src/User.cpp 
    src/Product.cpp
    src/MemoryUsers.cpp
    src/APP.cpp
    src/Server.cpp
    src/SocketIO.cpp
    src/File.cpp
    src/Console.cpp
    src/Help.cpp
    src/POST.cpp
    src/GET.cpp
    src/PATCH.cpp
    src/BaseAddCommands.cpp
    src/CommandException.cpp
    src/Delete.cpp
    # Test Files
    tests/UserTests.cpp
    tests/ProductTests.cpp
    tests/MemoryUsersTest.cpp
    tests/ConsoleTests.cpp
    tests/FileTests.cpp
    tests/HelpTests.cpp
    tests/appTest.cpp
    tests/POSTTests.cpp    
    tests/GETTest.cpp    
    tests/PATCHTests.cpp  
    tests/DeleteTests.cpp
    tests/ServerTests.cpp # Add if you create server-specific tests
    tests/SocketIOTests.cpp
)

# Link tests with GTest and threading support
target_link_libraries(unit_tests ${GTEST_LIBRARIES} GTest::GTest GTest::Main pthread)