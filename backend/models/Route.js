const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  to: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  timeInMinutes: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Compound index for efficient route lookups
RouteSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('Route', RouteSchema);
