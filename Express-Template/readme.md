# 💻 ExpressJs TypeScript Template By <span style="color: blue;">BRYAN GABRIEL RUBIO</span> 🤖

Welcome to the **Express.js TypeScript Template** by Bryan Gabriel Rubio! This template provides a scalable and clean structure for building RESTful APIs with **Express.js** using **TypeScript**. 🚀

---

## 🚀 Project Structure

This project follows a modular architecture for easy scalability and maintainability. Below is an overview of the project structure:

### 🌐 **`index.ts`**
The entry point of the application. This file initializes the server, connects to the database, and sets up the routes.

### 🛠️ **`utils/`**
Contains utility functions and helpers like error handling, validation, and configuration management.
- **`envalid.ts`**: A module for managing environment variables and validation.
- **`httpError.ts`**: Utility for handling custom HTTP errors.

### 🌍 **`routes/`**
Defines all the routes of the application. It maps HTTP methods (GET, POST, PUT, DELETE) to the respective controllers.

### 🧑‍💻 **`controllers/`**
Handles business logic and interacts with services. It’s responsible for receiving requests from the routes and responding with appropriate data or errors.

### ⚙️ **`services/`**
Contains the core business logic and is responsible for interacting with the repository layer. Services implement methods like creating, updating, deleting, and fetching data.
- **`servicesImplementation/`**: Implementations of services that perform specific actions.
  
### 🗂️ **`repository/`**
Defines database queries and logic for interacting with the models (using Mongoose in this case). Repository abstracts the database access layer, ensuring that services interact with data efficiently.

### 🏗️ **`models/`**
Contains Mongoose models and schemas that define how data is structured in the database. Models are used by repositories for CRUD operations.

### 🛡️ **`middleware/`**
Contains middleware functions like authentication, logging, or request validation.

### ⚙️ **`config/`**
Holds configuration files for setting up the environment, connecting to the database, and defining other app-wide settings.
- **`databaseConfig.ts`**: Configuration for connecting to MongoDB.
- **`serverConfig.ts`**: Defines server settings such as port and base URL.

### 👀 **`views/`**
Contains HTML or template files if the project serves HTML content (e.g., with a view engine like EJS or Pug).

---

## 🔧 Getting Started

### Prerequisites
Make sure you have **Node.js** and **npm** installed. You can download them from [here](https://nodejs.org/).

### Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/your-repo/express-typescript-template.git
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up the `.env` file with necessary environment variables:
    - `PORT=4400` (server port)
    - `MONGODB_URI=mongodb://localhost:27017/yourdbname` (MongoDB connection string)

4. Start the development server:
    ```bash
    npm run dev
    ```

Now, your app should be running on `http://localhost:4400`! 🎉

---

## 📄 API Documentation

The project is designed to provide a simple RESTful API. Below are the available routes:

### **`GET /users/:id`** - Get user by ID
- Returns a user object based on the provided ID.

### **`POST /users`** - Create a new user
- Body:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com"
  }

### **`PUT /users/:id`** - Update user by ID
- Body:
  ```json
  {
    "name": "John Doe",
  }

### **`DELETE /users/:id`** - Delete user by ID
- Returns status 200.

## 🔧 Configuration
Make sure to configure the following environment variables in the .env file:
- `PORT`: The port on which the server will run (default: 4400).
- `MONGODB_URI`: MongoDB connection string.
**Example .env file:**
- `PORT=4400`
- `MONGODB_URI=mongodb://localhost:27017/mydatabase`

### ⚡ Features

- 🚀 Fast and Scalable: Built on Express.js and TypeScript for high performance and maintainability.
- 🔒 Secure: Built-in middleware for validation and authentication.
- 🛠️ Modular: Structured in a modular way with clear separation of concerns (routes, controllers, services, repositories, etc.).


### Summary of Key Directories:

- **index.ts:** Server initialization and routing setup.
- **utils/:** Helper functions like error handling, - - - config validation, etc.
-**routes/:** All routes for the API.
- **controllers/:** Handles HTTP requests and responses, interacting with services.
- **services/:** Business logic, implementing core application functionality.
- **repository/:** Database interaction, queries, and data access logic.
- **models/:** Defines MongoDB schemas and data structure.
- **middleware/:** Custom middleware for validation, authentication, etc.
- **config/:** Configuration files for environment variables, server settings, etc.
- **views/:** Optional directory for HTML templates (if applicable).
 