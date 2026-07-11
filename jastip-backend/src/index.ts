import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Socket.io for Real-Time Chat
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_order_room', (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined room ${orderId}`);
  });

  socket.on('send_message', (data) => {
    // data should contain { orderId, senderId, content }
    io.to(data.orderId).emit('receive_message', data);
    // In a real app, you would also save the message to the database here
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
