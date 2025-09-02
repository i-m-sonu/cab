const express = require('express');
const router = express.Router();
const Cab = require('../models/CabSimple');

// Get all cabs
router.get('/', async (req, res) => {
  try {
    const cabs = await Cab.find({ isActive: true });
    // Remove currentBookings from response
    const cabsResponse = cabs.map(cab => {
      const { currentBookings, ...cabData } = cab;
      return cabData;
    });
    res.json(cabsResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cab by ID
router.get('/:id', async (req, res) => {
  try {
    const cab = await Cab.findById(req.params.id);
    if (!cab) {
      return res.status(404).json({ error: 'Cab not found' });
    }
    res.json(cab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new cab
router.post('/', async (req, res) => {
  try {
    const { name, pricePerMinute } = req.body;
    
    if (!name || !pricePerMinute) {
      return res.status(400).json({ error: 'Name and price per minute are required' });
    }

    if (pricePerMinute <= 0) {
      return res.status(400).json({ error: 'Price per minute must be positive' });
    }

    const cab = new Cab({ 
      name, 
      pricePerMinute, 
      isActive: true, 
      currentBookings: [] 
    });
    await cab.save();
    res.status(201).json(cab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cab
router.put('/:id', async (req, res) => {
  try {
    const { name, pricePerMinute, isActive } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (pricePerMinute !== undefined) {
      if (pricePerMinute <= 0) {
        return res.status(400).json({ error: 'Price per minute must be positive' });
      }
      updateData.pricePerMinute = pricePerMinute;
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const cab = await Cab.findByIdAndUpdate(req.params.id, updateData);

    if (!cab) {
      return res.status(404).json({ error: 'Cab not found' });
    }

    res.json(cab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete cab (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const cab = await Cab.findByIdAndUpdate(req.params.id, { isActive: false });

    if (!cab) {
      return res.status(404).json({ error: 'Cab not found' });
    }

    res.json({ message: 'Cab deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check cab availability
router.post('/check-availability', async (req, res) => {
  try {
    const { cabId, startTime, endTime } = req.body;
    
    if (!cabId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Cab ID, start time, and end time are required' });
    }

    const cab = await Cab.findById(cabId);
    if (!cab) {
      return res.status(404).json({ error: 'Cab not found' });
    }

    const isAvailable = cab.isAvailable(startTime, endTime);
    res.json({ available: isAvailable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
