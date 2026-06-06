import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: '*', // In production, replace with actual frontend client domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Express Middlewares
app.use(express.json({ limit: '50mb' })); // Support base64 image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Test Route
app.get('/', (req, res) => {
  res.send('ConnectSphere API is running...');
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Expose io globally so controllers can trigger real-time events
global.io = io;

// Track online users
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins their room and signals they are online
  socket.on('setup', (userId) => {
    if (userId) {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log(`User registered: ${userId}`);
      // Broadcast online status to all users
      io.emit('online_users', Array.from(onlineUsers.keys()));
    }
  });

  // Handle typing status
  socket.on('typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('typing', senderId);
  });

  socket.on('stop_typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('stop_typing', senderId);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      console.log(`User disconnected: ${disconnectedUserId}`);
      // Broadcast updated online list
      io.emit('online_users', Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
