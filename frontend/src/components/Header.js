import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  useTheme as useMuiTheme,
  Badge,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  DirectionsCar, 
  Dashboard, 
  Book, 
  TrackChanges, 
  Route, 
  Cancel,
  LightMode,
  DarkMode,
  Notifications,
} from '@mui/icons-material';
import { useTheme } from '../theme/ThemeProvider';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const Header = () => {
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/book', label: 'Book Ride', icon: <Book /> },
    { path: '/track', label: 'Track', icon: <TrackChanges /> },
    { path: '/cancel', label: 'Cancel', icon: <Cancel /> },
  ];

  const adminItems = [
    { path: '/cabs', label: 'Cabs', icon: <DirectionsCar /> },
    { path: '/routes', label: 'Routes', icon: <Route /> },
  ];

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: darkMode 
          ? `linear-gradient(135deg, ${muiTheme.palette.background.paper}, ${muiTheme.palette.background.elevated})`
          : `linear-gradient(135deg, ${muiTheme.palette.background.paper}, ${muiTheme.palette.surface.main})`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${muiTheme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
        {/* Logo */}
        <Box display="flex" alignItems="center" sx={{ mr: { xs: 2, sm: 4 } }}>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <DirectionsCar 
              sx={{ 
                mr: { xs: 1, sm: 2 }, 
                fontSize: { xs: 28, sm: 32 },
                color: 'primary.main',
              }} 
            />
          </motion.div>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: { xs: 'none', sm: 'block' },
              fontSize: { sm: '1.25rem', md: '1.5rem' }
            }}
          >
            RideFlow
          </Typography>
        </Box>
        
        {/* Navigation */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 }, 
          flexGrow: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}>
          {navItems.map((item) => (
            <MotionButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              startIcon={<Box sx={{ display: { xs: 'none', sm: 'flex' } }}>{item.icon}</Box>}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                bgcolor: location.pathname === item.path 
                  ? 'primary.main' 
                  : 'transparent',
                color: location.pathname === item.path 
                  ? 'white' 
                  : 'text.primary',
                borderRadius: 2,
                px: { xs: 1, sm: 2 },
                py: 1,
                minWidth: { xs: 'auto', sm: 'auto' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&:hover': {
                  bgcolor: location.pathname === item.path 
                    ? 'primary.dark' 
                    : 'action.hover',
                },
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <Box sx={{ 
                display: { xs: 'none', sm: 'block' },
                whiteSpace: 'nowrap'
              }}>
                {item.label}
              </Box>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                {item.icon}
              </Box>
            </MotionButton>
          ))}
        </Box>

        {/* Admin Section */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
          {adminItems.map((item) => (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              startIcon={item.icon}
              size="small"
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Right Section */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Notifications */}
          <IconButton
            size="large"
            sx={{
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Theme Toggle */}
          <motion.div whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={toggleTheme}
              size="large"
              sx={{
                color: 'text.primary',
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
