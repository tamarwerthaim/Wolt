# Wolt Web Application & REST API

> 📌 **Assignment Note:** The main branch for this part of the assignment is 'WOLT-Part4'.

This project is a full-stack Wolt-style food delivery application. It features a modern **React (Vite)** single-page application frontend and an **Express (Node.js)** REST API gateway backend. The application supports user registration, authentication, restaurant and menu management, order placement, and global search functionality. The system enforces secure stateless **JWT Authentication**, input validation rules, custom dark/light theme switching, and synchronizes user product views and orders to the recommendation engine in real-time.

---

## Architecture & Design Principles

The system is built on modern software engineering patterns, focusing on modularity, loose coupling, and clean division of concerns.

### MVC & SOLID Backend Design
- **Controllers:** Manage incoming HTTP requests, orchestrate backend logic, and return appropriate JSON payloads and HTTP status codes.
- **Models:** Abstract the in-memory data structures, filesystem persistent stores (`data/users_db.txt`), and data modification rules.
- **Routes:** Separated cleanly using Express Routers for each logical resource domain (`/api/users`, `/api/restaurants`, `/api/orders`, `/api/tokens`).
- **Socket Integration:** Abstracted inside a dedicated service layer (`socket.js`), decoupling the REST API routes from raw TCP socket communication with the C++ engine.

### React SPA Frontend Architecture
- **Component-Driven UI:** Decoupled into small, reusable React components (`Header`, `Cart`, `MenuItem`, `ProtectedRoute`) to ensure ease of testing and clean layouts.
- **State Management:** Employs React Hooks (`useState`, `useEffect`, `useRef`) for local, interactive component states and synchronization without page refreshes.
- **Client Routing:** Built using `react-router-dom` to support instant page transitions and maintain a smooth single-page application flow.
- **Theme Customization:** Implements a global context-based theme switcher between **Dark Mode** and **Light Mode**, instantly updating UI color variables.

### Security & JWT Authorization
- **Stateless Authentication:** Secure JWT tokens are issued upon successful credential verification (`/api/tokens`).
- **Authorization Headers:** All sensitive routes (profile updates, order history, checkout, admin commands) require the client to attach the token as a Bearer authorization header (`Authorization: Bearer <token>`).
- **Role-Based Guards (Admin/User):** Frontend routing (`ProtectedRoute.jsx`) and backend routers (`authenticateAdmin`) enforce privilege boundaries, ensuring only authenticated restaurant owners can add/edit/delete menu products or restaurants.

---

## Project Structure

```text
Wolt/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Screen page views
│   │   ├── assets/          # Visual assets & images
│   │   ├── App.jsx          # Main App & client routes
│   │   ├── index.css        # Global CSS variables & styles
│   │   └── main.jsx         # React mount entry point
│   ├── Dockerfile           # Frontend Docker config
│   └── package.json         # Frontend dependencies
├── controllers/             # Express controllers
├── models/                  # In-memory models & file storage
├── routes/                  # Express route definitions
├── middleware/              # Auth (JWT) & file upload (Multer) middleware
├── socket.js                # TCP connection client to C++ server
├── data/                    # Database file (users_db.txt)
├── src/                     # C++ server source files (.cpp)
├── include/                 # C++ header files (.h)
├── tests/                   # Automated tests
├── uploads/                 # Static uploads (Volume shared)
├── app.js                   # Express application setup
├── main.js                  # Node server entry point
├── CMakeLists.txt           # C++ compilation script
├── Dockerfile.server        # C++ server Docker config
├── Dockerfile.web           # Express server Docker config
├── docker-compose.yml       # Multi-container orchestration config
└── README.md                # Project documentation
```

---

## Running the Application (Docker Compose)

The entire multi-service application (React frontend, Express API backend, and C++ recommendation engine) compiles and runs using Docker Compose.

1. **Build the containers:**
   This step builds all Docker files, including compiling the C++ recommendation engine and running its automated unit tests:
   ```bash
   docker compose build
   ```

2. **Run all services:**
   This step runs all servers and mounts the shared uploads folder:
   ```bash
   docker compose up
   ```

Once booted, the application is mapped to the following local addresses:
- **React Frontend Client:** `http://localhost:5173`
- **Node.js REST API Server:** `http://localhost:3000`
- **C++ Recommendation Engine:** Port `8080` (runs internally inside container context)

