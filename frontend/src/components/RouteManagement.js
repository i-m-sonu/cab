import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Route as RouteIcon,
  AccessTime,
  Refresh,
  Timeline,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { routeService } from '../services/api';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    timeInMinutes: '',
  });
  const [errors, setErrors] = useState({});

  // Available locations for the route system
  const locations = ['A', 'B', 'C', 'D', 'E', 'F'];

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await routeService.getAllRoutes();
      setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeRoutes = async () => {
    if (!window.confirm('This will replace all existing routes with default routes. Continue?')) {
      return;
    }

    try {
      const response = await routeService.initializeRoutes();
      toast.success(`Routes initialized successfully! ${response.data.count} routes created.`);
      fetchRoutes();
    } catch (error) {
      console.error('Error initializing routes:', error);
      toast.error('Failed to initialize routes');
    }
  };

  const handleOpenDialog = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        from: route.from,
        to: route.to,
        timeInMinutes: route.timeInMinutes.toString(),
      });
    } else {
      setEditingRoute(null);
      setFormData({
        from: '',
        to: '',
        timeInMinutes: '',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRoute(null);
    setFormData({
      from: '',
      to: '',
      timeInMinutes: '',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.from) {
      newErrors.from = 'Source location is required';
    }

    if (!formData.to) {
      newErrors.to = 'Destination location is required';
    }

    if (formData.from && formData.to && formData.from === formData.to) {
      newErrors.to = 'Source and destination cannot be the same';
    }

    if (!formData.timeInMinutes.trim()) {
      newErrors.timeInMinutes = 'Time in minutes is required';
    } else {
      const time = parseInt(formData.timeInMinutes);
      if (isNaN(time) || time <= 0) {
        newErrors.timeInMinutes = 'Time must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const routeData = {
        from: formData.from,
        to: formData.to,
        timeInMinutes: parseInt(formData.timeInMinutes),
      };

      if (editingRoute) {
        await routeService.updateRoute(editingRoute._id, { timeInMinutes: routeData.timeInMinutes });
        toast.success('Route updated successfully');
      } else {
        await routeService.createRoute(routeData);
        toast.success('Route created successfully');
      }

      handleCloseDialog();
      fetchRoutes();
    } catch (error) {
      console.error('Error saving route:', error);
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        toast.error('A route between these locations already exists');
      } else {
        toast.error(error.response?.data?.error || 'Failed to save route');
      }
    }
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      await routeService.deleteRoute(routeId);
      toast.success('Route deleted successfully');
      fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Failed to delete route');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Group routes by source for better display
  const groupedRoutes = routes.reduce((acc, route) => {
    if (!acc[route.from]) {
      acc[route.from] = [];
    }
    acc[route.from].push(route);
    return acc;
  }, {});

  const getAverageTime = () => {
    if (routes.length === 0) return 0;
    return (routes.reduce((sum, route) => sum + route.timeInMinutes, 0) / routes.length).toFixed(1);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Route Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleInitializeRoutes}
            sx={{ mr: 1 }}
          >
            Initialize Default Routes
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add New Route
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {routes.length}
            </Typography>
            <Typography color="textSecondary">Total Routes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {Object.keys(groupedRoutes).length}
            </Typography>
            <Typography color="textSecondary">Source Locations</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {getAverageTime()}
            </Typography>
            <Typography color="textSecondary">Avg Time (min)</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {routes.length > 0 ? Math.max(...routes.map(r => r.timeInMinutes)) : 0}
            </Typography>
            <Typography color="textSecondary">Longest Route (min)</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell align="right">Time (minutes)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Loading routes...
                  </TableCell>
                </TableRow>
              ) : routes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="info">
                      No routes found. Click "Initialize Default Routes" to create sample routes or "Add New Route" to create your own.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                routes
                  .sort((a, b) => {
                    if (a.from !== b.from) {
                      return a.from.localeCompare(b.from);
                    }
                    return a.to.localeCompare(b.to);
                  })
                  .map((route) => (
                    <TableRow key={route._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <RouteIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" color="primary">
                            {route.from}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Timeline sx={{ mr: 1, color: 'secondary.main' }} />
                          <Typography variant="h6" color="secondary">
                            {route.to}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <AccessTime sx={{ mr: 1, fontSize: 18 }} />
                          <Typography variant="h6">
                            {route.timeInMinutes}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(route)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(route._id)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Route Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRoute ? 'Edit Route' : 'Add New Route'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.from}>
                <InputLabel>From Location</InputLabel>
                <Select
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  disabled={!!editingRoute} // Can't change source/destination when editing
                  label="From Location"
                >
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
                {errors.from && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.from}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.to}>
                <InputLabel>To Location</InputLabel>
                <Select
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  disabled={!!editingRoute} // Can't change source/destination when editing
                  label="To Location"
                >
                  {locations
                    .filter(location => location !== formData.from)
                    .map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                </Select>
                {errors.to && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.to}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="timeInMinutes"
                label="Time in Minutes"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.timeInMinutes}
                onChange={handleChange}
                error={!!errors.timeInMinutes}
                helperText={errors.timeInMinutes}
                inputProps={{
                  min: 1,
                  step: 1,
                }}
              />
            </Grid>
          </Grid>
          
          {editingRoute && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You can only edit the travel time for existing routes. To change source/destination, delete this route and create a new one.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRoute ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RouteManagement;
