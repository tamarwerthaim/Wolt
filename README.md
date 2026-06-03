# Wolt Web Server - REST API

> 📌 **Assignment Note:** The main branch for this part of the assignment is `WOLT-Part3`.

This project is a Node.js REST API server application designed to serve as the core of a Wolt-style food delivery application. It provides HTTP endpoints for managing users, authentication, restaurants, products, orders, and a global search functionality. In addition, it integrates with a C++ recommendation server via TCP sockets to update user product views in real-time.

## Architecture & Design Principles

The system was built with a focus on the **MVC (Model-View-Controller)** architecture and **SOLID** principles, ensuring loose coupling and future extensibility.

### MVC & SOLID Design
- **Controllers:** Responsible for request handling and business logic orchestration, returning proper HTTP status codes and JSON responses.
- **Models:** Encapsulate the in-memory data structures and data access logic, keeping data manipulation isolated from the routing logic.
- **Routes:** Separated cleanly using Express Routers for each logical domain (`/api/users`, `/api/restaurants`, etc.).
- **Socket Integration:** Communication with the C++ server is abstracted into a dedicated socket service file (`socket.js`), ensuring the core controllers are decoupled from the low-level TCP logic.

## Project Structure

```text
Wolt/
├── controllers/             # Handles business logic and HTTP responses
├── models/                  # In-memory data structures and logic
├── routes/                  # Express route definitions
├── socket.js                # External integrations (TCP Socket to C++ Server)
├── data/                    # Persistent data storage (users_db.txt)
├── src/                     # All .cpp source files
├── include/                 # All header (.h) files
├── tests/                   # Unit tests for all components
├── app.js                   # Express app configuration and middleware setup
├── main.js                  # Server entry point
├── CMakeLists.txt           # CMake build configuration
├── Dockerfile.server        # Docker configuration for C++ server
├── Dockerfile.client        # Docker configuration for Python client
├── Dockerfile.web           # Docker configuration for Node.js server
├── docker-compose.yml       # Docker Compose orchestration
├── client.py                # Python client for server communication
└── README.md                # Project documentation
```

## Running the Application

## Docker Commands

**Build the containers:**
```bash
docker compose build
```

**Run the web server and C++ server:**
```bash
docker compose up web server
```
The Node.js server will be available at `http://localhost:3000`.

### Running Locally without Docker
1. Make sure you have Node.js installed.
2. Run `npm install` to install dependencies (e.g., Express).
3. Run `npm start` or `node main.js` to start the server.

## REST API Endpoints

The application accepts the following REST API endpoints. All data is returned in **JSON format**.

### Users & Authentication
- **POST `/api/users`**: Register a new user (receives username, password, name, phone, address).
- **GET `/api/users/:id`**: Get user profile details by ID.
- **POST `/api/tokens`**: Authenticate a user (receives username & password) and returns the user ID.

### Restaurants & Menu
- **GET `/api/restaurants`**: Get a list of all restaurants.
- **POST `/api/restaurants`**: Create a new restaurant.
- **GET `/api/restaurants/:id`**: Get details of a specific restaurant.
- **PATCH `/api/restaurants/:id`**: Update a restaurant's details.
- **DELETE `/api/restaurants/:id`**: Delete a restaurant.
- **GET `/api/restaurants/:id/products`**: Get all products (menu) of a restaurant.
- **POST `/api/restaurants/:id/products`**: Add a new product to a restaurant's menu.
- **GET `/api/restaurants/:id/products/:pld`**: Get details of a specific product. *(Notifies C++ server about the view)*.
- **PATCH `/api/restaurants/:id/products/:pld`**: Update a specific product.
- **DELETE `/api/restaurants/:id/products/:pld`**: Remove a product from the menu.

### Orders
- **POST `/api/orders`**: Create a new order (requires `user-id` HTTP header). *(Notifies C++ server about the ordered items)*.
- **GET `/api/orders`**: Get all orders for the currently logged-in user (requires `user-id` HTTP header).
- **GET `/api/orders/:id`**: Get order details by ID.
- **PATCH `/api/orders/:id`**: Update an order's status or details.
- **DELETE `/api/orders/:id`**: Delete an order.

