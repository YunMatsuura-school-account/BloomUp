// backend/models/calendarEvent.js

// const mongoose = require('mongoose');

// const CalendarEventSchema = new mongoose.Schema({
//   children: {
//     type: [String], // store child IDs or names 
//     default: []
//   },

//   type: {
//     type: String, // For Example. "Birthday", "Doctor appointment", "vaccination required" or a free text title
//     required: true,
//     trim: true
//   },
//   color: {
//     type: String, // hex code like #006F69
//     default: '#006F69'
//   },
//   category: {
//     type: String, // "General category", "Shopping", School Function, etc.
//     default: 'General'
//   },
//   startDate: {
//     type: Date,
//     required: true
//   },
//   endDate: {
//     type: Date
//   },
//   alert: {
//     type: String // For Example. "At time of event", "5 minutes before", etc.
//   },
//   notes: {
//     type: String
//   },
//   url: {
//     type: String
//   },
//   attachments: {
//     type: [String], // file paths or URLs to attachments
//     default: []
//   },


//   linkedBudget: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Budget',
//     default: null
//   },
//   created_at: {
//     type: Date,
//     default: Date.now
//   }
// });

// // index on startDate for querying range
// CalendarEventSchema.index({ startDate: 1 });

// module.exports = mongoose.model('CalendarEvent', CalendarEventSchema, 'CalendarEvents');



// backend/models/calendarEvent.js
const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  // to store child ids 
  children: {
    type: [String],
    default: []
  },

  // the event belongs to which userId 
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
    default: '#006F69'
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
