import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search,
  Email,
  Route as RouteIcon,
  AccessTime,
  AttachMoney,
  DirectionsCar,
  Person,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { bookingService } from '../services/api';

const BookingTracker = () => {
  const [searchType, setSearchType] = useState('bookingId');
  const [searchValue, setSearchValue] = useState('');
  const [booking, setBooking] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserBookings, setShowUserBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    try {
      setLoading(true);
      setBooking(null);
      setUserBookings([]);

      if (searchType === 'bookingId') {
        const response = await bookingService.getBookingByBookingId(searchValue.trim());
        setBooking(response.data);
      } else {
        const response = await bookingService.getUserBookings(searchValue.trim());
        setUserBookings(response.data);
        if (response.data.length === 0) {
          toast.info('No bookings found for this email');
        } else {
          setShowUserBookings(true);
        }
      }
    } catch (error) {
      console.error('Error searching booking:', error);
      if (error.response?.status === 404) {
        toast.error('Booking not found');
      } else {
        toast.error('Failed to search booking');
      }
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

  const getStatusDescription = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Your booking is confirmed and waiting for pickup';
      case 'in-progress':
        return 'Your cab is on the way or trip is in progress';
      case 'completed':
        return 'Your trip has been completed successfully';
      case 'cancelled':
        return 'This booking has been cancelled';
      default:
        return 'Unknown status';
    }
  };

  const BookingCard = ({ bookingData, isClickable = false }) => (
    <Card 
      elevation={3} 
      sx={{ 
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': isClickable ? { boxShadow: 6 } : {},
      }}
      onClick={isClickable ? () => setSelectedBooking(bookingData) : undefined}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking ID: {bookingData.bookingId}
            </Typography>
            <Chip
              label={bookingData.status.toUpperCase()}
              color={getStatusColor(bookingData.status)}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            {new Date(bookingData.createdAt).toLocaleString()}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <RouteIcon sx={{ mr: 1, color: 'action.active' }} />
              <Typography variant="body1">
                <strong>Route:</strong> {bookingData.source} → {bookingData.destination}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <Person sx={{ mr: 1, color: 'action.active' }} />
              <Typography variant="body2">
                <strong>Passenger:</strong> {bookingData.userEmail || 'Anonymous Booking'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <DirectionsCar sx={{ mr: 1, color: 'action.active' }} />
              <Typography variant="body2">
                <strong>Cab:</strong> {bookingData.cabId?.name || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <AccessTime sx={{ mr: 1, color: 'action.active' }} />
              <Typography variant="body2">
                <strong>Duration:</strong> {bookingData.totalTime} minutes
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <AttachMoney sx={{ mr: 1, color: 'action.active' }} />
              <Typography variant="body2">
                <strong>Cost:</strong> ${bookingData.estimatedCost.toFixed(2)}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              <strong>Start Time:</strong> {new Date(bookingData.startTime).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>Full Path:</strong> {bookingData.route.join(' → ')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {getStatusDescription(bookingData.status)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Track Your Booking
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search for Booking
        </Typography>

        <Grid container spacing={2} alignItems="end">
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Search by"
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSearchValue('');
                setBooking(null);
                setUserBookings([]);
              }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="bookingId">Booking ID</option>
              <option value="email">Email Address</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={7}>
            <TextField
              fullWidth
              label={searchType === 'bookingId' ? 'Enter Booking ID' : 'Enter Email Address'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: searchType === 'bookingId' ? 
                  <RouteIcon sx={{ mr: 1, color: 'action.active' }} /> : 
                  <Email sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={<Search />}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {booking && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Booking Details
          </Typography>
          <BookingCard bookingData={booking} />
        </Box>
      )}

      {userBookings.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            All Bookings for {searchValue}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Click on any booking to view details
          </Typography>
          <Grid container spacing={2}>
            {userBookings.map((booking) => (
              <Grid item xs={12} key={booking._id}>
                <BookingCard bookingData={booking} isClickable />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {!booking && userBookings.length === 0 && !loading && (
        <Alert severity="info">
          Enter a booking ID or email address to track your booking.
        </Alert>
      )}

      {/* Booking Details Dialog */}
      <Dialog
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Booking Details - {selectedBooking?.bookingId}
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={selectedBooking.status.toUpperCase()}
                        color={getStatusColor(selectedBooking.status)}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Passenger Email"
                    secondary={selectedBooking.userEmail || 'Anonymous Booking'}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Route"
                    secondary={`${selectedBooking.source} → ${selectedBooking.destination}`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Full Path"
                    secondary={selectedBooking.route.join(' → ')}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Cab"
                    secondary={selectedBooking.cabId?.name || 'N/A'}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Duration"
                    secondary={`${selectedBooking.totalTime} minutes`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Estimated Cost"
                    secondary={`$${selectedBooking.estimatedCost.toFixed(2)}`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Start Time"
                    secondary={new Date(selectedBooking.startTime).toLocaleString()}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Expected End Time"
                    secondary={new Date(selectedBooking.endTime).toLocaleString()}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Booking Created"
                    secondary={new Date(selectedBooking.createdAt).toLocaleString()}
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBooking(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingTracker;