### Search
- **GET `/api/search/:query`**: Returns a list of restaurants and products that contain the `:query` string in their name or description.

## Execution Examples

### Users & Authentication

**POST `/api/users`**: Registers a new user with signup details provided as a JSON payload in the request body:
   ![Register User](images_readme/users-POST.png)

**GET `/api/users/:id`**: Displays the profile details of a specific user matching the provided ID:
   ![Get User Profile](images_readme/users-ID-GET.png)

**POST `/api/tokens`**: Authenticates credentials, returning the user's unique ID upon successful login:
   ![User Authentication Token](images_readme/tokens-POST.png)

---

### Restaurants & Menu

**GET `/api/restaurants`**: Displays a comprehensive list of all active restaurants currently available in the system:
   ![Get All Restaurants](images_readme/rastaurants-GET.png)

**POST `/api/restaurants`**: Creates and stores a new restaurant instance in the database memory:
   ![Create Restaurant](images_readme/restaurants-POST.png)

**GET `/api/restaurants/:id`**: Retrieves detailed structural profile properties and metadata for a specific restaurant ID:
   ![Get Restaurant Details](images_readme/restaurants-ID-GET.png)

**PATCH `/api/restaurants/:id`**: Modifies or updates editable details of an existing restaurant record:
   ![Update Restaurant](images_readme/restaurants-ID-PATCH.png)

**DELETE `/api/restaurants/:id`**: Permanently purges and deletes a specific restaurant entry from the system:
   ![Delete Restaurant](images_readme/restaurants-ID-DELETE1.png)
   ![Delete Restaurant](images_readme/restaurants-ID-DELETE2.png)

**GET `/api/restaurants/:id/products`**: Lists all food menu products associated with the given restaurant ID:
   ![Get Restaurant Menu Products](images_readme/products-GET.png)

**POST `/api/restaurants/:id/products`**: Inserts a new menu product item directly under a targeted restaurant's ID:
   ![Add Product to Menu](images_readme/products-POST.png)

**GET `/api/restaurants/:id/products/:pId`**: Displays information for a single specific product and synchronizes the real-time interaction to the C++ server:
   ![Get Product Details](images_readme/products-ID-GET.png)

**PATCH `/api/restaurants/:id/products/:pId`**: Updates the price, description, or configuration fields of an existing menu item:
   ![Update Product Details](images_readme/products-ID-PATCH.png)

**DELETE `/api/restaurants/:id/products/:pId`**: Remotely wipes out and clears a specific product option from the chosen restaurant menu:
   ![Delete Product from Menu](images_readme/products-ID-DELETE1.png)
   ![Delete Product from Menu](images_readme/products-ID-DELETE2.png)

---

### Orders

**POST `/api/orders`**: Dispatches a new customer transaction request, recording items and routing telemetry to the C++ engine:
   ![Create New Order](images_readme/orders-POST.png)

**GET `/api/orders`**: Pulls up the complete private order placement ledger history associated with the current user-id session:
   ![Get User Order History](images_readme/orders-GET.png)

**GET `/api/orders/:id`**: Resolves the exact checkout details and cost pricing breakdown belonging to a single unique order ID:
   ![Get Order Receipt Details](images_readme/orders-ID-GET.png)

**PATCH `/api/orders/:id`**: Alters current order milestones or changes delivery staging states:
   ![Update Order Status](images_readme/orders-ID-PATCH.png)

**DELETE `/api/orders/:id`**: Revokes and completely removes an existing client order record from log memory:
   ![Delete Order Record](images_readme/orders-DELETE1.png)
   ![Delete Order Record](images_readme/orders-DELETE2.png)

---

### Search

**GET `/api/search/:query`**: Queries database text to parse matches, matching strings against names and descriptions:
   ![Search Query Results](images_readme/search-GET.png)
