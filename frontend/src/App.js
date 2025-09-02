import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { AppThemeProvider } from './theme/ThemeProvider';
import Header from './components/Header';
import ModernDashboard from './components/ModernDashboard';
import ModernBookingForm from './components/ModernBookingForm';
import BookingTracker from './components/BookingTracker';
import CancelBooking from './components/CancelBooking';
import CabManagement from './components/CabManagement';
import RouteManagement from './components/RouteManagement';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AppThemeProvider>
      <div className="App">
        <Header />
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: { xs: 1, sm: 2 }, 
            px: { xs: 1, sm: 2, md: 3 },
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Routes>
            <Route path="/" element={<ModernDashboard />} />
            <Route path="/book" element={<ModernBookingForm />} />
            <Route path="/track" element={<BookingTracker />} />
            <Route path="/cancel" element={<CancelBooking />} />
            <Route path="/cabs" element={<CabManagement />} />
            <Route path="/routes" element={<RouteManagement />} />
          </Routes>
        </Container>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </AppThemeProvider>
  );
}

export default App;
