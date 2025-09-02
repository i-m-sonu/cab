import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  DirectionsCar,
  AttachMoney,
  Check,
  Close,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { cabService } from '../services/api';

const CabManagement = () => {
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCab, setEditingCab] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    pricePerMinute: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCabs();
  }, []);

  const fetchCabs = async () => {
    try {
      setLoading(true);
      const response = await cabService.getAllCabs();
      setCabs(response.data);
    } catch (error) {
      console.error('Error fetching cabs:', error);
      toast.error('Failed to load cabs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cab = null) => {
    if (cab) {
      setEditingCab(cab);
      setFormData({
        name: cab.name,
        pricePerMinute: cab.pricePerMinute.toString(),
      });
    } else {
      setEditingCab(null);
      setFormData({
        name: '',
        pricePerMinute: '',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCab(null);
    setFormData({
      name: '',
      pricePerMinute: '',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Cab name is required';
    }

    if (!formData.pricePerMinute.trim()) {
      newErrors.pricePerMinute = 'Price per minute is required';
    } else {
      const price = parseFloat(formData.pricePerMinute);
      if (isNaN(price) || price <= 0) {
        newErrors.pricePerMinute = 'Price must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const cabData = {
        name: formData.name.trim(),
        pricePerMinute: parseFloat(formData.pricePerMinute),
      };

      if (editingCab) {
        await cabService.updateCab(editingCab._id, cabData);
        toast.success('Cab updated successfully');
      } else {
        await cabService.createCab(cabData);
        toast.success('Cab created successfully');
      }

      handleCloseDialog();
      fetchCabs();
    } catch (error) {
      console.error('Error saving cab:', error);
      toast.error(error.response?.data?.error || 'Failed to save cab');
    }
  };

  const handleDelete = async (cabId) => {
    if (!window.confirm('Are you sure you want to delete this cab?')) {
      return;
    }

    try {
      await cabService.deleteCab(cabId);
      toast.success('Cab deleted successfully');
      fetchCabs();
    } catch (error) {
      console.error('Error deleting cab:', error);
      toast.error('Failed to delete cab');
    }
  };

  const handleToggleStatus = async (cab) => {
    try {
      await cabService.updateCab(cab._id, {
        isActive: !cab.isActive,
      });
      toast.success(`Cab ${cab.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCabs();
    } catch (error) {
      console.error('Error updating cab status:', error);
      toast.error('Failed to update cab status');
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Cab Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Cab
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {cabs.length}
            </Typography>
            <Typography color="textSecondary">Total Cabs</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {cabs.filter(cab => cab.isActive).length}
            </Typography>
            <Typography color="textSecondary">Active Cabs</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {cabs.filter(cab => !cab.isActive).length}
            </Typography>
            <Typography color="textSecondary">Inactive Cabs</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              ${cabs.length > 0 ? (cabs.reduce((sum, cab) => sum + cab.pricePerMinute, 0) / cabs.length).toFixed(2) : '0.00'}
            </Typography>
            <Typography color="textSecondary">Avg Price/Min</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cab Name</TableCell>
                <TableCell align="right">Price per Minute</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Current Bookings</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading cabs...
                  </TableCell>
                </TableRow>
              ) : cabs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Alert severity="info">No cabs found. Add your first cab to get started!</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                cabs.map((cab) => (
                  <TableRow key={cab._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <DirectionsCar sx={{ mr: 1, color: 'action.active' }} />
                        {cab.name}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <AttachMoney sx={{ fontSize: 18 }} />
                        {cab.pricePerMinute.toFixed(2)}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={cab.isActive ? 'Active' : 'Inactive'}
                        color={cab.isActive ? 'success' : 'default'}
                        size="small"
                        icon={cab.isActive ? <Check /> : <Close />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {cab.currentBookings?.length || 0}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(cab)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color={cab.isActive ? 'warning' : 'success'}
                        onClick={() => handleToggleStatus(cab)}
                        size="small"
                        title={cab.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {cab.isActive ? <Close /> : <Check />}
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(cab._id)}
                        size="small"
                        disabled={cab.currentBookings?.length > 0}
                        title={cab.currentBookings?.length > 0 ? 'Cannot delete cab with active bookings' : 'Delete cab'}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Cab Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCab ? 'Edit Cab' : 'Add New Cab'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Cab Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="pricePerMinute"
            label="Price per Minute ($)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.pricePerMinute}
            onChange={handleChange}
            error={!!errors.pricePerMinute}
            helperText={errors.pricePerMinute}
            inputProps={{
              min: 0,
              step: 0.01,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCab ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CabManagement;
