
//good readme
# Recommendation System Using CLI:

This project is a C++ command-line interface (CLI) application designed to manage users product history and to provide personalized product recommendations. It utilizes user product history to identify similarities between users and suggest relevant items based on it.



## Architecture & Design Principles:

The system was built with a focus on SOLID principles and Loose Coupling to ensure future extensibility.



### Design Patterns Used:

**Encapsulation and Interfaces:** Every command is encapsulated in its own class (for example: Add, Recommend), inheriting from a common ICommand interface. This allows for adding new commands without modifying the current code.



**Repository And Data Managment:** Data access is abstracted via the IUserRepo interface. The MemoryUsers handles persistent storage in the data/ folder, but can be swapped for a database implementation easily.



**Dependency Injection:** High-level modules like the RecommendationEngine do not depend on low-level details; instead, they receive interfaces (like IInput) through their constructors.



### Project Structure:


Wolt/
├── data/               # Persistent data storage (users_db.txt)
├── src/                # All .cpp and .h source files
├── tests/              # Unit tests for all components
├── CMakeLists.txt      # Build system configuration
├── Dockerfile          # Configuration for Docker container
└── README.md           # Project documentation



## Docker Commands:



**Build the container properly:**
```
docker build -t wolt .
```

**Run tests without user input allowed:** 
```
docker run --rm wolt-app ./build/unit_tests 
```

**Run the project itself:**

   **using CMD:**
   ```
   docker run -it -v "%cd%/data:/usr/src/app/data" wolt
   ```
   **using POWERSHELL, LINUX and MACOS:**
   ```
   docker run -it --rm -v "${PWD}/data:/app/data" wolt-app ./build/ProductRecommendation
   ```


## Program Usage And Commands:

The application remains endlessly active and accepts the following commands:



**1. Add:** add [userid] [productid1] [productid2] ...

    -Associates products with a user. Data is automatically persisted to the data/data.txt file.

**2. Recommendations:** recommend [userid] [productid]

    -Provides up to 10 product recommendations based on the similarity algorithm.

**3. Help:** help

    -Displays the list of supported commands.



## Example:

**help**: as discraibed the command displays the list of supported commands: 
   ![Help command](images_readme\help_image.jpeg)

**add**: as discraibed the command add product id's to the users history: 
   ![add command](images_readme\add_image.jpeg)
   
**reccomend**: displays up to 10 reccomendations based on a product id that the user provide and simillarities with other users(if exsist): 
   ![recommend command](images_readme\recommend_image.jpeg)
