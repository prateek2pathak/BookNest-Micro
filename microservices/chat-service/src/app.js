import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

connectDB();

// Use CLIENT_URL for CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true 
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Chat Service is running!');
});

app.use('/api/messages', messageRoutes);

// Socket.IO setup with CLIENT_URL
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log("Chat Service - Socket connected:", socket.id);
  
  // Join a genre room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Leave a genre room
  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  // Send message to genre room
  socket.on('send_message', async (msgData) => {
    try {
      // Save message to database
      const msg = await Message.create(msgData);
      
      // Broadcast to all users in the room
      io.to(msgData.room).emit('receive_message', msg);
      
      console.log(`Message sent to room ${msgData.room}:`, msg);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.room).emit('user_typing', {
      username: data.username,
      room: data.room
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.room).emit('user_stop_typing', {
      username: data.username,
      room: data.room
    });
  });

  socket.on('disconnect', () => {
    console.log('Chat Service - User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'chat-service',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5004;
server.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});

export default app;
