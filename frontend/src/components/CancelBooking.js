import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Cancel,
  Warning,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { bookingService } from '../services/api';

const CancelBooking = () => {
  const [formData, setFormData] = useState({
    bookingId: '',
    userEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bookingId.trim()) {
      newErrors.bookingId = 'Booking ID is required';
    }

    if (formData.userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = 'Please enter a valid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchBookingDetails = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await bookingService.getBookingByBookingId(formData.bookingId.trim());
      
      if (response.data.status === 'cancelled') {
        toast.error('This booking is already cancelled');
        return;
      }

      if (response.data.status === 'completed') {
        toast.error('Cannot cancel a completed booking');
        return;
      }

      setBooking(response.data);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error(error.response?.data?.error || 'Booking not found');
    } finally {
      setLoading(false);
    }
  };

  const confirmCancellation = async () => {
    try {
      setLoading(true);
      const response = await bookingService.cancelBooking(
        formData.bookingId.trim(), 
        formData.userEmail.trim() || undefined
      );
      
      toast.success(response.data.message);
      
      // Reset form
      setFormData({ bookingId: '', userEmail: '' });
      setBooking(null);
      setShowConfirmDialog(false);
      setErrors({});
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
          <Cancel sx={{ mr: 2, color: 'error.main', fontSize: 32 }} />
          <Typography variant="h4" component="h1" color="error.main">
            Cancel Booking
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important:</strong> Once cancelled, bookings cannot be restored. 
            Please ensure you want to cancel before proceeding.
          </Typography>
        </Alert>

        <Box component="form" onSubmit={(e) => { e.preventDefault(); fetchBookingDetails(); }}>
          <TextField
            fullWidth
            label="Booking ID"
            name="bookingId"
            value={formData.bookingId}
            onChange={handleChange}
            error={!!errors.bookingId}
            helperText={errors.bookingId || "Enter the booking ID you want to cancel"}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email Address (Optional)"
            name="userEmail"
            type="email"
            value={formData.userEmail}
            onChange={handleChange}
            error={!!errors.userEmail}
            helperText={errors.userEmail || "Optional: For additional verification if you provided email during booking"}
            margin="normal"
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="error"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Cancel />}
            sx={{ mb: 2 }}
          >
            {loading ? 'Searching...' : 'Find & Cancel Booking'}
          </Button>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog 
          open={showConfirmDialog} 
          onClose={() => setShowConfirmDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Warning sx={{ mr: 1, color: 'warning.main' }} />
              Confirm Booking Cancellation
            </Box>
          </DialogTitle>
          
          <DialogContent>
            {booking && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Booking Details:
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    <strong>Booking ID:</strong> {booking.bookingId}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Passenger:</strong> {booking.userEmail || 'Anonymous Booking'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Route:</strong> {booking.source} → {booking.destination}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Cab:</strong> {booking.cabId?.name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Start Time:</strong> {new Date(booking.startTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Cost:</strong> ${booking.estimatedCost}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={booking.status.toUpperCase()} 
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Warning:</strong> This action cannot be undone. The booking will be permanently cancelled
                    and the cab will become available for other bookings.
                  </Typography>
                </Alert>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button 
              onClick={() => setShowConfirmDialog(false)}
              color="inherit"
            >
              Keep Booking
            </Button>
            <Button 
              onClick={confirmCancellation}
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Cancel />}
            >
              {loading ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default CancelBooking;
