import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import bookRoutes from './routes/bookRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import connectDB from './config/db.js';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/message.js';

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

app.get('/',(req,res)=>{
  res.send("hello from server");
})
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/messages', messageRoutes);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log("Socket id ",socket.id);
  
  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
  });

  socket.on('send_message', async (msgData) => {
    const msg = await Message.create(msgData);
    io.to(msgData.room).emit('receive_message', msg);
  });
});

// start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});