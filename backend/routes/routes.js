const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// Get all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new route
router.post('/', async (req, res) => {
  try {
    const { from, to, timeInMinutes } = req.body;
    
    if (!from || !to || !timeInMinutes) {
      return res.status(400).json({ error: 'From, to, and time in minutes are required' });
    }

    if (timeInMinutes <= 0) {
      return res.status(400).json({ error: 'Time must be positive' });
    }

    if (from.toUpperCase() === to.toUpperCase()) {
      return res.status(400).json({ error: 'Source and destination cannot be the same' });
    }

    const route = new Route({ 
      from: from.toUpperCase(), 
      to: to.toUpperCase(), 
      timeInMinutes 
    });
    
    await route.save();
    res.status(201).json(route);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Route already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update route
router.put('/:id', async (req, res) => {
  try {
    const { timeInMinutes } = req.body;
    
    if (timeInMinutes !== undefined && timeInMinutes <= 0) {
      return res.status(400).json({ error: 'Time must be positive' });
    }

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { timeInMinutes },
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete route
router.delete('/:id', async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize default routes
router.post('/initialize', async (req, res) => {
  try {
    // Clear existing routes
    await Route.deleteMany({});
    
    // Default route data based on requirements
    const defaultRoutes = [
      { from: 'A', to: 'B', timeInMinutes: 5 },
      { from: 'B', to: 'A', timeInMinutes: 5 },
      { from: 'A', to: 'C', timeInMinutes: 10 },
      { from: 'C', to: 'A', timeInMinutes: 10 },
      { from: 'B', to: 'C', timeInMinutes: 8 },
      { from: 'C', to: 'B', timeInMinutes: 8 },
      { from: 'C', to: 'D', timeInMinutes: 7 },
      { from: 'D', to: 'C', timeInMinutes: 7 },
      { from: 'D', to: 'E', timeInMinutes: 12 },
      { from: 'E', to: 'D', timeInMinutes: 12 },
      { from: 'D', to: 'F', timeInMinutes: 20 },
      { from: 'F', to: 'D', timeInMinutes: 20 },
      { from: 'E', to: 'F', timeInMinutes: 15 },
      { from: 'F', to: 'E', timeInMinutes: 15 },
      { from: 'B', to: 'D', timeInMinutes: 25 },
      { from: 'D', to: 'B', timeInMinutes: 25 },
      { from: 'A', to: 'E', timeInMinutes: 30 },
      { from: 'E', to: 'A', timeInMinutes: 30 }
    ];

    await Route.insertMany(defaultRoutes);
    res.json({ message: 'Routes initialized successfully', count: defaultRoutes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
