const mongoose = require('mongoose');

const CabSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  pricePerMinute: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentBookings: [{
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    startTime: Date,
    endTime: Date
  }]
}, {
  timestamps: true
});

// Method to check if cab is available during a time period
CabSchema.methods.isAvailable = function(startTime, endTime) {
  return !this.currentBookings.some(booking => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    const requestStart = new Date(startTime);
    const requestEnd = new Date(endTime);
    
    // Check for overlap
    return (requestStart < bookingEnd && requestEnd > bookingStart);
  });
};

module.exports = mongoose.model('Cab', CabSchema);
