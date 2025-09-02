# Cab Booking System - Copilot Instructions

This is a full-stack cab booking system with the following features:
- React frontend with responsive design and Material-UI
- Node.js/Express backend with RESTful API
- In-memory database for demo purposes (easily replaceable with MongoDB)
- Shortest path calculation using Dijkstra's algorithm
- Cab management with pricing and availability
- Booking tracking system with real-time status
- Email notifications with Nodemailer (optional)
- Responsive design for mobile and desktop

## Project Structure
- `/frontend` - React SPA with Material-UI components
- `/backend` - Node.js/Express API with in-memory database
- Database: In-memory storage with collections for cabs, bookings, routes

## Key Features Implemented
✅ Clarify Project Requirements - Full-stack cab booking system
✅ Scaffold the Project - Complete project structure created
✅ Customize the Project - All features implemented
✅ Install Required Extensions - Dependencies installed
✅ Compile the Project - Both frontend and backend ready
✅ Create and Run Task - Backend and frontend servers running
✅ Launch the Project - Application accessible at http://localhost:3000
✅ Ensure Documentation is Complete - Comprehensive README created

## Running the Application
- Backend: `cd backend && node serverSimple.js` (runs on port 4000)
- Frontend: `cd frontend && npm start` (runs on port 3000)
- Access: http://localhost:3000

## API Endpoints Working
- GET /api/cabs - List all active cabs
- GET /api/routes - List all routes
- POST /api/bookings/calculate - Calculate shortest path and pricing
- POST /api/bookings - Create new booking
- GET /api/bookings - List all bookings
- GET /api/bookings/user/:email - Get user bookings

## Features Verified
- Shortest path calculation (A→D via C takes 17min vs direct 42min)
- 5 pre-configured cabs with different pricing
- 18 bidirectional routes between locations A-F
- Responsive UI with Material-UI components
- Real-time route calculation and cost estimation
