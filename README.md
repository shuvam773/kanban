# Kanban Board

A full-stack Kanban board application that allows users to manage their tasks in a collaborative, real-time environment.

## Tech Stack

**Frontend:**
- React
- Redux Toolkit for state management
- Material-UI and Tailwind CSS for styling
- Vite for the build tool
- Socket.io-client for real-time communication
- React DND for drag-and-drop functionality

**Backend:**
- Node.js and Express
- MongoDB with Mongoose for the database
- Socket.io for real-time updates
- JSON Web Tokens (JWT) for authentication

## Features

- User registration and login
- Create, update, and delete tasks
- Organize tasks into customizable sections
- Drag and drop tasks between sections
- Real-time updates across all connected clients

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm
- MongoDB

### Installation

1.  **Install frontend dependencies from the root directory:**
    ```bash
    npm install
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    cd ..
    ```

### Environment Variables

The backend requires the following environment variables. Create a `.env` file in the `backend` directory and add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Available Scripts

### Frontend

-   `npm run dev`: Starts the frontend development server.
-   `npm run build`: Builds the frontend for production.
-   `npm run preview`: Previews the production build.

### Backend

-   `npm run start`: Starts the backend server.
-   `npm run dev`: Starts the backend server with nodemon for development.

## Project Structure

```
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── features
│   │   └── middlewares
│   ├── package.json
│   └── server.js
├── public
├── src
│   ├── assets
│   ├── components
│   ├── context
│   ├── hooks
│   ├── store
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

## Publishing to GitHub

Once you've set up the project, you can publish it to your GitHub repository.

1.  **Commit the changes:**
    ```bash
    git add .
    git commit -m "feat: Add detailed README.md"
    ```

2.  **Push the changes to your repository:**
    ```bash
    git push origin main
    ```
