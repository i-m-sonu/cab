import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from './components/Header';
import BookingForm from './components/BookingForm';
import BookingTracker from './components/BookingTracker';
import CabManagement from './components/CabManagement';
import RouteManagement from './components/RouteManagement';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/book" element={<BookingForm />} />
          <Route path="/track" element={<BookingTracker />} />
          <Route path="/cabs" element={<CabManagement />} />
          <Route path="/routes" element={<RouteManagement />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
