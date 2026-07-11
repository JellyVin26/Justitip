import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const initiateSocketConnection = (orderId: string) => {
  if (socket) return socket;
  
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
  socket = io(SOCKET_URL);
  
  socket.on('connect', () => {
    console.log('Connected to socket', socket.id);
    socket.emit('join_order_room', orderId);
  });
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const getSocket = () => socket;
