# Blog Application Backend API

This repository houses the backend REST API engine for the full-stack MERN Blog Application. The system features multi-role permissions (User, Author, Admin), secure password storage, token validation, image uploads via Cloudinary, and relational article-comment management using MongoDB and Mongoose.

---

## Core System Features

* Role-Based Access Control: Specialized endpoints and middleware constraints for general Readers (Users), Content Creators (Authors), and Moderators (Admins).
* Image Upload Pipeline: Integrated Multer and Cloudinary configurations to handle avatar and article illustration uploads.
* Cookie-Based Session Security: Secure login endpoints issuing JSON Web Tokens (JWT) inside HTTP-only cookies.
* Comprehensive Validation & Error Filtering: Global Express error-catching middleware specialized in processing Mongoose casting errors, validation failures, and duplicate database keys.

---

## Folder Structure

```
Blog-App-Backend/
├── config/             # Multer and Cloudinary system configurations
├── APIs/               # Specialized Express routers (User, Author, Admin, Common)
├── middlewares/        # Custom token validation and route permissions
├── models/             # Mongoose schemas (UserModel, ArticleModel)
├── Services/           # Shared database operational routines (authService)
├── server.js           # Server initializer, DB connection, and error middleware
├── user.http           # Client HTTP test requests (User and Common APIs)
└── req.http            # Client HTTP test requests (Author and Admin APIs)
```

---

## Environment Configuration

To run this application locally, you must create a `.env` file in the root directory and configure the following variables:

```properties
PORT=4000
DB_URL=mongodb://localhost:27017/blogapp
JWT_SECRET=your_jwt_private_key
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## Installation & Running Locally

### 1. Install Dependencies
Ensure you have Node.js and MongoDB installed and running on your system.
```bash
npm install
```

### 2. Start the Server
Run the local HTTP listener:
```bash
npm start
```
By default, the server runs on port 4000 (or the value set in your environment file).

---

## API Endpoints List

### 1. Common Endpoints (`/common-api`)
Shared services accessible by all registered user types:
* POST `/login`: Authenticates credentials, generates JWT, and sets it in the client cookie.
* PUT `/change-password`: Safe credential renewal verification.
* GET `/logout`: Clears the HTTP-only authentication cookie from the client.

### 2. General Reader Endpoints (`/user-api`)
Accessible to registered regular readers:
* POST `/users`: Creates a new general user account with hashed credentials.
* GET `/articles`: Retrieves the entire blog feed.
* PUT `/articles`: Updates articles by adding dynamic comments to the database.

### 3. Author Endpoints (`/author-api`)
Restricted to content creators (protected by verification middleware):
* POST `/article`: Saves a new blog post to the database (supports image uploads).
* GET `/articles/:username`: Retrieves all articles authored by a specific user.
* PUT `/article`: Modifies existing blog post contents.
* DELETE `/article/:id`: Removes a specific article from the system.

### 4. Admin Endpoints (`/admin-api`)
Moderator administrative panel options:
* GET `/users`: Lists accounts and status logs.
* DELETE `/articles/:id`: Deletes flags or moderation violations.

---

## Error Response Schemas

All failures are processed by a centralized error-handling middleware:

### Schema Validation Failures (400 Bad Request)
```json
{
  "message": "error occurred",
  "error": "User validation failed: email: Path `email` is required."
}
```

### Duplicate Key Failures (409 Conflict)
```json
{
  "message": "error occurred",
  "error": "email \"john.doe@example.com\" already exists"
}
```
