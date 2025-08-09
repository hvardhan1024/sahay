const mongoose = require('mongoose');

const helperSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: [{
    type: String,
    enum: ['anxiety', 'depression', 'academic-stress', 'social-anxiety', 'general-support']
  }],
  experience: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Helper', helperSchema);