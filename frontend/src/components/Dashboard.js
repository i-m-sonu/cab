import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
} from '@mui/material';
import {
  DirectionsCar,
  BookmarkAdded,
  Route,
  TrendingUp,
  Cancel,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { bookingService, cabService, routeService } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeCabs: 0,
    totalRoutes: 0,
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, cabsRes, routesRes] = await Promise.all([
        bookingService.getAllBookings(),
        cabService.getAllCabs(),
        routeService.getAllRoutes(),
      ]);

      const bookings = bookingsRes.data;
      const recentBookings = bookings.slice(0, 5);

      setStats({
        totalBookings: bookings.length,
        activeCabs: cabsRes.data.length,
        totalRoutes: routesRes.data.length,
        recentBookings,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h3" color={color}>
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`} fontSize="3rem">
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<BookmarkAdded />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Cabs"
            value={stats.activeCabs}
            icon={<DirectionsCar />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Routes"
            value={stats.totalRoutes}
            icon={<Route />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Bookings"
            value={stats.recentBookings.filter(b => b.status === 'confirmed' || b.status === 'in-progress').length}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            {stats.recentBookings.length === 0 ? (
              <Typography color="textSecondary">No bookings found</Typography>
            ) : (
              <Box>
                {stats.recentBookings.map((booking) => (
                  <Card key={booking._id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6">
                            {booking.source} → {booking.destination}
                          </Typography>
                          <Typography color="textSecondary">
                            Booking ID: {booking.bookingId}
                          </Typography>
                          <Typography variant="body2">
                            Email: {booking.userEmail}
                          </Typography>
                          <Typography variant="body2">
                            Time: {booking.totalTime} min | Cost: ${booking.estimatedCost}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Chip
                            label={booking.status.toUpperCase()}
                            color={getStatusColor(booking.status)}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" color="textSecondary">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                component={RouterLink}
                to="/book"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<BookmarkAdded />}
              >
                Book a Cab
              </Button>
              <Button
                component={RouterLink}
                to="/track"
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<TrendingUp />}
              >
                Track Booking
              </Button>
              <Button
                component={RouterLink}
                to="/cancel"
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<Cancel />}
              >
                Cancel Booking
              </Button>
              <Button
                component={RouterLink}
                to="/cabs"
                variant="outlined"
                color="secondary"
                fullWidth
                startIcon={<DirectionsCar />}
              >
                Manage Cabs
              </Button>
              <Button
                component={RouterLink}
                to="/routes"
                variant="outlined"
                color="info"
                fullWidth
                startIcon={<Route />}
              >
                Manage Routes
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
