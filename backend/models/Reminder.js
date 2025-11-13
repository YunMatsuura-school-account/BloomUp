// models/Reminder.js
// Update your Reminder model with these changes

const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent',
    required: false, // ✅ Changed to false to allow standalone reminders
    default: null
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
    enum: [
      'None',
      '5 minutes before',
      '15 minutes before',
      '1 hour before',
      '1 day before',
      '2 Weeks before',
      '3 Weeks before',
      'At time of event', // Add this if missing
      'Custom'
    ],
    default: 'At time of event' //  Changed default
  },
  customAlert: {
    type: Boolean,
    default: false
  },
  customDays: {
    type: Number,
    default: null
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

// Index for efficient queries
reminderSchema.index({ userId: 1, eventDate: 1 });
reminderSchema.index({ userId: 1, eventId: 1 });
reminderSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);