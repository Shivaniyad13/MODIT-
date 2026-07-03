import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });
  }
  return socket;
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  s.emit('join_user_room', userId);
};

export const joinSupplierRoom = (supplierId) => {
  const s = getSocket();
  s.emit('join_supplier_room', supplierId);
};

export const trackOrder = (orderId) => {
  const s = getSocket();
  s.emit('track_order', orderId);
};

export const simulateDelivery = (orderId, waypoints) => {
  const s = getSocket();
  s.emit('simulate_delivery', { orderId, waypoints });
};

export default getSocket;
