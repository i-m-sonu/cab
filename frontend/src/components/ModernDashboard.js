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
  TrendingUp,
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
    
    // Fallback timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
        setStats({
          totalBookings: 0,
          activeBookings: 0,
          completedTrips: 0,
          recentBookings: [],
        });
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeoutId);
  }, [loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      const [bookingsRes] = await Promise.all([
        bookingService.getAllBookings(),
      ]);

      console.log('Bookings response:', bookingsRes);
      const bookings = bookingsRes.data;
      const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'in-progress');
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      // Simulate current ride
      const currentRide = activeBookings.length > 0 ? activeBookings[0] : null;

      const statsData = {
        totalBookings: bookings.length,
        activeBookings: activeBookings.length,
        completedTrips: completedBookings.length,
        recentBookings: bookings.slice(0, 5),
      };

      console.log('Stats data:', statsData);
      setStats(statsData);
      setCurrentRide(currentRide);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default stats even if API fails
      setStats({
        totalBookings: 0,
        activeBookings: 0,
        completedTrips: 0,
        recentBookings: [],
      });
      setCurrentRide(null);
    } finally {
      console.log('Setting loading to false');
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

  const QuickActionCard = ({ title, icon, color, to }) => {
    // Fallback to primary if color doesn't exist in theme
    const safeColor = theme.palette[color] ? color : 'primary';
    
    return (
      <MotionCard
        component={RouterLink}
        to={to}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        sx={{
          textDecoration: 'none',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${theme.palette[safeColor].main}, ${theme.palette[safeColor].dark})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          height: { xs: 120, sm: 140 },
        }}
      >
        <CardContent sx={{ 
          textAlign: 'center', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 1.5, sm: 2 }
        }}>
          <Box sx={{ mb: { xs: 1, sm: 2 } }}>
            {icon}
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '0.9rem', sm: '1.1rem' }
            }}
          >
            {title}
          </Typography>
        </CardContent>
      </MotionCard>
    );
  };

  const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
    <MotionCard
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      sx={{ height: '100%' }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: `${color}.main` }}>
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
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

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Route: {currentRide.source} → {currentRide.destination}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Booking ID: {currentRide.bookingId}
                </Typography>

                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center">
                    <AccessTime sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="body2">{currentRide.totalTime} min</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <AttachMoney sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="body2">${currentRide.estimatedCost}</Typography>
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
      sx={{ 
        mb: 2,
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flex: 1,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Avatar
              sx={{
                bgcolor: `${getStatusColor(booking.status)}.main`,
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                mr: 2,
              }}
            >
              <DirectionsCar sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </Avatar>
            <Box flex={1}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                {booking.source} → {booking.destination}
              </Typography>
              <Typography 
                variant="caption" 
                color="textSecondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
              >
                {new Date(booking.createdAt).toLocaleDateString()} • {booking.bookingId}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            textAlign: { xs: 'left', sm: 'right' }, 
            display: 'flex', 
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: { xs: 'center', sm: 'flex-end' },
            justifyContent: { xs: 'space-between', sm: 'center' },
            gap: { xs: 2, sm: 1 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600, 
                mb: { xs: 0, sm: 0.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              ${booking.estimatedCost}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={booking.status.toUpperCase()}
                size="small"
                color={getStatusColor(booking.status)}
                variant="outlined"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
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
                  <CancelIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
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
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <LinearProgress sx={{ width: '200px', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Loading dashboard...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 600, 
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
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
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <LiveRideCard />
        </Box>
      )}

      {/* Quick Actions */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={6} sm={3}>
            <QuickActionCard
              title="Book Ride"
              icon={<DirectionsCar sx={{ fontSize: { xs: 24, sm: 32 } }} />}
              color="primary"
              to="/book"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <QuickActionCard
              title="Track Ride"
              icon={<LocationOn sx={{ fontSize: { xs: 24, sm: 32 } }} />}
              color="secondary"
              to="/track"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
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
              icon={<History sx={{ fontSize: { xs: 24, sm: 32 } }} />}
              color="info"
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
        sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Your Stats
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Rides"
              value={stats.totalBookings}
              icon={<DirectionsCar />}
              trend="+12% this month"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Rides"
              value={stats.activeBookings}
              icon={<Timeline />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
