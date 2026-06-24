const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const setupSocket = require('./socket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { startCronJobs } = require('./utils/cronScheduler');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// --------------- Security Middleware ---------------

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting — general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', generalLimiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
});
app.use('/api/v1/auth', authLimiter);

// --------------- Body Parsers ---------------

// Stripe webhook needs raw body parser for signature verification
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --------------- Routes ---------------

// Health Check
app.get('/api/v1/health', (req, res) => {
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[mongoose.connection.readyState] || 'unknown';

  res.status(dbStatus === 'connected' ? 200 : 503).json({
    status: dbStatus === 'connected' ? 'success' : 'error',
    message: `ShopSphere API is running. Database is ${dbStatus}.`,
    database: dbStatus,
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Client logger route
app.post('/api/v1/log', (req, res) => {
  console.log('📡 [CLIENT LOG]:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Database connection check middleware for API endpoints
const dbCheckMiddleware = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503);
    return next(
      new Error(
        'Database connection is not established. Please configure a valid MONGO_URI in server/.env and ensure your MongoDB instance is running.'
      )
    );
  }
  next();
};

app.use('/api/v1', dbCheckMiddleware);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/chats', chatRoutes);

// --------------- Error Handling ---------------

app.use(notFound);
app.use(errorHandler);

// --------------- Start Server ---------------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn(
      '⚠️  MONGO_URI not found in environment. Server running without database.'
    );
    console.warn(
      '   Copy server/.env.example to server/.env and add your MongoDB Atlas URI.'
    );
  }

  const server = http.createServer(app);
  setupSocket(server);
  startCronJobs();

  server.listen(PORT, () => {
    console.log(
      `🚀 ShopSphere server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`
    );
  });
};

startServer();
