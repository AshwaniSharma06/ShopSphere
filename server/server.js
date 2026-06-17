const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ShopSphere API is running smoothly',
    timestamp: new Date()
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Connect to Database
const startServer = async () => {
  // If MONGO_URI is set, connect. Otherwise log fallback warning.
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn('Warning: MONGO_URI env variable not found. Running server without database connection.');
  }

  app.listen(PORT, () => {
    console.log(`ShopSphere Express server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();
