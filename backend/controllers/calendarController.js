// backend/controllers/calendarController.js
// CRUD operation logic for calendar events.

const CalendarEvent = require('../models/calendarEvent');

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const payload = req.body;

    //convert string dates to Date objects 
    if (payload.startDate) payload.startDate = new Date(payload.startDate);
    if (payload.endDate) payload.endDate = new Date(payload.endDate);

    const event = new CalendarEvent(payload);
    await event.save();

    return res.status(201).json({ success: true, event });
  } catch (err) {
    console.error('Error creating calendar event:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get events
exports.getEvents = async (req, res) => {
  try {
    const { start, end, child } = req.query;
    const filter = {};

    if (start || end) {
      filter.startDate = {};
      if (start) filter.startDate.$gte = new Date(start);
      if (end) filter.startDate.$lte = new Date(end);
    }

    if (child) {
      filter.children = child; // matches if child in array
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
    const payload = req.body;
    if (payload.startDate) payload.startDate = new Date(payload.startDate);
    if (payload.endDate) payload.endDate = new Date(payload.endDate);

    const event = await CalendarEvent.findByIdAndUpdate(id, payload, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

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
    const event = await CalendarEvent.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting calendar event:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
