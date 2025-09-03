import express from 'express';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.config.js';
import bodyParser from 'body-parser';
import sectionRouter from './src/features/sections/section.routes.js';
import taskRouter from './src/features/tasks/task.routes.js';
import userRouter from './src/features/user/user.routes.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(bodyParser.json());

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/section', sectionRouter);
app.use('/api/task', taskRouter);
app.use('/api/auth', userRouter);

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userEmail = decoded.email;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.userId);

  // Join user to their personal room for private messages
  socket.join(`user_${socket.userId}`);

  socket.on('join-board', (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.userId} joined board ${boardId}`);
  });

  socket.on('leave-board', (boardId) => {
    socket.leave(boardId);
    console.log(`User ${socket.userId} left board ${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id, 'User ID:', socket.userId);
  });
});

// Connect to database
connectDB();

// Start server
const port = process.env.PORT || 5000;
app.get("/", (req, res) => res.send("Express on Vercel"));

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { io };