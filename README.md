# Wolt Full-Stack Food Delivery Application

> 📌 **Assignment Note:** The main branch for this part of the assignment is `WOLT-Part5`.

This project is a multi-service food delivery application. It includes a containerized backend environment (Database, C++ recommendation engine, Express API gateway, React Web client) orchestrated using Docker Compose, alongside a React Native Mobile client built with Expo. 

---

## 1. System Architecture

The application is composed of five main components:
1. **C++ Recommendation Engine:** A high-performance engine that compiles using CMake inside Docker, runs automated unit tests during build time, and listens internally on port `8080` to compute product and restaurant suggestions.
2. **MongoDB Database:** Persists profiles, menus, user data, and order histories on port `27017`.
3. **Express API Server (Node.js):** The main REST API gateway on port `3000`. It handles JWT authentication, database queries, and interacts with the C++ engine over a TCP socket connection.
4. **React Web Frontend (Vite):** A web client served on port `5173`.
5. **React Native Mobile Client (Expo):** The mobile application located in the `mobile/` directory, which connects to the Express API backend to serve mobile users.

---

## 2. Quick Start & Execution

To build, compile, and run the entire environment using a **single terminal window**, execute the following:

### Step 1: Start the Backend & Web Services (in the background)
From the root directory of the project, run:
```bash
docker compose up -d db server web frontend
```

### Step 2: Start the Expo Mobile Client
In the **same terminal window**, navigate to the `mobile` directory, install local dependencies, and launch the Expo development packager:
```bash
cd mobile
npm install
npm start
```
Once the Metro bundler is active, you can scan the displayed QR code with the **Expo Go** application on your physical mobile device (on the same Wi-Fi network) or run it on an emulator.

---

## 3. Our Work Process

During this phase, we optimized the system architecture, refactored components, and integrated mobile interfaces:

1. **Component-Driven Mobile Refactoring:** 
   - Extracted inline JSX list elements from `HomeScreen.js` and `RestaurantDetailsScreen.js` into reusable custom React Native components.
   - This streamlined screen complexity and simplified maintenance.
2. **Docker Build Speed Optimization:** 
   - Configured `.dockerignore` files for both the root context and the client context.
   - Excluded heavyweight development directories (like `node_modules/`, `.git/`, `.expo/`, build caches), resulting in near-instant build times (avoiding massive file transfers to the Docker daemon).
3. **Mobile Client CRUD Integration:**
   - Designed and linked screens for adding, editing, and deleting restaurants and products, as well as submitting ratings and making or canceling/editing orders directly from the mobile app.
4. **C++ Recommendation Engine Integration:**
   - Extended the mobile app to communicate with the recommendation engine through Express, implementing personalized restaurant carousels and product co-view recommendations.

---

## 4. Documentation & User Guides (wiki)

Detailed user guides, system setup instructions, and step-by-step operation flows are stored in the [wiki](file:///c:/Users/user/Desktop/CS_Exercises/Wolt/ex1/Wolt/wiki/) directory:

- **System Setup & Execution:** See [`wiki/System-Setup-and-Docker-Compose.md`](file:///c:/Users/user/Desktop/CS_Exercises/Wolt/ex1/Wolt/wiki/System-Setup-and-Docker-Compose.md)
- **User Flows, CRUD Actions, & Recommendations:** See [`wiki/User-Flows-and-Operations.md`](file:///c:/Users/user/Desktop/CS_Exercises/Wolt/ex1/Wolt/wiki/User-Flows-and-Operations.md)
