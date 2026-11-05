# Fullstack Social Media Application Demo

A production-ready fullstack social media web application developed for the **Fullstack Live Class**. This repository contains both the decoupled backend REST API service and the modern Single Page Application (SPA) frontend.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Tech Stack Overview](#tech-stack-overview)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
  - [1. Backend Setup (`express-social-test`)](#1-backend-setup-express-social-test)
  - [2. Frontend Setup (`social-app-az-class-project`)](#2-frontend-setup-social-app-az-class-project)
- [Environment Configurations](#environment-configurations)
- [Key Features & Capabilities](#key-features--capabilities)
- [API Integration Overview](#api-integration-overview)
- [Production Deployment Guide](#production-deployment-guide)
- [Security Best Practices](#security-best-practices)

---

## System Architecture

The application adopts a decoupled client-server architecture:

```
┌─────────────────────────────────┐           HTTP (JSON / Form-Data)          ┌──────────────────────────────────┐
│         Frontend Client         │ ─────────────────────────────────────────> │        Backend API Server        │
│   (React 19 + Vite + Tailwind)  │ <───────────────────────────────────────── │    (Express 5 + Node.js + JWT)   │
│       Port: 5173 (Dev)          │           CORS & Bearer Auth               │         Port: 3000 (Dev)         │
└─────────────────────────────────┘                                            └──────────────────────────────────┘
                                                                                                 │
                                                                       ┌─────────────────────────┴─────────────────────────┐
                                                                       ▼                                                   ▼
                                                            ┌──────────────────────┐                            ┌──────────────────────┐
                                                            │   MongoDB Database   │                            │  Vercel Blob Storage │
                                                            │  (Users, Posts,      │                            │  (Post Image Cloud   │
                                                            │   Comments)          │                            │   CDN Storage)       │
                                                            └──────────────────────┘                            └──────────────────────┘
```

---

## Repository Structure

```text
Social App Demo/
├── .gitignore                      # Monorepo-level git ignore rules
├── README.md                       # Fullstack project overview and setup guide
├── express-social-test/            # Backend REST API Server
│   ├── .env.example                # Backend environment configuration template
│   ├── main.js                     # Express entry point, schema models & route handlers
│   ├── package.json                # Backend dependencies & npm scripts
│   └── README.md                   # Comprehensive backend documentation & API reference
└── social-app-az-class-project/    # Frontend React SPA Client
    ├── .env.example                # Frontend environment configuration template
    ├── index.html                  # Client HTML mount document
    ├── vite.config.js              # Vite & Tailwind CSS v4 configuration
    ├── package.json                # Frontend dependencies & npm scripts
    ├── README.md                   # Comprehensive frontend documentation & UI guide
    └── src/
        ├── App.jsx                 # Route configurations and context providers
        ├── components/             # Reusable UI components (Navbar, PostCard, Comments)
        ├── context/                # React contexts (AuthContext, PostContext)
        ├── pages/                  # Route views (Home, Login, CreatePost, Detail, Saved)
        └── services/               # HTTP client wrapper (authFetch)
```

---

## Tech Stack Overview

### Backend (`express-social-test`)
- **Runtime**: Node.js (v18+)
- **Framework**: Express 5
- **Database / ODM**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & password hashing with `bcryptjs`
- **File & Media Handling**: `multer` memory storage piped to `@vercel/blob`
- **CORS Handling**: `cors` middleware

### Frontend (`social-app-az-class-project`)
- **Library**: React 19
- **Build Tool**: Vite 8 (Hot Module Replacement)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing**: React Router v8
- **State Management**: React Context API (`AuthContext`, `PostContext`) with optimistic UI patterns

---

## Prerequisites

Before starting the application, ensure the following are installed on your machine:
* **Node.js**: `v18.x` or higher (Node.js 20+ LTS recommended)
* **npm**: `v9.x` or higher
* **MongoDB**: A running local instance (`mongodb://localhost:27017/social`) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

---

## Quick Start Guide

To run the complete fullstack application locally, run the backend and frontend in separate terminal windows:

### 1. Backend Setup (`express-social-test`)

```bash
# Navigate to backend directory
cd express-social-test

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env

# Start backend server in development mode (with hot-reloading)
npm run dev
```
The API server will listen at `http://localhost:3000`.

### 2. Frontend Setup (`social-app-az-class-project`)

```bash
# Open a new terminal and navigate to frontend directory
cd social-app-az-class-project

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env

# Start frontend development server
npm run dev
```
The client application will be accessible at `http://localhost:5173`.

---

## Environment Configurations

### Backend (`express-social-test/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number for Express server | `3000` |
| `MONGODB_URI` | MongoDB connection connection string | `mongodb://localhost:27017/social` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | `your_secure_jwt_secret` |
| `CORS_ORIGIN` | Allowed origin for frontend requests | `http://localhost:5173` |
| `BLOB_READ_WRITE_TOKEN` | *(Optional)* Vercel Blob access token for uploads | `vercel_blob_rw_...` |

### Frontend (`social-app-az-class-project/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint pointing to the backend API | `http://localhost:3000` |

---

## Key Features & Capabilities

1. **User Authentication & Authorization**:
   - Secure registration and login with bcrypt-hashed credentials.
   - Dual-mode JWT verification: strict authentication for mutations, soft user identification for feed enrichment.
   - Automatic session retention via browser `localStorage`.
2. **Interactive Feed**:
   - Responsive feed layout with live client-side search filtering by title and content.
   - Post likes with instantaneous optimistic counts and state synchronization.
   - Bookmark/Saved posts functionality with dedicated views.
3. **Media Publishing**:
   - Two-phase post creation: metadata JSON persistence followed by `multipart/form-data` image upload.
   - Live client-side preview thumbnails prior to publishing.
4. **Threaded Discussion**:
   - Contextual comments for each post with user attribution.
   - Real-time comment submission without page refresh.

---

## Production Deployment Guide

### Backend (`express-social-test`)
1. Set `NODE_ENV=production`.
2. Configure production MongoDB connection URI and strong `JWT_SECRET`.
3. Set `CORS_ORIGIN` to your deployed frontend domain.
4. Run `npm start` (executed via process managers like PM2, Docker, or platforms such as Render, Railway, or AWS).

### Frontend (`social-app-az-class-project`)
1. Set `VITE_API_URL` in `.env.production` to your deployed backend URL.
2. Build optimized static assets:
   ```bash
   npm run build
   ```
3. Deploy the resulting `dist/` directory to static hosting services (Vercel, Netlify, Cloudflare Pages, S3). Ensure Single Page App URL rewrite rules redirect all requests to `index.html`.

---

## Security Best Practices

* **No Hardcoded Secrets**: Secrets and tokens (`MONGODB_URI`, `BLOB_READ_WRITE_TOKEN`, `JWT_SECRET`) are kept strictly inside `.env` files and excluded by `.gitignore`.
* **CORS Validation**: Cross-Origin Resource Sharing is locked down to designated client origins.
* **Safe Authentication Transmission**: Bearer tokens are exchanged through standard HTTP `Authorization` headers.
* **Client-side Route Protection**: `<ProtectedRoute>` component prevents unauthorized access to protected paths.

