const express = require('express');
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

console.log('Using in-memory database for demo purposes');

// Import routes with simple models
const cabRoutes = require('./routes/cabsSimple');
const bookingRoutes = require('./routes/bookingsSimple');
const routeRoutes = require('./routes/routesSimple');

// Use routes
app.use('/api/cabs', cabRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/routes', routeRoutes);

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
