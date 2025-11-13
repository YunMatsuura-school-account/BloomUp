// backend/models/RestockReminder.js
const mongoose = require('mongoose');

const restockReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  nextRestockDate: {
    type: Date
  },
  alertType: {  
    type: String,
    enum: ['None', 'At time of event', '5 minutes before', '15 minutes before', '1 hour before', '1 day before', '2 Weeks before', '3 Weeks before', 'Custom'],
    default: 'At time of event'
  },
  customDays: {  
    type: Number,
    min: 0.0001,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
restockReminderSchema.index({ userId: 1, productName: 1 }, { unique: true });

module.exports = mongoose.model('RestockReminder', restockReminderSchema);