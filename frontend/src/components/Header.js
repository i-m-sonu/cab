import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { DirectionsCar, Dashboard, Book, TrackChanges, Settings, Route } from '@mui/icons-material';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/book', label: 'Book Cab', icon: <Book /> },
    { path: '/track', label: 'Track Booking', icon: <TrackChanges /> },
    { path: '/cabs', label: 'Manage Cabs', icon: <DirectionsCar /> },
    { path: '/routes', label: 'Manage Routes', icon: <Route /> },
  ];

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <DirectionsCar sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cab Booking System
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              color="inherit"
              startIcon={item.icon}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{
                color: 'white',
                borderColor: location.pathname === item.path ? 'white' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
