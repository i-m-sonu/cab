# Cab Booking System

A comprehensive full-stack web application for cab booking system with shortest path calculation, real-time booking management, and email notifications.

## 🚀 Features

### Core Functionality
- **Cab Booking**: Users can book cabs by providing email, source, and destination
- **Shortest Path Calculation**: Utilizes Dijkstra's algorithm to find the optimal route
- **Dynamic Pricing**: Different cabs with varying price per minute
- **Booking Tracking**: Real-time tracking of booking status
- **Email Notifications**: Automatic email confirmation and updates
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Cab Management**: Add, edit, delete, and manage cab availability
- **Route Management**: Configure routes and travel times between locations
- **Booking Overview**: View all bookings with status management
- **Dashboard**: Analytics and quick actions

### System Features
- **Overlap Prevention**: No cab can have overlapping bookings
- **Real-time Availability**: Check cab availability for specific time slots
- **Cost Estimation**: Automatic calculation based on route time and cab pricing
- **Data Validation**: Comprehensive input validation and error handling

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API**: Clean API design with proper HTTP methods
- **MongoDB Database**: Efficient data storage with Mongoose ODM
- **Email Service**: Nodemailer integration for notifications
- **Rate Limiting**: API protection against abuse
- **Error Handling**: Comprehensive error management

### Frontend (React)
- **Single Page Application**: React with React Router
- **Material-UI Components**: Modern and responsive UI
- **State Management**: React hooks for efficient state handling
- **API Integration**: Axios for HTTP requests
- **Toast Notifications**: User-friendly feedback system

## 📁 Project Structure

```
cab-booking-system/
├── backend/
│   ├── models/
│   │   ├── Cab.js          # Cab schema and methods
│   │   ├── Booking.js      # Booking schema
│   │   └── Route.js        # Route schema
│   ├── routes/
│   │   ├── cabs.js         # Cab management endpoints
│   │   ├── bookings.js     # Booking endpoints
│   │   └── routes.js       # Route management endpoints
│   ├── utils/
│   │   ├── shortestPath.js # Dijkstra's algorithm implementation
│   │   └── emailService.js # Email notification service
│   ├── server.js           # Express server setup
│   ├── package.json
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service functions
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── public/
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cab-booking
   PORT=5000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   NODE_ENV=development
   ```

4. **Start MongoDB:**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using MongoDB Community Edition
   brew services start mongodb/brew/mongodb-community
   ```

5. **Initialize Database:**
   The system will automatically create the database and collections. You can initialize sample routes using the API:
   ```bash
   curl -X POST http://localhost:5000/api/routes/initialize
   ```

6. **Start Backend Server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Database Schema

### Cabs Collection
```javascript
{
  name: String,              // Cab name/identifier
  pricePerMinute: Number,    // Pricing per minute
  isActive: Boolean,         // Availability status
  currentBookings: [{        // Active bookings
    bookingId: ObjectId,
    startTime: Date,
    endTime: Date
  }]
}
```

### Bookings Collection
```javascript
{
  bookingId: String,         // Unique booking identifier
  userEmail: String,         // User's email address
  source: String,            // Starting location
  destination: String,       // End location
  cabId: ObjectId,          // Reference to cab
  route: [String],          // Full path array
  totalTime: Number,        // Total travel time
  estimatedCost: Number,    // Calculated cost
  startTime: Date,          // Booking start time
  endTime: Date,            // Expected end time
  status: String,           // confirmed|in-progress|completed|cancelled
  emailSent: Boolean        // Email notification status
}
```

### Routes Collection
```javascript
{
  from: String,             // Source location
  to: String,               // Destination location
  timeInMinutes: Number     // Travel time between locations
}
```

## 🛣️ API Endpoints

### Cab Management
- `GET /api/cabs` - Get all active cabs
- `POST /api/cabs` - Create new cab
- `PUT /api/cabs/:id` - Update cab
- `DELETE /api/cabs/:id` - Delete cab
- `POST /api/cabs/check-availability` - Check availability

### Booking Management
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/booking/:bookingId` - Get booking by ID
- `PATCH /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/calculate` - Calculate route and pricing
- `GET /api/bookings/locations/sources` - Get source locations
- `GET /api/bookings/user/:email` - Get user bookings

### Route Management
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route
- `POST /api/routes/initialize` - Initialize default routes

## 🔧 Configuration

### Email Configuration
For email notifications, configure your Gmail credentials:

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Update `.env` file with your credentials

### Default Route Data
The system includes sample routes between locations A, B, C, D, E, F:
- A ↔ B: 5 minutes
- A ↔ C: 10 minutes
- B ↔ C: 8 minutes
- C ↔ D: 7 minutes
- D ↔ E: 12 minutes
- D ↔ F: 20 minutes
- E ↔ F: 15 minutes
- Additional direct routes for optimization

## 🚦 Usage Guide

### For Users

1. **Book a Cab:**
   - Navigate to "Book Cab"
   - Enter email, select source and destination
   - Choose start time
   - Select preferred cab from available options
   - Confirm booking

2. **Track Booking:**
   - Use "Track Booking" page
   - Search by booking ID or email address
   - View real-time status updates

### For Administrators

1. **Manage Cabs:**
   - Add new cabs with pricing
   - Edit existing cab details
   - Activate/deactivate cabs
   - View booking statistics

2. **Manage Routes:**
   - Add new routes between locations
   - Modify travel times
   - Initialize default route network

## 🧪 Testing

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Create a booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "user@example.com",
    "source": "A",
    "destination": "D",
    "cabId": "cab_id_here",
    "startTime": "2024-12-01T14:00:00Z"
  }'
```

### Frontend Testing
- Navigate through all pages
- Test booking flow end-to-end
- Verify responsive design on mobile
- Test error handling scenarios

## 📈 Performance Optimization

### Backend Optimizations
- Database indexing on frequently queried fields
- Connection pooling for MongoDB
- Request rate limiting
- Efficient shortest path algorithm

### Frontend Optimizations
- Component lazy loading
- API response caching
- Optimized re-renders with React hooks
- Responsive images and assets

## 🔐 Security Features

- Input validation and sanitization
- SQL injection prevention (NoSQL)
- Rate limiting on API endpoints
- Environment variable protection
- CORS configuration
- Error message sanitization

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Configure MongoDB Atlas or cloud database
3. Deploy using git or CI/CD pipeline

### Frontend Deployment (Netlify/Vercel)
1. Build production version: `npm run build`
2. Deploy dist/build folder
3. Configure API base URL for production

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_password
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review API endpoints and examples

## 🎯 Future Enhancements

- Real-time GPS tracking
- Payment gateway integration
- Driver mobile app
- Advanced analytics dashboard
- Multi-language support
- Push notifications
- Route optimization algorithms
- Peak hour pricing

---

**Made with ❤️ for efficient cab booking management**
