# System Setup and Docker Compose Orchestration

This guide explains how to compile, build, and run the entire application environment using Docker Compose alongside the React Native mobile client.

---

## Orchestrating and Running the System

To build, compile, and run the entire environment (Backend, Web Frontend, Database, C++ engine, and Mobile client)  follow these steps:

### Step 1: Spin up the Backend & Web Services (in the background)
From the root directory of the project, run:
```bash
docker compose up -d db server web frontend

```

### Step 2: Start the Expo Mobile Client
In the **same terminal window**, navigate to the `mobile` directory. If you are running the project for the first time, install the dependencies, then start the Expo development server:
```bash
cd mobile
npm install
npm start
```

### Accessing the Applications
- **React Web Client:** Open `http://localhost:5173` in your web browser.
- **React Native Mobile Client:** Scan the QR code displayed in your terminal using the **Expo Go** application on your physical device, or run it on an emulator.
- **Express API Server:** Running locally on `http://localhost:3000`.
- **MongoDB Database:** Running on `mongodb://localhost:27017`.

---

## User Flows and Guides

For step-by-step guides on user registration, login, and creating/editing/deleting restaurants, products, and orders, please see the [User Flows and Operations Guide](file:///c:/Users/user/Desktop/CS_Exercises/Wolt/ex1/Wolt/wiki/User-Flows-and-Operations.md).
