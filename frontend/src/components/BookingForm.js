import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  Route as RouteIcon,
  LocalTaxi,
  AccessTime,
  AttachMoney,
  Email,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { bookingService } from '../services/api';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    source: '',
    destination: '',
    cabId: '',
    startTime: '',
  });
  const [sources, setSources] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [routeCalculation, setRouteCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    if (formData.source) {
      fetchDestinations(formData.source);
    } else {
      setDestinations([]);
    }
    // Reset route calculation when source changes
    setRouteCalculation(null);
    setFormData(prev => ({ ...prev, destination: '', cabId: '' }));
  }, [formData.source]);

  useEffect(() => {
    if (formData.source && formData.destination && formData.source !== formData.destination) {
      calculateRoute();
    } else {
      setRouteCalculation(null);
    }
  }, [formData.source, formData.destination]);

  const fetchSources = async () => {
    try {
      const response = await bookingService.getSources();
      setSources(response.data);
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast.error('Failed to load source locations');
    }
  };

  const fetchDestinations = async (source) => {
    try {
      const response = await bookingService.getDestinations(source);
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast.error('Failed to load destination locations');
    }
  };

  const calculateRoute = async () => {
    try {
      setCalculatingRoute(true);
      const response = await bookingService.calculateRoute(formData.source, formData.destination);
      setRouteCalculation(response.data);
      setFormData(prev => ({ ...prev, cabId: '' })); // Reset cab selection
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error(error.response?.data?.error || 'Failed to calculate route');
      setRouteCalculation(null);
    } finally {
      setCalculatingRoute(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = 'Please enter a valid email format';
    }

    if (!formData.source) {
      newErrors.source = 'Source is required';
    }

    if (!formData.destination) {
      newErrors.destination = 'Destination is required';
    }

    if (!formData.cabId) {
      newErrors.cabId = 'Please select a cab';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const selectedTime = new Date(formData.startTime);
      const now = new Date();
      if (selectedTime <= now) {
        newErrors.startTime = 'Start time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      const response = await bookingService.createBooking(formData);
      
      const successMessage = formData.userEmail 
        ? `Booking confirmed! Booking ID: ${response.data.bookingId}. Confirmation email sent.`
        : `Booking confirmed! Booking ID: ${response.data.bookingId}. Please save this ID for tracking.`;
      
      toast.success(successMessage);
      
      // Reset form
      setFormData({
        userEmail: '',
        source: '',
        destination: '',
        cabId: '',
        startTime: '',
      });
      setRouteCalculation(null);
      setErrors({});
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
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

  // Get minimum date/time (current time + 10 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Book a Cab
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Details
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address (Optional)"
                name="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={handleChange}
                error={!!errors.userEmail}
                helperText={errors.userEmail || "Email is optional - for booking notifications and tracking"}
                margin="normal"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />

              <FormControl fullWidth margin="normal" error={!!errors.source}>
                <InputLabel>Source Location</InputLabel>
                <Select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                >
                  {sources.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
                {errors.source && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.source}
                  </Typography>
                )}
              </FormControl>

              <FormControl 
                fullWidth 
                margin="normal" 
                error={!!errors.destination}
                disabled={!formData.source}
              >
                <InputLabel>Destination Location</InputLabel>
                <Select
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                >
                  {destinations.map((destination) => (
                    <MenuItem key={destination} value={destination}>
                      {destination}
                    </MenuItem>
                  ))}
                </Select>
                {errors.destination && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.destination}
                  </Typography>
                )}
              </FormControl>

              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
                error={!!errors.startTime}
                helperText={errors.startTime}
                margin="normal"
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: getMinDateTime(),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !routeCalculation || !formData.cabId}
                startIcon={loading ? <CircularProgress size={20} /> : <LocalTaxi />}
              >
                {loading ? 'Booking...' : 'Book Cab'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {calculatingRoute && (
            <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>Calculating shortest route...</Typography>
              </Box>
            </Paper>
          )}

          {routeCalculation && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Route Calculation
              </Typography>

              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center">
                    <RouteIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">Shortest Route</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      <strong>Path:</strong> {routeCalculation.route.join(' → ')}
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <AccessTime sx={{ mr: 1, fontSize: 20 }} />
                      <Typography>
                        <strong>Total Time:</strong> {routeCalculation.totalTime} minutes
                      </Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center">
                    <LocalTaxi sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">Available Cabs</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {routeCalculation.cabOptions.length === 0 ? (
                      <Alert severity="warning">No cabs available for this route</Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {routeCalculation.cabOptions.map((cab) => (
                          <Grid item xs={12} key={cab.cabId}>
                            <Card
                              variant={formData.cabId === cab.cabId ? 'outlined' : 'elevation'}
                              sx={{
                                cursor: 'pointer',
                                border: formData.cabId === cab.cabId ? 2 : 1,
                                borderColor: formData.cabId === cab.cabId ? 'primary.main' : 'divider',
                                '&:hover': {
                                  boxShadow: 3,
                                },
                              }}
                              onClick={() => setFormData(prev => ({ ...prev, cabId: cab.cabId }))}
                            >
                              <CardContent>
                                <Box display="flex" justifyContent="between" alignItems="center">
                                  <Box>
                                    <Typography variant="h6">{cab.name}</Typography>
                                    <Typography color="textSecondary">
                                      ${cab.pricePerMinute}/minute
                                    </Typography>
                                  </Box>
                                  <Box textAlign="right">
                                    <Chip
                                      icon={<AttachMoney />}
                                      label={`$${cab.estimatedCost.toFixed(2)}`}
                                      color="primary"
                                      variant={formData.cabId === cab.cabId ? 'filled' : 'outlined'}
                                    />
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    {errors.cabId && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {errors.cabId}
                      </Typography>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingForm;
