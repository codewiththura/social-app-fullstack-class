# Social App Client (`social-app-az-class-project`)

A modern, responsive, component-driven Single Page Application (SPA) built with **React 19**, **Vite**, **Tailwind CSS v4**, and **React Router**. This frontend interfaces seamlessly with the `express-social-test` RESTful backend API to deliver a complete social networking experience featuring JWT authentication, real-time post creation with image uploads, interactive likes, bookmarks, and nested commenting.

---

## Table of Contents

- [Overview & Key Features](#overview--key-features)
- [Architecture & Design Principles](#architecture--design-principles)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites & Development Setup](#prerequisites--development-setup)
- [Environment Configuration](#environment-configuration)
- [Routing & Navigation Model](#routing--navigation-model)
- [State Management Architecture](#state-management-architecture)
  - [Authentication Context (`AuthContext`)](#authentication-context-authcontext)
  - [Post Context (`PostContext`)](#post-context-postcontext)
- [API Communication Layer (`authFetch`)](#api-communication-layer-authfetch)
- [Component Breakdown](#component-breakdown)
- [Production Build & Deployment](#production-build--deployment)
- [Security Best Practices](#security-best-practices)
- [Coding Standards & Maintenance Guidelines](#coding-standards--maintenance-guidelines)

---

## Overview & Key Features

- **Authentication & Session Persistence**:
  - User registration (`/register`) with client-side validation and automatic login upon creation.
  - Seamless user login with JWT verification.
  - Automatic local session persistence (`localStorage`) across page refreshes.
  - Centralized logout clearing authentication tokens and user state.
- **Dynamic Feed & Instant Search**:
  - Real-time client-side search filtering posts by both title and content.
  - Responsive post grid with author profile attribution.
- **Interactive Post Actions**:
  - **Optimistic Like/Unlike**: Instant UI count updates with server synchronization.
  - **Bookmark/Save System**: Add posts to a dedicated "Saved Posts" collection.
  - **Ownership Controls**: Dedicated Edit and Delete actions for authenticated users.
- **Media Handling & Image Uploads**:
  - Client-side preview of selected image files using `URL.createObjectURL`.
  - Two-stage post creation: metadata JSON submission followed by `multipart/form-data` image upload.
- **Threaded Commenting**:
  - Publicly viewable comments on post details.
  - Real-time comment submission for logged-in users.
- **Route Protection**:
  - Higher-Order Component / Wrapper pattern (`<ProtectedRoute>`) ensuring unauthorized users are redirected to `/login`.

---

## Architecture & Design Principles

The application is structured following modern frontend software engineering principles:

```
+-------------------------------------------------------------+
|                      React App Root                         |
|  [AuthProvider] -> [PostProvider] -> [BrowserRouter]       |
+-------------------------------------------------------------+
                               |
               +---------------+---------------+
               |                               |
       [Global Navbar]                 [Route Switcher]
                                               |
                     +-------------------------+-------------------------+
                     |                         |                         |
               Public Routes            Protected Routes             Fallback
              - / (Home)               - /create-post               - * (NotFound)
              - /post/:id              - /saved
              - /login                 - /edit-post/:id
              - /register
```

### Core Architectural Patterns:

1. **Separation of Concerns (SoC)**:
   - **Services Layer (`src/services/`)**: Isolated HTTP requests, authorization headers, and environment-based base URLs.
   - **State Layer (`src/context/`)**: Encapsulated state management separated from visual presentation.
   - **Presentational Components (`src/components/`)**: Modular, reusable UI widgets (cards, forms, navigation).
   - **Pages / Views (`src/pages/`)**: Composition layer orchestrating components for specific routes.
2. **Single Responsibility Principle (SRP)**:
   - `PostCard` handles individual post visualization and interaction triggers.
   - `CommentSession` independently manages comment retrieval and submission for a given post.
   - `ProtectedRoute` solely enforces authentication access boundaries.
3. **Optimistic UI Updates**:
   - Like toggles and save actions update component state immediately for responsive feedback, falling back to server state on error.

---

## Project Directory Structure

```text
social-app-az-class-project/
├── .env                       # Local environment variables (git-ignored)
├── .env.example               # Template for environment configuration
├── .gitignore                 # Files excluded from version control
├── eslint.config.js           # ESLint 9+ flat configuration rules
├── index.html                 # HTML shell and root mounting point
├── package.json               # Project manifest, scripts, and dependencies
├── package-lock.json          # Deterministic dependency tree
├── vite.config.js             # Vite build configuration (React & Tailwind plugins)
├── public/                    # Static assets served as-is
└── src/
    ├── App.jsx                # Application root, provider composition, routes
    ├── index.css              # Global styles and Tailwind CSS import
    ├── main.jsx               # React 19 DOM bootstrap (`createRoot`)
    ├── assets/                # Local images and SVG graphics
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    ├── components/            # Reusable presentational components
    │   ├── CommentSession.jsx # Comment list and submission form
    │   ├── Navbar.jsx         # Global top navigation bar with user indicator
    │   ├── PostCard.jsx       # Card displaying post details, likes, saves
    │   └── ProtectedRoute.jsx # Route barrier redirecting unauthenticated users
    ├── context/               # React Context Providers for global state
    │   ├── AuthContext.jsx    # User registration, login, logout, and token management
    │   └── PostContext.jsx    # Post collections, liking, saving, deleting
    ├── pages/                 # Full-page route views
    │   ├── CreatePost.jsx     # Form to publish new post with image upload
    │   ├── DetailPost.jsx     # Single post view with attached comments
    │   ├── EditPost.jsx       # Form to update existing post and replace image
    │   ├── Home.jsx           # Public feed with live search bar
    │   ├── Login.jsx          # User login page with demo credentials
    │   ├── Register.jsx       # Beginner-friendly user registration form
    │   ├── NotFound.jsx       # 404 fallback page
    │   └── SavedPost.jsx      # Filtered collection of user-bookmarked posts
    └── services/              # External service integrations
        └── api.js             # Base URL definition and authenticated fetch wrapper
```

---

## Prerequisites & Development Setup

### System Prerequisites

- **Node.js**: `v18.x` or higher (Node.js 20+ LTS recommended)
- **npm**: `v9.x` or higher
- **Running Backend**: The `express-social-test` server running locally (typically at `http://localhost:3000`).

### Installation Steps

1. **Navigate to the frontend folder**:

   ```bash
   cd social-app-az-class-project
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure the environment**:
   Copy the example environment file to `.env`:

   ```bash
   cp .env.example .env
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will start with Hot Module Replacement (HMR) at `http://localhost:5173`.

---

## Environment Configuration

The frontend uses Vite's environment variable system. Only variables prefixed with `VITE_` are exposed to client-side code.

| Variable Name  | Required | Default Value           | Description                                |
| :------------- | :------: | :---------------------- | :----------------------------------------- |
| `VITE_API_URL` | **Yes**  | `http://localhost:3000` | Base URL of the backend Express API server |

### Sample `.env`:

```env
VITE_API_URL=http://localhost:3000
```

> [!IMPORTANT]
> If your backend runs on a different port or a deployed domain (e.g., `https://api.yourdomain.com`), update `VITE_API_URL` in your `.env` file accordingly and restart Vite.

---

## Routing & Navigation Model

Routing is implemented using **React Router**. Route access is divided into Public and Protected routes:

| Route Path       | View Component | Guarded? | Purpose                                               |
| :--------------- | :------------- | :------: | :---------------------------------------------------- |
| `/`              | `Home`         |    No    | Public feed of recent posts with search functionality |
| `/post/:id`      | `DetailPost`   |    No    | Detailed view of a post and its associated comments   |
| `/login`         | `Login`        |    No    | Authentication form with quick-fill demo credentials  |
| `/register`      | `Register`     |    No    | New user registration form with auto-login flow       |
| `/create-post`   | `CreatePost`   | **Yes**  | Form to create a new post with image upload           |
| `/edit-post/:id` | `EditPost`     | **Yes**  | Form to edit post content and replace attached photo  |
| `/saved`         | `SavedPosts`   | **Yes**  | Displays bookmarked posts marked by the user          |
| `*`              | `NotFound`     |    No    | Fallback screen for undefined URLs                    |

### Protected Route Implementation

The `<ProtectedRoute>` component evaluates `isAuthenticated` from `useAuth()`. If false, it immediately halts rendering and executes a client-side redirection:

```jsx
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
```

---

## State Management Architecture

Global state is divided into two primary React Context domains:

### Authentication Context (`AuthContext`)

Located in [src/context/AuthContext.jsx](file:///src/context/AuthContext.jsx), this context provides user authentication state and controls:

- **State Properties**:
  - `user`: Current logged-in user profile object (`_id`, `name`, `username`, `email`, `bio`) or `null`.
  - `isAuthenticated`: Derived boolean flag (`Boolean(user)`).
- **Methods**:
  - `register(userData)`: Sends `{ name, username, email, password, bio }` to `${API_URL}/auth/register` to create a new user account.
  - `login(email, password)`: Sends credentials to `${API_URL}/auth/login`, stores token and user in `localStorage`, and updates React state.
  - `logout()`: Posts to `${API_URL}/auth/logout`, purges `localStorage`, and clears context state.
- **Custom Hook**:
  - `useAuth()`: Hook to access auth states and actions anywhere in the tree.

### Post Context (`PostContext`)

Located in [src/context/PostContext.jsx](file:///src/context/PostContext.jsx), this context manages feed state across pages:

- **State Properties**:
  - `posts`: Array of post objects currently loaded in the client.
  - `loading`: Boolean indicating whether posts are actively fetching.
- **Methods**:
  - `loadPosts()`: Fetches the latest posts from `${API_URL}/posts`.
  - `toggleLike(id)`: Requests `${API_URL}/posts/${id}/like` and synchronizes the updated post in `posts`.
  - `toggleSave(id)`: Requests `${API_URL}/posts/${id}/save` and synchronizes bookmark status.
  - `deletePost(id)`: Calls `DELETE ${API_URL}/posts/${id}` and filters out the removed post locally.
- **Custom Hook**:
  - `usePosts()`: Hook providing direct access to post collections and actions.

---

## API Communication Layer (`authFetch`)

To maintain the **DRY (Don't Repeat Yourself)** principle and centralize request security, all authenticated calls flow through `authFetch` in [src/services/api.js](file:///src/services/api.js).

### Features of `authFetch`:

1. **Automatic Bearer Token Injection**: Retrieves the token from `localStorage` and attaches the `Authorization: Bearer <token>` header if present.
2. **Smart Content-Type Detection**:
   - Automatically sets `Content-Type: application/json` for standard requests.
   - Deliberately omits `Content-Type` when sending `FormData` so the browser can calculate the correct `multipart/form-data; boundary=...` header.
3. **Token Sanitization**: Trims any extraneous quotes if the token was stored with formatting artifacts.

```javascript
// Example Usage in Components:
import { API_URL, authFetch } from "../services/api";

const response = await authFetch(`${API_URL}/posts/${id}`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
```

---

## Component Breakdown

### 1. `Navbar.jsx`

- Displays site branding and navigation links.
- Conditionally renders links:
  - Guest: Shows "Home" and "Login".
  - Authenticated: Shows "Home", "Saved", "Create Post", user profile avatar with name, and a "Logout" action.

### 2. `PostCard.jsx`

- Reusable post presentation card used on `Home`, `DetailPost`, and `SavedPosts`.
- Supports optimistic state handling for instant response when clicking like/save.
- Renders Edit/Delete buttons exclusively for authenticated users.

### 3. `CommentSession.jsx`

- Embedded within `DetailPost`.
- Fetches and maps existing comments.
- Conditionally displays comment input box for authenticated users.
- Submits new comments and appends them immediately to the local list without full page refresh.

### 4. `CreatePost.jsx` & `EditPost.jsx`

- Multi-part forms supporting text and image selection.
- Immediate visual preview using `URL.createObjectURL(file)`.
- Employs standard submission workflow: saves/updates post data then uploads media binary to backend storage.

---

## Production Build & Deployment

### Build Command

Compile and bundle the production assets:

```bash
npm run build
```

The output files will be created in the `dist/` directory, optimized and minified.

### Test Production Build Locally

Preview the production build locally before deploying:

```bash
npm run preview
```

### Static Host Deployment (Vercel, Netlify, Cloudflare Pages)

When deploying a Single Page Application (SPA) using React Router, ensure all routes fallback to `index.html`.

#### For Vercel (`vercel.json`):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### For Netlify (`public/_redirects`):

```text
/*    /index.html   200
```

---