> 💡 **Shared Uploads Volume:** The `uploads/` directory is bound as a shared Docker volume between the host and backend container. Image files uploaded during profile registration, restaurant creation, or product additions are immediately accessible by the React client.

---

## User Validation & Key Features

### 1. User Registration & Client Validation
When creating a new account on the **Sign Up** screen:
- **Mandatory Fields:** Username, Display Name, Geolocation (Latitude & Longitude), Phone, Password, Password Confirmation, and Profile Image.
- **Password Strength:** Must be at least 8 characters long and contain a combination of both letters and numbers.
- **Phone Validation:** Must match the Israeli mobile standard (10 digits, starting with `05`).
- **Geolocation Bounds:** Latitude must range between `-90` and `90`, and Longitude between `-180` and `180`.
- **Image Upload:** Supports uploading image files (`.png`, `.jpg`, `.jpeg`, `.webp`) from the local computer with a real-time visual preview before submission.

### 2. User Authentication & JWT Flow
- A user connects via the **Log In** screen by submitting their username and password.
- Upon successful login, the server returns a stateless JWT token, which is stored in `localStorage`.
- The top header dynamically updates to display the authenticated user's name and profile image, alongside their current shipping address.
- Logging out instantly wipes the token and cached credentials from `localStorage`, resets the cart, and redirects the user to the log in screen.

### 3. Theme Toggle (Dark & Light Mode)
- Once logged in, a theme toggle icon appears on the right side of the navigation header.
- Clicking the button dynamically updates the visual theme of the application (changing colors, backgrounds, borders, and text variables) between Dark Mode and Light Mode.

### 4. Single-Restaurant Cart Rule
- The shopping cart restricts items to a single restaurant.
- If a user attempts to add items from a different restaurant, they are prompted to clear their current cart or cancel the action.

### 5. User Roles & Permissions
During registration on the **Sign Up** screen, users can choose whether to register as a **Restaurant Owner** (by checking a box) or as a regular customer.

Permissions are defined as follows:
- **Guest (Non-Registered User):**
  - Browse restaurants and categories.
  - Search for restaurants or products using the global search bar.
  - View restaurant menus and product details.
- **Registered Customer:**
  - All Guest features.
  - Add products to the shopping cart and checkout (place orders).
  - View order placement history.
  - Rate restaurants.
  - Edit their profile details.
  - Toggle the application theme between **Dark Mode** and **Light Mode**.
- **Restaurant Owner (Admin):**
  - All Customer features.
  - Create new restaurants (Admin panel).
  - Edit existing restaurant profiles.
  - Delete restaurants.
  - Add new products to restaurant menus.
  - Edit existing menu products (prices, names, descriptions).
  - Delete products from the menus.

---

## REST API Endpoints

All endpoints receive and return data in **JSON format**.

### Users & Authentication
- **POST `/api/users`**: Register a new user (accepts `multipart/form-data` with fields: `username`, `password`, `displayName`, `phone`, `lat`, `lng`, `isAdmin`, and file `profileImage`).
- **GET `/api/users/:id`**: Get user profile details by ID (requires `Authorization: Bearer <token>`).
- **POST `/api/tokens`**: Authenticate a user (receives username & password in JSON body) and returns the JWT.

### Restaurants & Menu
- **GET `/api/restaurants`**: Get a list of all restaurants.
- **POST `/api/restaurants`**: Create a new restaurant (requires admin credentials, accepts `multipart/form-data` with `name`, `description`, and file `restaurantImage`).
- **GET `/api/restaurants/:id`**: Get details of a specific restaurant.
- **PATCH `/api/restaurants/:id`**: Update restaurant details (requires admin).
- **DELETE `/api/restaurants/:id`**: Delete a restaurant (requires admin).
- **POST `/api/restaurants/:id/rate`**: Submit a rating (requires user token).
- **GET `/api/restaurants/:id/products`**: Get all products (menu) of a restaurant.
- **POST `/api/restaurants/:id/products`**: Add a new product to a restaurant's menu (requires admin).
- **GET `/api/restaurants/:id/products/:pld`**: Get details of a specific product. *(Notifies C++ server about the view using `user-id` header)*.
- **PATCH `/api/restaurants/:id/products/:pld`**: Update a specific product (requires admin).
- **DELETE `/api/restaurants/:id/products/:pld`**: Remove a product from the menu (requires admin).

