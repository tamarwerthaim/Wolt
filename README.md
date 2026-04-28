# Wolt

## Project Overview
This system is a command-line driven recommendation engine for a delivery platform. It allows adding users and their purchase history, while providing smart product recommendations based on user similarity (Collaborative Filtering). The project emphasizes clean code, design patterns, and data persistence.

## Features
- **Smart Recommendations:** Uses a weighted algorithm to suggest products based on shared interests between users.
- **Data Persistence:** Automatically saves and loads data from a local file (`users_db.txt`), ensuring information is kept even after the program closes.
- **Command Pattern:** Decoupled architecture where every action (Add, Recommend, Help) is its own command object.
- **Robust Parsing:** Handles irregular inputs, extra spaces, and invalid data types using `std::stringstream`.
- **Comprehensive Testing:** Over 20 unit tests covering every edge case from memory management to math logic.

## File Structure & Responsibilities

### Core Logic (`src` & `include`)
- **`User.h / .cpp`**: Manages user identity and their set of purchased products.
- **`Product.h / .cpp`**: Simple data model for products.
- **`Recommend.h / .cpp`**: The heart of the system. Implements the recommendation algorithm and tie-breaking logic.
- **`Add.h / .cpp`**: Handles the addition of new users and products to the repository.
- **`Help.h / .cpp`**: Provides the user with a list of available commands and their usage.
- **`MemoryUsers.h / .cpp`**: Acts as the system's "Database". Manages memory-resident users and synchronizes them with the physical storage file.

### Infrastructure & Interfaces
- **`ICommand.h`**: Interface for all executable commands.
- **`IInput.h / IOutput.h`**: Interfaces for input/output sources (Console or File).
- **`IUserRepo.h`**: Interface for user storage, allowing for future DB integrations.
- **`Console.h / .cpp`**: Concrete implementation of `IOutput` for terminal display.
- **`File.h / .cpp`**: Concrete implementation for file-based operations.

### Entry Points
- **`app.h / .cpp`**: The main application controller. Manages the command loop and initializes dependencies.
- **`main.cpp`**: The bootstrap file that kicks off the application.

## The Recommendation Algorithm
The system calculates a "Similarity Weight" for every user compared to the target user:
1. **Identify Peers:** Find all users who bought the "Context Product".
2. **Calculate Weight:** For each peer, count how many *other* products they share with the target user.
3. **Score Products:** For every product the target hasn't seen yet, add the peer's weight to that product's score.
4. **Rank & Filter:** Sort products by Score (highest first) and ID (lowest first as a tie-breaker). Return the Top 10.

## Persistence
All data is stored in `users_db.txt`. 
- **Saving:** Every time the `add` command is used, the repo appends the new data to the file.
- **Loading:** Upon startup, `MemoryUsers` reads the file and reconstructs the user base in memory.

## Build and Run

### Prerequisites
- Docker (Recommended)
- CMake & GCC (For local builds)

### Using Docker
1. **Build the project:**
   ```bash
   docker build -t wolt-app .