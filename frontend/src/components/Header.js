import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  useTheme as useMuiTheme,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
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
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTheme } from '../theme/ThemeProvider';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const Header = () => {
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
        {/* Mobile Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileMenu}
          sx={{ 
            mr: 2, 
            display: { xs: 'block', md: 'none' },
            color: 'text.primary'
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Box display="flex" alignItems="center" sx={{ mr: { xs: 1, md: 4 } }}>
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
            Cab Booking
          </Typography>
        </Box>
        
        {/* Desktop Navigation */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          gap: 1, 
          flexGrow: 1 
        }}>
          {navItems.map((item) => (
            <MotionButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              startIcon={item.icon}
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
                px: 2,
                py: 1,
                minWidth: 'auto',
                '&:hover': {
                  bgcolor: location.pathname === item.path 
                    ? 'primary.dark' 
                    : 'action.hover',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </MotionButton>
          ))}
        </Box>

        {/* Admin Section - Desktop Only */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1, mr: 2 }}>
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
        <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }}>
          {/* Notifications - Hidden on mobile */}
          <IconButton
            size="large"
            sx={{
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              display: { xs: 'none', sm: 'flex' }
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

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'background.paper',
            borderRight: `1px solid ${muiTheme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center">
              <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Cab Booking
              </Typography>
            </Box>
            <IconButton onClick={toggleMobileMenu}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <List>
            {navItems.map((item) => (
              <ListItem
                key={item.path}
                component={RouterLink}
                to={item.path}
                onClick={toggleMobileMenu}
                sx={{
                  bgcolor: location.pathname === item.path 
                    ? 'primary.main' 
                    : 'transparent',
                  color: location.pathname === item.path 
                    ? 'white' 
                    : 'text.primary',
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: location.pathname === item.path 
                      ? 'primary.dark' 
                      : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            
            {/* Admin items in mobile menu */}
            {adminItems.map((item) => (
              <ListItem
                key={item.path}
                component={RouterLink}
                to={item.path}
                onClick={toggleMobileMenu}
                sx={{
                  bgcolor: location.pathname === item.path 
                    ? 'secondary.main' 
                    : 'transparent',
                  color: location.pathname === item.path 
                    ? 'white' 
                    : 'text.secondary',
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: location.pathname === item.path 
                      ? 'secondary.dark' 
                      : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;
