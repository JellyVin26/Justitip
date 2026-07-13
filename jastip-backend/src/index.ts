import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import prisma from './prisma';
import multer from 'multer';
import path from 'path';

import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import userRoutes from './routes/user.routes';
import listingRoutes from './routes/listing.routes';

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
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// File upload endpoint
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Socket.io for Real-Time Chat
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_order_room', (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined room ${orderId}`);
  });

  socket.on('send_message', async (data) => {
    // data should contain { orderId, senderId, content }
    io.to(data.orderId).emit('receive_message', data);
    
    try {
      await prisma.message.create({
        data: {
          orderId: data.orderId,
          senderId: data.senderId,
          content: data.content
        }
      });
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
