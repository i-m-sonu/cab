import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Route as RouteIcon,
  LocalTaxi,
  AccessTime,
  Email,
  LocationOn,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { bookingService } from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const ModernBookingForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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
  const [redirecting, setRedirecting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await bookingService.getSources();
      setSources(response.data);
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast.error('Failed to load locations');
    }
  };

  const fetchDestinations = async (source) => {
    try {
      const response = await bookingService.getDestinations(source);
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast.error('Failed to load destinations');
    }
  };

  const calculateRoute = async (source = formData.source, destination = formData.destination) => {
    if (!source || !destination) {
      toast.error('Please select both source and destination');
      return;
    }

    try {
      setCalculatingRoute(true);
      const response = await bookingService.calculateRoute(source, destination);
      
      // Transform API response to match component expectations
      const transformedData = {
        path: response.data.route,
        totalTime: response.data.totalTime,
        availableCabs: response.data.cabOptions.map(cab => ({
          id: cab.cabId,
          name: cab.name,
          type: 'Standard', // Default type
          pricePerMinute: cab.pricePerMinute,
          totalCost: cab.estimatedCost
        }))
      };
      
      setRouteCalculation(transformedData);
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error(error.response?.data?.error || 'Failed to calculate route');
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await bookingService.createBooking(formData);
      
      const successMessage = formData.userEmail 
        ? `Booking confirmed! Booking ID: ${response.data.bookingId}. Confirmation email sent. Taking you to dashboard to track your ride...`
        : `Booking confirmed! Booking ID: ${response.data.bookingId}. Please save this ID for tracking. Taking you to dashboard to see your booking...`;
      
      toast.success(successMessage, {
        autoClose: 2000,
        onClose: () => setRedirecting(false),
      });
      
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
      
      // Redirect to dashboard after successful booking
      setRedirecting(true);
      setTimeout(() => {
        navigate('/');
      }, 2000); // Wait 2 seconds to show the success message
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

    // Fetch destinations when source changes
    if (name === 'source' && value) {
      fetchDestinations(value);
      setFormData(prev => ({ ...prev, destination: '' }));
      setRouteCalculation(null);
    }

    // Calculate route when both source and destination are selected
    if (name === 'destination' && value && formData.source) {
      // Call calculateRoute with the new destination value
      calculateRoute(formData.source, value);
    }
  };

  const selectCab = (cab) => {
    setFormData(prev => ({ ...prev, cabId: cab.id }));
    if (errors.cabId) {
      setErrors(prev => ({ ...prev, cabId: '' }));
    }
  };

  const CabCard = ({ cab, isSelected }) => (
    <MotionCard
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => selectCab(cab)}
      sx={{
        cursor: 'pointer',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'primary.50' : 'background.paper',
        transition: 'all 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                bgcolor: isSelected ? 'primary.main' : 'grey.200',
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              <LocalTaxi />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {cab.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {cab.type} • 4.8 ⭐
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
              ${cab.totalCost}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ${cab.pricePerMinute}/min
            </Typography>
          </Box>
        </Box>
        {isSelected && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">Duration:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {routeCalculation?.totalTime} min
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Total Cost:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ${cab.totalCost}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </MotionCard>
  );

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: 1200, 
      mx: 'auto',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ mb: { xs: 3, sm: 4 } }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 600, 
            mb: 1,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Book Your Ride 🚗
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Choose your pickup and destination to get started
        </Typography>
      </MotionBox>

      {/* Success/Redirect Message */}
      {redirecting && (
        <MotionCard
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          sx={{ 
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            >
              <CheckCircle sx={{ fontSize: 60, mb: 2 }} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                Booking Confirmed! 🎉
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                Taking you to dashboard to track your ride...
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <CircularProgress sx={{ color: 'white' }} />
            </motion.div>
          </CardContent>
          {/* Animated background decoration */}
          <Box
            component={motion.div}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.1 }}
            transition={{ delay: 0.3, duration: 1 }}
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
            }}
          />
        </MotionCard>
      )}

      <Grid container spacing={{ xs: 2, sm: 4 }}>
        {/* Booking Form */}
        <Grid item xs={12} md={8}>
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            sx={{ mb: { xs: 2, sm: 3 } }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}
              >
                Trip Details
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {/* Email Field */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address (Optional)"
                      name="userEmail"
                      type="email"
                      value={formData.userEmail}
                      onChange={handleChange}
                      error={!!errors.userEmail}
                      helperText={errors.userEmail || "Email is optional - for booking notifications and tracking"}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>

                  {/* Source */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.source}>
                      <InputLabel>Pickup Location</InputLabel>
                      <Select
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        startAdornment={<LocationOn sx={{ mr: 1, color: 'action.active' }} />}
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        {sources.map((source) => (
                          <MenuItem key={source} value={source}>
                            {source}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Destination */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.destination}>
                      <InputLabel>Drop-off Location</InputLabel>
                      <Select
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        disabled={!formData.source}
                        startAdornment={<LocationOn sx={{ mr: 1, color: 'action.active' }} />}
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        {destinations.map((destination) => (
                          <MenuItem key={destination} value={destination}>
                            {destination}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Start Time */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pickup Time"
                      name="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={handleChange}
                      error={!!errors.startTime}
                      helperText={errors.startTime}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().slice(0, 16),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </MotionCard>

          {/* Route Information */}
          {calculatingRoute && (
            <MotionCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              sx={{ mb: 3 }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="h6">Calculating optimal route...</Typography>
              </CardContent>
            </MotionCard>
          )}

          {routeCalculation && (
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              sx={{ mb: 3 }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                  <CheckCircle sx={{ color: 'success.main', mr: 2 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    Route Found!
                  </Typography>
                </Box>

                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={4} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <AccessTime sx={{ 
                        fontSize: { xs: 32, sm: 40 }, 
                        color: 'primary.main', 
                        mb: 1 
                      }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {routeCalculation.totalTime} min
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Duration
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <RouteIcon sx={{ 
                        fontSize: { xs: 32, sm: 40 }, 
                        color: 'secondary.main', 
                        mb: 1 
                      }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {routeCalculation.path.length - 1} stops
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Path
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <TrendingUp sx={{ 
                        fontSize: { xs: 32, sm: 40 }, 
                        color: 'success.main', 
                        mb: 1 
                      }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        Best
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Route
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Route Path:
                  </Typography>
                  <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                    {routeCalculation.path.map((location, index) => (
                      <React.Fragment key={location}>
                        <Chip
                          label={location}
                          color={index === 0 ? 'primary' : index === routeCalculation.path.length - 1 ? 'secondary' : 'default'}
                          variant={index === 0 || index === routeCalculation.path.length - 1 ? 'filled' : 'outlined'}
                        />
                        {index < routeCalculation.path.length - 1 && (
                          <Typography variant="body2" color="textSecondary">
                            →
                          </Typography>
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>

                {/* Available Cabs */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Choose Your Ride:
                  </Typography>
                  <Grid container spacing={2}>
                    {routeCalculation.availableCabs.map((cab) => (
                      <Grid item xs={12} sm={6} key={cab.id}>
                        <CabCard
                          cab={cab}
                          isSelected={formData.cabId === cab.id}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {errors.cabId && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.cabId}
                    </Alert>
                  )}
                </Box>

                {/* Book Button */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading || !formData.cabId || redirecting}
                    startIcon={loading || redirecting ? <CircularProgress size={20} /> : <CheckCircle />}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      },
                    }}
                  >
                    {loading ? 'Booking...' : redirecting ? 'Redirecting...' : 'Confirm Booking'}
                  </Button>
                </Box>
              </CardContent>
            </MotionCard>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            sx={{ position: 'sticky', top: 20 }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Booking Summary
              </Typography>

              {!routeCalculation ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LocalTaxi sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    Select pickup and destination to see available rides
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Route
                    </Typography>
                    <Typography variant="h6">
                      {formData.source} → {formData.destination}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Duration
                    </Typography>
                    <Typography variant="h6">
                      {routeCalculation.totalTime} minutes
                    </Typography>
                  </Box>

                  {formData.cabId && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Selected Cab
                      </Typography>
                      <Typography variant="h6">
                        {routeCalculation.availableCabs.find(c => c.id === formData.cabId)?.name}
                      </Typography>
                    </Box>
                  )}

                  {formData.startTime && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Pickup Time
                      </Typography>
                      <Typography variant="h6">
                        {new Date(formData.startTime).toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  {formData.cabId && (
                    <Box
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'primary.main',
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Total Cost
                      </Typography>
                      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                        ${routeCalculation.availableCabs.find(c => c.id === formData.cabId)?.totalCost}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModernBookingForm;
