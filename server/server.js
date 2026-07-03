import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import rfqRoutes from './routes/rfqRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://modit-nu.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') ||
                      /^http:\/\/localhost:\d+$/.test(origin) ||
                      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// ── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    ...corsOptions,
    methods: ['GET', 'POST']
  }
});

// Make io accessible in route handlers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // Join user-specific room for targeted notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Join supplier-specific room
  socket.on('join_supplier_room', (supplierId) => {
    socket.join(`supplier_${supplierId}`);
    console.log(`🏭 Supplier ${supplierId} joined their room`);
  });

  // Join order tracking room
  socket.on('track_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`📦 Client tracking order ${orderId}`);
  });

  // Simulated delivery movement (for demo purposes)
  socket.on('simulate_delivery', (data) => {
    const { orderId, waypoints } = data;
    if (!waypoints || waypoints.length === 0) return;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= waypoints.length) {
        clearInterval(interval);
        io.to(`order_${orderId}`).emit('order_status_update', {
          orderId,
          status: 'delivered',
          deliveryTracking: waypoints[waypoints.length - 1],
          message: 'Order delivered!'
        });
        return;
      }
      io.to(`order_${orderId}`).emit('delivery_location_update', {
        orderId,
        ...waypoints[idx]
      });
      idx++;
    }, 2000); // Update every 2 seconds

    socket.on('disconnect', () => clearInterval(interval));
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple custom cookie parser for HttpOnly refresh tokens
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [key, ...valueParts] = cookie.split('=');
      const val = valueParts.join('=');
      if (key && val) {
        req.cookies[key.trim()] = decodeURIComponent(val.trim());
      }
    });
  }
  next();
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MODIT API Server is running.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── Route Mappings ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api/orders', orderRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// ── Centralized Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error] ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`⚡ Socket.io ready`);
});
