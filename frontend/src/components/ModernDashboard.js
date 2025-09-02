import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar,
  Timeline,
  History,
  LocationOn,
  Phone,
  Star,
  Schedule,
  Cancel as CancelIcon,
  Navigation,
  AccessTime,
  AttachMoney,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { bookingService } from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const ModernDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedTrips: 0,
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentRide, setCurrentRide] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes] = await Promise.all([
        bookingService.getAllBookings(),
      ]);

      const bookings = bookingsRes.data;
      const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'in-progress');
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      // Simulate current ride
      const currentRide = activeBookings.length > 0 ? activeBookings[0] : null;

      setStats({
        totalBookings: bookings.length,
        activeBookings: activeBookings.length,
        completedTrips: completedBookings.length,
        recentBookings: bookings.slice(0, 5),
      });

      setCurrentRide(currentRide);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, userEmail = null) => {
    try {
      await bookingService.cancelBooking(bookingId, userEmail);
      toast.success('Booking cancelled successfully!');
      
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'primary',
      'in-progress': 'warning',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const QuickActionCard = ({ title, icon, color, to, onClick }) => (
    <MotionCard
      component={to ? RouterLink : 'div'}
      to={to}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        cursor: 'pointer',
        textDecoration: 'none',
        background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
        color: 'white',
        minHeight: { xs: 100, sm: 120 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ textAlign: 'center', zIndex: 2 }}>
        {icon}
        <Typography 
          variant="h6" 
          sx={{ 
            mt: 1, 
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '1.25rem' }
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
        }}
      />
    </MotionCard>
  );

    const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
    <MotionCard
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      sx={{ height: '100%' }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: { xs: 20, sm: 24 } } })}
          </Avatar>
          {trend && (
            <Chip
              label={trend}
              size="small"
              sx={{
                bgcolor: 'success.light',
                color: 'success.dark',
                fontWeight: 600,
                fontSize: { xs: '0.6rem', sm: '0.75rem' },
              }}
            />
          )}
        </Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          {value}
        </Typography>
        <Typography 
          variant="body2" 
          color="textSecondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {title}
        </Typography>
      </CardContent>
    </MotionCard>
  );

  const LiveRideCard = () => {
    if (!currentRide) return null;

    return (
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ pb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="between" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Live Ride Tracking
            </Typography>
            <Chip
              label="IN PROGRESS"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9, 
                    mb: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Route: {currentRide.source} → {currentRide.destination}
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  Booking ID: {currentRide.bookingId}
                </Typography>

                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={{ xs: 1, sm: 2 }} 
                  sx={{ 
                    mb: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' }
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <AccessTime sx={{ fontSize: { xs: 16, sm: 18 }, mr: 1 }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {currentRide.totalTime} min
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <AttachMoney sx={{ fontSize: { xs: 16, sm: 18 }, mr: 1 }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      ${currentRide.estimatedCost}
                    </Typography>
                  </Box>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, opacity: 0.9 }}>
                  65% Complete • ETA: 8 minutes
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  <DirectionsCar sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {currentRide.cabId?.name || 'Driver'}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                  <Star sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">4.8 (124 trips)</Typography>
                </Box>
                <Box display="flex" gap={1} justifyContent="center">
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    <Phone sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    <Navigation sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleCancelBooking(currentRide.bookingId, currentRide.userEmail)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,0,0,0.3)' },
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>

        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
          }}
        />
      </MotionCard>
    );
  };

  const RecentRideCard = ({ booking, index }) => (
    <MotionCard
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      sx={{ mb: 2 }}
    >
      <CardContent sx={{ py: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" flex={1}>
            <Avatar
              sx={{
                bgcolor: `${getStatusColor(booking.status)}.main`,
                width: 40,
                height: 40,
                mr: 2,
              }}
            >
              <DirectionsCar sx={{ fontSize: 20 }} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {booking.source} → {booking.destination}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(booking.createdAt).toLocaleDateString()} • {booking.bookingId}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              ${booking.estimatedCost}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={booking.status.toUpperCase()}
                size="small"
                color={getStatusColor(booking.status)}
                variant="outlined"
              />
              {(booking.status === 'confirmed' || booking.status === 'in-progress') && (
                <IconButton
                  size="small"
                  onClick={() => handleCancelBooking(booking.bookingId, booking.userEmail)}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.50',
                    },
                  }}
                  title="Cancel Booking"
                >
                  <CancelIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </MotionCard>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: '200px' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: 1400, 
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
          Good morning! 👋
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Manage your rides and track your journeys
        </Typography>
      </MotionBox>

      {/* Live Ride Section */}
      {currentRide && (
        <Box sx={{ mb: 4 }}>
          <LiveRideCard />
        </Box>
      )}

      {/* Quick Actions */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        sx={{ mb: 4 }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: 3,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <QuickActionCard
              title="Book Ride"
              icon={<DirectionsCar sx={{ fontSize: { xs: 24, sm: 32 } }} />}
              color="primary"
              to="/book"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <QuickActionCard
              title="Track Ride"
              icon={<LocationOn sx={{ fontSize: { xs: 24, sm: 32 } }} />}
              color="secondary"
              to="/track"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <QuickActionCard
              title="Cancel Ride"
              icon={<CancelIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />}
              color="error"
              to="/cancel"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <QuickActionCard
              title="Ride History"
              icon={<History sx={{ fontSize: 32 }} />}
              color="accent"
              to="/track"
            />
          </Grid>
        </Grid>
      </MotionBox>

      {/* Stats Cards */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        sx={{ mb: 4 }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: 3,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Your Stats
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Total Rides"
              value={stats.totalBookings}
              icon={<DirectionsCar />}
              trend="+12% this month"
              color="primary"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Active Rides"
              value={stats.activeBookings}
              icon={<Timeline />}
              color="warning"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Completed"
              value={stats.completedTrips}
              icon={<Schedule />}
              trend="+5 this week"
              color="success"
            />
          </Grid>
        </Grid>
      </MotionBox>

      {/* Recent Rides */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Rides
            </Typography>
            {stats.recentBookings.length > 0 ? (
              stats.recentBookings.map((booking, index) => (
                <RecentRideCard key={booking._id} booking={booking} index={index} />
              ))
            ) : (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <DirectionsCar sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    No rides yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Book your first ride to get started
                  </Typography>
                  <Button variant="contained" component={RouterLink} to="/book">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </MotionBox>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModernDashboard;
