// backend/models/calendarEvent.js

const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  children: {
    type: [String], // store child IDs or names 
    default: []
  },

  type: {
    type: String, // For Example. "Birthday", "Doctor appointment", "vaccination required" or a free text title
    required: true,
    trim: true
  },
  color: {
    type: String, // hex code like #006F69
    default: '#006F69'
  },
  category: {
    type: String, // "General category", "Shopping", School Function, etc.
    default: 'General'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  alert: {
    type: String // For Example. "At time of event", "5 minutes before", etc.
  },
  notes: {
    type: String
  },
  url: {
    type: String
  },
  attachments: {
    type: [String], // file paths or URLs to attachments
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

// index on startDate for querying range
CalendarEventSchema.index({ startDate: 1 });

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema, 'CalendarEvents');
