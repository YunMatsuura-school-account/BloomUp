// backend/models/Reminder.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent',
    required: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  alert: {
    type: String,
    enum: ['None', '1 day before', '2 Weeks before', '3 Weeks before', 'Custom'],
    default: 'None'
  },
  customAlert: {
    type: Boolean,
    default: false
  },
  customDays: {
    type: Number,
    min: 0.0001, // Changed from min: 1 to allow fractional days (minutes/hours)
    validate: {
      validator: function(value) {
        // Only validate if customAlert is true
        if (this.customAlert && value !== null && value !== undefined) {
          return value >= 0.0001; // Allow values as small as 0.0001 days (~8.6 seconds)
        }
        return true;
      },
      message: 'Custom days must be at least 0.0001 (about 8 seconds)'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
reminderSchema.index({ userId: 1, eventDate: 1 });
reminderSchema.index({ userId: 1, isRead: 1 });
reminderSchema.index({ userId: 1, eventId: 1 }); // For finding reminders by event

module.exports = mongoose.model('Reminder', reminderSchema);