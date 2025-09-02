const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/BookingSimple');
const Cab = require('../models/CabSimple');
const ShortestPath = require('../utils/shortestPathSimple');
const EmailService = require('../utils/emailService');

const shortestPath = new ShortestPath();
const emailService = new EmailService();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find();
    
    // Populate cab details for each booking
    for (let booking of bookings) {
      await booking.populate('cabId', 'name pricePerMinute');
    }
    
    // Sort by creation date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await booking.populate('cabId', 'name pricePerMinute');
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking by booking ID
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await booking.populate('cabId', 'name pricePerMinute');
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate route and cost
router.post('/calculate', async (req, res) => {
  try {
    const { source, destination } = req.body;
    
    if (!source || !destination) {
      return res.status(400).json({ error: 'Source and destination are required' });
    }

    if (source.toUpperCase() === destination.toUpperCase()) {
      return res.status(400).json({ error: 'Source and destination cannot be the same' });
    }

    // Find shortest path
    const pathResult = await shortestPath.findShortestPath(
      source.toUpperCase(), 
      destination.toUpperCase()
    );

    // Get available cabs
    const cabs = await Cab.find({ isActive: true });
    
    const cabOptions = cabs.map(cab => ({
      cabId: cab._id,
      name: cab.name,
      pricePerMinute: cab.pricePerMinute,
      estimatedCost: pathResult.totalTime * cab.pricePerMinute
    }));

    res.json({
      route: pathResult.path,
      totalTime: pathResult.totalTime,
      cabOptions: cabOptions.sort((a, b) => a.estimatedCost - b.estimatedCost)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { userEmail, source, destination, cabId, startTime } = req.body;
    
    if (!source || !destination || !cabId || !startTime) {
      return res.status(400).json({ 
        error: 'Source, destination, cab ID, and start time are required' 
      });
    }

    // Validate email format if provided
    if (userEmail && userEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    if (source.toUpperCase() === destination.toUpperCase()) {
      return res.status(400).json({ error: 'Source and destination cannot be the same' });
    }

    // Find shortest path
    const pathResult = await shortestPath.findShortestPath(
      source.toUpperCase(), 
      destination.toUpperCase()
    );

    // Get cab details
    const cab = await Cab.findById(cabId);
    if (!cab || !cab.isActive) {
      return res.status(404).json({ error: 'Cab not found or inactive' });
    }

    // Calculate booking times
    const bookingStartTime = new Date(startTime);
    const bookingEndTime = new Date(bookingStartTime.getTime() + pathResult.totalTime * 60000);

    // Check cab availability
    if (!cab.isAvailable(bookingStartTime, bookingEndTime)) {
      return res.status(409).json({ error: 'Cab is not available for the requested time' });
    }

    // Calculate cost
    const estimatedCost = pathResult.totalTime * cab.pricePerMinute;

    // Create booking
    const booking = new Booking({
      bookingId: uuidv4().substring(0, 8).toUpperCase(),
      userEmail: userEmail && userEmail.trim() ? userEmail.toLowerCase() : null,
      source: source.toUpperCase(),
      destination: destination.toUpperCase(),
      cabId,
      route: pathResult.path,
      totalTime: pathResult.totalTime,
      estimatedCost,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      status: 'confirmed'
    });

    await booking.save();

    // Update cab's current bookings
    if (!cab.currentBookings) {
      cab.currentBookings = [];
    }
    cab.currentBookings.push({
      bookingId: booking._id,
      startTime: bookingStartTime,
      endTime: bookingEndTime
    });
    await cab.save();

    // Populate cab details for response
    await booking.populate('cabId', 'name pricePerMinute');

    // Send confirmation email only if email is provided (don't wait for it)
    if (booking.userEmail) {
      emailService.sendBookingConfirmation(booking, cab)
        .then((success) => {
          if (success) {
            Booking.findByIdAndUpdate(booking._id, { emailSent: true });
          }
        })
        .catch(err => console.error('Failed to send confirmation email:', err));
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['confirmed', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Valid status is required (confirmed, in-progress, completed, cancelled)' 
      });
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, { status });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If booking is completed or cancelled, remove from cab's current bookings
    if (status === 'completed' || status === 'cancelled') {
      const cab = await Cab.findById(booking.cabId);
      if (cab && cab.currentBookings) {
        cab.currentBookings = cab.currentBookings.filter(
          b => b.bookingId !== booking._id
        );
        await cab.save();
      }
    }

    await booking.populate('cabId', 'name pricePerMinute');

    // Send status update email only if email is provided
    if (status !== 'confirmed' && booking.userEmail) {
      emailService.sendBookingUpdate(booking, booking.cabId, status)
        .catch(err => console.error('Failed to send update email:', err));
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available sources and destinations
router.get('/locations/sources', async (req, res) => {
  try {
    const sources = await shortestPath.getSources();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/locations/destinations/:source', async (req, res) => {
  try {
    const destinations = await shortestPath.getDestinations(req.params.source.toUpperCase());
    res.json(destinations.filter(dest => dest !== req.params.source.toUpperCase()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user bookings
router.get('/user/:email', async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      userEmail: req.params.email.toLowerCase() 
    });
    
    // Populate cab details for each booking
    for (let booking of bookings) {
      await booking.populate('cabId', 'name pricePerMinute');
    }
    
    // Sort by creation date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
