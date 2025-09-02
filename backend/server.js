const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection (fallback to in-memory if MongoDB is not available)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cab-booking';

let useInMemoryDB = false;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.log('MongoDB connection failed, using in-memory database:', err.message);
    useInMemoryDB = true;
  }
};

// Initialize database connection
connectToDatabase();

// Import routes (use simple routes if MongoDB fails)
let cabRoutes, bookingRoutes, routeRoutes;

setTimeout(() => {
  if (useInMemoryDB) {
    console.log('Using in-memory database for demo purposes');
    cabRoutes = require('./routes/cabsSimple');
    bookingRoutes = require('./routes/bookingsSimple');
    routeRoutes = require('./routes/routesSimple');
  } else {
    cabRoutes = require('./routes/cabs');
    bookingRoutes = require('./routes/bookings');
    routeRoutes = require('./routes/routes');
  }

  // Use routes
  app.use('/api/cabs', cabRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/routes', routeRoutes);
}, 1000); // Give MongoDB 1 second to connect

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cab booking system is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
