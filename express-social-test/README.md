# Express Social App API Server (`express-social-test`)

A lightweight RESTful backend API built with **Node.js**, **Express 5**, and **MongoDB (Mongoose)** for a social media web application. It provides user authentication, post feeds with likes and bookmarks, post image uploads via cloud storage, and commenting capabilities.

---

## Table of Contents

- [Overview & Key Features](#overview--key-features)
- [System Architecture](#system-architecture)
- [Prerequisites & Development Setup](#prerequisites--development-setup)
- [Environment Configuration](#environment-configuration)
- [Authentication & Authorization Flow](#authentication--authorization-flow)
- [Image Upload Architecture & Limits](#image-upload-architecture--limits)
- [Data Models & Schema](#data-models--schema)
- [API Endpoints Reference](#api-endpoints-reference)
  - [Authentication Routes](#1-authentication-routes)
  - [Post Routes](#2-post-routes)
  - [Comment Routes](#3-comment-routes)
  - [User Management Routes](#4-user-management-routes)
- [Production & Security Considerations](#production--security-considerations)

---

## Overview & Key Features

* **JWT-Based Authentication**: Secure registration, login with `bcryptjs` password hashing, and token-based session handling.
* **Dual Auth Context**:
  * Strict authentication (`authenticate`) for mutation operations (creating posts, liking, commenting).
  * Soft authentication (`identifyUser`) for public feed reading to personalize like and save flags dynamically (`isLiked`, `isSaved`).
* **Post Feed & Interactions**: Full CRUD on posts, author population, like toggling, and post saving/bookmarking.
* **Media Handling**: Multipart form handling via `multer` memory storage with automated deployment to **Vercel Blob Storage**.
* **Nested Comments**: Post-associated comment stream with populated user profile info.

---

## System Architecture

The application is structured as a streamlined RESTful service:

```
[ Frontend Client (React / Vite) ]
                |
                |  HTTP JSON / Multipart Form-Data
                v
       +------------------+
       |   CORS & Parser  |  (cors, express.json, express.urlencoded)
       +------------------+
                |
       +------------------+
       | Auth Middleware  |  (authenticate / identifyUser via jsonwebtoken)
       +------------------+
                |
       +------------------+
       | Route Handlers   |
       +--------+---------+
                |
       +--------+---------+
       |                  |
       v                  v
+--------------+   +---------------+
|   MongoDB    |   |  Vercel Blob  |
|  (Mongoose)  |   |  (CDN Store)  |
+--------------+   +---------------+
```

### Core Architecture Components:
1. **Entry Point (`main.js`)**: Contains configuration loading, Express application initialization, database connection, middleware pipelines, data schemas, and route controllers.
2. **Database Layer (MongoDB + Mongoose)**:
   - Three main relational collections: `User`, `Post`, and `Comment`.
   - References (`ObjectId`) are resolved via Mongoose `.populate()`.
3. **Storage Layer (Vercel Blob Storage)**:
   - Server acts as an authenticated pipeline: images are captured in memory (`multer.memoryStorage()`) and dispatched to Vercel's Edge storage using `@vercel/blob`.

---

## Prerequisites & Development Setup

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher
* **MongoDB**: A running local instance (`mongodb://localhost:27017/social`) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.
* **Vercel Account** *(Optional for image uploads)*: Access token for Vercel Blob store.

### Step-by-Step Installation

1. **Navigate to the server directory**:
   ```bash
   cd express-social-test
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(Update your database credentials and secret key in `.env`)*

4. **Run the server in development mode** (with auto-reload via `nodemon`):
   ```bash
   npm run dev
   ```

5. **Run in standard production mode**:
   ```bash
   npm start
   ```

The server will connect to MongoDB and start on `http://localhost:3000` (or the configured `PORT`).

---

## Environment Configuration

Create a `.env` file in the root of `express-social-test` with the following variables:

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | Port number the Express server listens on | `3000` | Optional |
| `MONGODB_URI` | Connection URI string for MongoDB database | `mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname` | **Yes** |
| `JWT_SECRET` | Secret key used for signing & verifying JWT tokens | `your_secret_key` | **Yes** |
| `CORS_ORIGIN` | Allowed client origin for Cross-Origin Resource Sharing | `http://localhost:5173` | Optional (`*`) |
| `BLOB_READ_WRITE_TOKEN` | Access token for `@vercel/blob` storage | `vercel_blob_rw_...` | For uploads |

---

## Authentication & Authorization Flow

The application implements a stateless **JSON Web Token (JWT)** mechanism:

```
[ Client ]                             [ Server ]
   |                                       |
   |--- 1. POST /auth/login -------------->|  Validates email + bcrypt.compare()
   |                                       |  Signs JWT with { userId: user._id }
   |<-- 2. Returns { token, user } --------|
   |                                       |
   |--- 3. GET /posts (Header: Bearer) --->|  authenticate / identifyUser checks token
   |                                       |  Attaches user document to req.user
   |<-- 4. Authorized JSON Response -------|
```

### Authorization Header
For all protected routes, include the JWT token in the `Authorization` request header:
```http
Authorization: Bearer <your_jwt_token_here>
```

### Middlewares
* **`authenticate`**: Strict middleware. Returns an error message if the token is missing, invalid, or the user does not exist in the database.
* **`identifyUser`**: Soft/optional auth middleware. Checks for a token; if present and valid, attaches `req.user`. If absent or invalid, sets `req.user = null` and proceeds without blocking the request.

---

## Image Upload Architecture & Limits

Post images are processed through an in-memory buffer pipeline without writing temporary files to the server's local disk.

```
[ Client Form ] --(multipart/form-data)--> [ Multer (Memory Buffer) ]
                                                     |
                                            Validate Mime & Size
                                                     |
                                            Upload to Vercel Blob
                                                     |
                                            Store URL in Post Document
```

### Upload Specifications & Limit Requirements
* **Enctype**: `multipart/form-data`
* **Form Field Name**: `photo` (e.g., `upload.single("photo")`)
* **Maximum File Size**: **5 MB** (`5 * 1024 * 1024` bytes). Requests exceeding this limit trigger a Multer `LIMIT_FILE_SIZE` error.
* **Permitted File Formats**: Any file with a MIME type starting with `image/` (e.g., `image/jpeg`, `image/png`, `image/webp`, `image/gif`). Non-image files are rejected with `Only image files are allowed`.
* **Storage Path**: Stored under the `posts/` bucket prefix with a unique timestamped hash (`posts/{timestamp}-{random}.ext`).

---

## Data Models & Schema

### 1. User (`userSchema`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required | Full display name |
| `username` | String | Required | User handle |
| `email` | String | Required, Unique | Unique email address |
| `password` | String | Required | Hashed password (bcrypt) |
| `bio` | String | Default: `""` | User biography description |
| `timestamps` | Date | Auto | `createdAt`, `updatedAt` |

### 2. Post (`postSchema`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Required | Post title |
| `body` | String | Required | Post text content |
| `author` | ObjectId | Ref: `User`, Required | Creator user ID |
| `likes` | [ObjectId] | Ref: `User` | Array of User IDs who liked the post |
| `savedBy` | [ObjectId] | Ref: `User` | Array of User IDs who saved/bookmarked |
| `imageUrl` | String | Default: `""` | Hosted CDN URL from Vercel Blob |
| `timestamps` | Date | Auto | `createdAt`, `updatedAt` |

### 3. Comment (`commentSchema`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `post` | ObjectId | Ref: `Post` | Target post ID |
| `user` | ObjectId | Ref: `User` | Comment author ID |
| `name` | String | Default: `""` | Cached author display name |
| `email` | String | Default: `""` | Cached author email |
| `body` | String | Required | Comment text |

---

## API Endpoints Reference

### 1. Authentication Routes

#### `POST /auth/register`
Register a new user account.
* **Public**
* **Request Body** (`application/json`):
  ```json
  {
    "name": "Jane Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "password": "securepassword123",
    "bio": "Fullstack web developer"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "670001...",
    "name": "Jane Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "bio": "Fullstack web developer",
    "createdAt": "2026-10-23T05:00:00.000Z"
  }
  ```
* **Error Response (`400 Bad Request`)**:
  ```json
  { "message": "Email already exists." }
  ```

---

#### `POST /auth/login`
Authenticate an existing user and receive a JWT.
* **Public**
* **Request Body** (`application/json`):
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "670001...",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```
* **Error Response (`400 Bad Request`)**:
  ```json
  { "message": "Invalid email" }
  ```
  or
  ```json
  { "message": "Invalid password" }
  ```

---

#### `GET /auth/me`
Retrieve the current authenticated user profile.
* **Protected** (`authenticate`)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "670001...",
    "name": "Jane Doe",
    "username": "janedoe",
    "email": "jane@example.com",
    "bio": "Fullstack web developer"
  }
  ```

---

#### `POST /auth/logout`
Acknowledge user logout on the server.
* **Public**
* **Success Response**:
  ```json
  { "message": "Loggged out successfully" }
  ```

---

### 2. Post Routes

#### `GET /posts`
Fetch all posts with populated author details and computed user interaction states.
* **Public** (Optional Token via `identifyUser`)
* **Headers**: Optional `Authorization: Bearer <token>`
* **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "670002...",
      "title": "My First Post",
      "body": "Hello world from Express!",
      "imageUrl": "https://...public.blob.vercel-storage.com/posts/xyz.jpg",
      "author": {
        "_id": "670001...",
        "name": "Jane Doe",
        "username": "janedoe",
        "email": "jane@example.com"
      },
      "likes": ["670001..."],
      "savedBy": [],
      "likesCount": 1,
      "isLiked": true,
      "isSaved": false,
      "createdAt": "2026-10-23T05:10:00.000Z"
    }
  ]
  ```

---

#### `GET /posts/:id`
Fetch a single post by ID with interaction states.
* **Public** (Optional Token via `identifyUser`)
* **URL Params**: `id` = Target Post ID
* **Success Response (`200 OK`)**: Post object matching the format above.

---

#### `POST /posts`
Create a new post.
* **Protected** (`authenticate`)
* **Headers**: `Authorization: Bearer <token>`
* **Request Body** (`application/json`):
  ```json
  {
    "title": "Getting started with Node.js",
    "body": "Here is an introductory guide to Express."
  }
  ```
* **Success Response (`200 OK`)**: Created post document.

---

#### `PUT /posts/:id`
Update an existing post's title and body.
* **Protected** (`authenticate`)
* **Headers**: `Authorization: Bearer <token>`
* **URL Params**: `id` = Target Post ID
* **Request Body** (`application/json`):
  ```json
  {
    "title": "Updated Title",
    "body": "Updated content..."
  }
  ```
* **Success Response (`200 OK`)**: Updated post document.

---

#### `DELETE /posts/:id`
Delete a post by ID.
* **Protected** (`authenticate`)
* **Headers**: `Authorization: Bearer <token>`
* **URL Params**: `id` = Target Post ID
* **Success Response (`200 OK`)**: The deleted post object.

---

#### `POST /posts/:id/like`
Toggle the like status on a post for the logged-in user.
* **Protected** (`authenticate`)
* **Headers**: `Authorization: Bearer <token>`
* **URL Params**: `id` = Target Post ID
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "670002...",
    "title": "My First Post",
    "likes": ["670001..."],
    "isLiked": true,
    "likesCount": 1
  }
  ```

---

#### `POST /posts/:id/save`
Toggle save/bookmark status on a post for the logged-in user.
* **Protected** (`authenticate`)
* **Headers**: `Authorization: Bearer <token>`
* **URL Params**: `id` = Target Post ID
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "670002...",
    "title": "My First Post",
    "savedBy": ["670001..."],
    "isSaved": true,
    "likesCount": 1
  }
  ```

---

#### `POST /posts/:id/photo`
Upload or update a post's featured banner image.
* **Protected** (`authenticate`)
* **Headers**: 
  * `Authorization: Bearer <token>`
  * `Content-Type: multipart/form-data`
* **URL Params**: `id` = Target Post ID
* **Form-Data**:
  * Key: `photo` (File: `.jpg`, `.png`, `.webp`, Max 5 MB)
* **Success Response (`200 OK`)**:
  ```json
  { "message": "Post uploaded successfully" }
  ```
* **Error Response (`400 Bad Request`)**:
  ```json
  { "message": "No image provided" }
  ```

---

### 3. Comment Routes

#### `GET /posts/:postId/comments`
Get all comments associated with a specific post.
* **Public**
* **URL Params**: `postId` = Target Post ID
* **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "670003...",
      "post": "670002...",
      "body": "Great article! Thanks for sharing.",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "user": {
        "_id": "670001...",
        "name": "Jane Doe",
        "username": "janedoe",
        "email": "jane@example.com"
      }
    }
  ]
  ```

---

#### `POST /posts/:postId/comments`
Add a comment to a specific post.
* **Protected** (`authenticate`)
* **Headers**: `Authorization: Bearer <token>`
* **URL Params**: `postId` = Target Post ID
* **Request Body** (`application/json`):
  ```json
  {
    "body": "This is very helpful."
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "670003...",
    "post": "670002...",
    "user": "670001...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "body": "This is very helpful."
  }
  ```

---

### 4. User Management Routes

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/users` | Create user record | `{ name, email }` |
| `GET` | `/users` | List all users (Optional query `?name=...`) | None |
| `GET` | `/users/:id` | Fetch user by ID | Param `id` |
| `PUT` | `/users/:id` | Update user by ID | `{ name, email }` |
| `DELETE` | `/users/:id` | Delete user by ID | Param `id` |

---

