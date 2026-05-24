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

*(Add images of requests and responses here, e.g., Postman or cURL screenshots, as required by the assignment).*
