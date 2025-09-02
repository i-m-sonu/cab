const express = require('express');
const router = express.Router();
const Route = require('../models/RouteSimple');

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

    // Check if route already exists
    const existingRoutes = await Route.find();
    const routeExists = existingRoutes.some(route => 
      route.from === from.toUpperCase() && route.to === to.toUpperCase()
    );

    if (routeExists) {
      return res.status(400).json({ error: 'Route already exists' });
    }

    const route = new Route({ 
      from: from.toUpperCase(), 
      to: to.toUpperCase(), 
      timeInMinutes 
    });
    
    await route.save();
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update route
router.put('/:id', async (req, res) => {
  try {
    const { timeInMinutes } = req.body;
    
    if (timeInMinutes !== undefined && timeInMinutes <= 0) {
      return res.status(400).json({ error: 'Time must be positive' });
    }

    const route = await Route.findByIdAndUpdate(req.params.id, { timeInMinutes });

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

// Initialize default routes (already done in inMemoryDB, but keeping for API compatibility)
router.post('/initialize', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json({ 
      message: 'Routes already initialized', 
      count: routes.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
