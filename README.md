
# Wolt Product Recommendation System

A robust C++ recommendation engine designed to provide personalized product suggestions using a **Collaborative Filtering** algorithm. The system analyzes user purchase history to find similarities between users and recommends products that "similar" customers enjoyed.

## Overview
This application serves as a backend for a product recommendation service. It manages a repository of users and their purchased products, ensuring data consistency and persistence. Built with a modular architecture, it utilizes the **Command Pattern** to handle user inputs and a **Repository Pattern** for data management.

## Key Features
* **Intelligent Recommendations:** Uses a weighted scoring system based on shared purchase history.
* **Data Persistence:** Automatically saves and loads user data from `data/users_db.txt`, ensuring information is never lost between sessions.
* **Input Validation:** Robust parsing logic that handles extra spaces, invalid characters, and incorrect command formats without crashing.
* **Dockerized Environment:** Fully containerized for easy deployment and consistent testing across different machines.
* **Unit Tested:** Comprehensive test suite using **Google Test (GTest)** covering edge cases, persistence, and algorithm accuracy.

## Project Structure
The project is organized to maintain a clean separation between logic, data, and tests:

```text
Wolt/
├── data/               # Persistent data storage (users_db.txt)
├── src/                # All .cpp and .h source files
├── tests/              # Unit tests for all components
├── CMakeLists.txt      # Build system configuration
├── Dockerfile          # Configuration for Docker container
└── README.md           # Project documentation


## Running Instructions
Prerequisites
Docker Desktop installed and running.

1. Build the Docker Image
Navigate to the root directory of the project and run:
docker build -t wolt-app .

2. Run the Interactive Application
To ensure that data persists on your host machine, use a volume to link the data directory:
docker run -it --rm -v "${PWD}/data:/app/data" wolt-app ./build/ProductRecommendation

3. Run Unit Tests
To verify all system components:
docker run --rm wolt-app ./build/unit_tests

Run Examples
Once the application is running, you can use the following commands:

Adding Data
Format: add [userId] [productId1] [productId2] ...

Plaintext
add 1 100 101 102 103
add 2 101 102 104 105 106
User 1 and User 2 now share products 101 and 102, creating a similarity "weight" of 2.

Getting Recommendations
Format: recommend [userId] [productId]

Plaintext
recommend 1 101
Expected Output:

Plaintext
104 105 106
Explanation: The system finds that User 2 is similar to User 1. Since User 2 also bought 104, 105, and 106, these are recommended to User 1.

Help Command
To see all available commands:

Plaintext
help
Technical Details
Language: C++11/14/17

Algorithm: Collaborative Filtering. Similarity is calculated by the number of shared products between the target user and others, excluding the current product ID provided in the recommend command.

Ranking: Recommendations are sorted by their cumulative weight (higher first). In case of a tie, the lower Product ID is prioritized.

Persistence: The MemoryUsers class ensures all add operations are flushed to data/users_db.txt using the saveAllToFile method.