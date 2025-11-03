// backend/models/calendarEvent.js
const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  children: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChildProfile'
    }],
    default: []
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  color: {
    type: String,
    default: '#006F69' // Keep default but don't require
  },

  category: {
    type: String,
    default: 'General'
  },

  startDate: {
    type: Date,
    required: true,
    index: true
  },

  endDate: {
    type: Date
  },

  alert: {
    type: String
  },

  notes: {
    type: String
  },

  url: {
    type: String
  },

  attachments: {
    type: [String],
    default: []
  },

  linkedBudget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    default: null
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

// index on startDate for querying ranges 
CalendarEventSchema.index({ startDate: 1 });

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema, 'CalendarEvents');