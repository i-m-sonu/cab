import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const cabService = {
  getAllCabs: () => api.get('/cabs'),
  getCabById: (id) => api.get(`/cabs/${id}`),
  createCab: (cabData) => api.post('/cabs', cabData),
  updateCab: (id, cabData) => api.put(`/cabs/${id}`, cabData),
  deleteCab: (id) => api.delete(`/cabs/${id}`),
  checkAvailability: (cabId, startTime, endTime) => 
    api.post('/cabs/check-availability', { cabId, startTime, endTime }),
};

export const bookingService = {
  getAllBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getBookingByBookingId: (bookingId) => api.get(`/bookings/booking/${bookingId}`),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  calculateRoute: (source, destination) => 
    api.post('/bookings/calculate', { source, destination }),
  getSources: () => api.get('/bookings/locations/sources'),
  getDestinations: (source) => api.get(`/bookings/locations/destinations/${source}`),
  getUserBookings: (email) => api.get(`/bookings/user/${email}`),
};

export const routeService = {
  getAllRoutes: () => api.get('/routes'),
  createRoute: (routeData) => api.post('/routes', routeData),
  updateRoute: (id, routeData) => api.put(`/routes/${id}`, routeData),
  deleteRoute: (id) => api.delete(`/routes/${id}`),
  initializeRoutes: () => api.post('/routes/initialize'),
};

export default api;
