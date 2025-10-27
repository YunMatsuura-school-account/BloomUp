// backend/controllers/calendarController.js
// CRUD operation logic for calendar events.

// const CalendarEvent = require('../models/calendarEvent');

// // Create new event
// exports.createEvent = async (req, res) => {
//   try {
//     const payload = req.body;

//     //convert string dates to Date objects 
//     if (payload.startDate) payload.startDate = new Date(payload.startDate);
//     if (payload.endDate) payload.endDate = new Date(payload.endDate);

//     const event = new CalendarEvent(payload);
//     await event.save();

//     return res.status(201).json({ success: true, event });
//   } catch (err) {
//     console.error('Error creating calendar event:', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // Get events
// exports.getEvents = async (req, res) => {
//   try {
//     const { start, end, child } = req.query;
//     const filter = {};

//     if (start || end) {
//       filter.startDate = {};
//       if (start) filter.startDate.$gte = new Date(start);
//       if (end) filter.startDate.$lte = new Date(end);
//     }

//     if (child) {
//       filter.children = child; // matches if child in array
//     }

//     const events = await CalendarEvent.find(filter).sort({ startDate: 1 }).lean();
//     return res.json({ success: true, events });
//   } catch (err) {
//     console.error('Error fetching calendar events:', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // Update event by id
// exports.updateEvent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const payload = req.body;
//     if (payload.startDate) payload.startDate = new Date(payload.startDate);
//     if (payload.endDate) payload.endDate = new Date(payload.endDate);

//     const event = await CalendarEvent.findByIdAndUpdate(id, payload, { new: true });
//     if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

//     return res.json({ success: true, event });
//   } catch (err) {
//     console.error('Error updating calendar event:', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // Delete event
// exports.deleteEvent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const event = await CalendarEvent.findByIdAndDelete(id);
//     if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

//     return res.json({ success: true, message: 'Deleted' });
//   } catch (err) {
//     console.error('Error deleting calendar event:', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


// backend/controllers/calendarController.js
const CalendarEvent = require('../models/calendarEvent');
const ChildProfile = require('../models/ChildProfile'); 

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const payload = req.body || {};

    // convert string dates to Date objects 
    if (payload.startDate) payload.startDate = new Date(payload.startDate);
    if (payload.endDate) payload.endDate = new Date(payload.endDate);

    // To check event belongs to the logged-in user Id
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });


    if (payload.children == null) payload.children = [];
    if (!Array.isArray(payload.children)) payload.children = [String(payload.children)];

    const event = new CalendarEvent({
      ...payload,
      userId
    });

    await event.save();
    return res.status(201).json({ success: true, event });
  } catch (err) {
    console.error('Error creating calendar event:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get events according to date , userid and their children 
exports.getEvents = async (req, res) => {
  try {
    const { start, end, child } = req.query;
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const filter = { userId };

    // date range filter 
    if (start || end) {

      //match events whose startDate falls within the range
      filter.startDate = {};
      if (start) filter.startDate.$gte = new Date(start);
      if (end) filter.startDate.$lte = new Date(end);
    }

    // child filter: match events where children array contains the given child string
    if (child) {
      filter.children = child;
    }

    const events = await CalendarEvent.find(filter).sort({ startDate: 1 }).lean();
    return res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update event by id
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    if (payload.startDate) payload.startDate = new Date(payload.startDate);
    if (payload.endDate) payload.endDate = new Date(payload.endDate);

    const existing = await CalendarEvent.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found' });

    if (String(existing.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (payload.children != null && !Array.isArray(payload.children)) {
      payload.children = [String(payload.children)];
    }

    const event = await CalendarEvent.findByIdAndUpdate(id, payload, { new: true });
    return res.json({ success: true, event });
  } catch (err) {
    console.error('Error updating calendar event:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (String(event.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await CalendarEvent.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting calendar event:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