### Orders
- **POST `/api/orders`**: Create a new order (requires `Authorization: Bearer <token>`). *(Notifies C++ server about the ordered items)*.
- **GET `/api/orders`**: Get all orders for the currently logged-in user (requires `Authorization: Bearer <token>`).
- **GET `/api/orders/:id`**: Get order details by ID (requires `Authorization: Bearer <token>`).
- **PATCH `/api/orders/:id`**: Update order status (requires admin).
- **DELETE `/api/orders/:id`**: Delete an order (requires admin).

### Search
- **GET `/api/search/:query`**: Returns a list of restaurants and products that contain the `:query` string in their name or description.

---

## Execution Examples

### 1. Guest (General User) Views

- **Home Page (Upper section):** Displays categories, search bar, and login/signup shortcuts:
  ![Home Page Upper](images_readme/general/home_page_upper.png)

- **Home Page (Lower section):** Displays available restaurants grouped by promotions:
  ![Home Page Lower](images_readme/general/home_page_downer.png)

- **Register Screen:** Register screen featuring input fields, credentials validation, and profile image file upload:
  ![Register Screen](images_readme/general/register.png)
  
- **Login Screen:** Screen to authenticate existing users:
  ![Login Screen](images_readme/general/login.png)


- **Restaurant Menu Page:** Lists products of the selected restaurant:
  ![Restaurant Menu Page](images_readme/general/restaurant_page.png)

- **Product Detail View:** Modal popup displaying item details:
  ![Product Detail View](images_readme/general/product_page.png)

- **Global Search:** Dynamic filtering of matching restaurants and dishes:
  ![Global Search](images_readme/general/search.png)

---

### 2. Signed-In (Registered Customer) Views

- **Signed-In Home Page:** Features personalized navigation bar, greetings, and user address:
  ![Signed-In Home Page](images_readme/signed/home_page.png)

- **Dark Mode Home Page:** Active Dark Mode theme toggle:
  ![Dark Mode Home Page](images_readme/signed/dark_home_page.png)

- **Restaurant Page (Signed-In):** Interactive customer menu view with cart modifiers:
  ![Restaurant Page Signed-In](images_readme/signed/restaurant_page.png)

- **Shopping Cart Drawer:** Global cart displaying items and order total price:
  ![Shopping Cart Drawer](images_readme/signed/cart.png)


- **User Profile Dropdown:** Access via top avatar showing details, location, phone, and options:
  ![User Profile Summary](images_readme/signed/user_details.png)

- **Edit Profile Screen:** Form to modify name, phone, address, and profile picture:
  ![Edit Profile Screen](images_readme/signed/edit_user.png)

- **Order Placement History:** Lists user's past orders:
  ![Order Placement History](images_readme/signed/order_history.png)

- **Order Receipt Details:** Specific order summary breakdown:
  ![Order Details Receipt](images_readme/signed/order_details.png)

- **Cart Restaurant Mismatch Prompt:** Notification asking user confirmation before switching restaurants:
  ![Cart Restaurant Lock](images_readme/signed/edit_cart.png)
  
---

### 3. Restaurant Owner (Admin) Views

- **Admin Dashboard Home:** Lists restaurants with edit/delete buttons and create options:
  ![Admin Dashboard Home](images_readme/admin/home_page.png)

- **Restaurant Menu Page:Cart Restaurant Mismatch Promp** Displays the restaurant's menu — admins can add a new product to the menu or navigate to edit the restaurant's details directly from this page:
  ![Restaurant Menu Page Admin](images_readme/admin/restaurant_page.jpeg)

- **Add New Restaurant:** Form to upload banner and set restaurant metadata:
  ![Add New Restaurant](images_readme/admin/add_restaurant.png)

- **Edit Restaurant Details:** Modify restaurant fields and update images:
  ![Edit Restaurant Details](images_readme/admin/edit_restaurant.png)

- **Add Menu Product:** Admin form to append products to a restaurant's menu:
  ![Add Menu Product](images_readme/admin/add_product.png)

- **Edit Menu Product:** Form to update product names, pricing, descriptions, and pictures:
  ![Edit Menu Product](images_readme/admin/edit_product.png)
