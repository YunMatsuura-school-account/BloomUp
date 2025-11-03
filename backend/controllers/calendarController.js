const CalendarEvent = require('../models/calendarEvent');
const ChildProfile = require('../models/ChildProfile');

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const payload = req.body || {};
    const userId = req.user && (req.user._id || req.user.id);

    console.log(' Creating event - User ID:', userId);
    console.log(' Received payload:', JSON.stringify(payload, null, 2));

    if (!userId) {
      console.log(' Unauthorized: No user ID found');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Validate required fields
    if (!payload.title || !payload.title.trim()) {
      console.log(' Validation failed: Title is required');
      return res.status(400).json({ success: false, message: 'Event title is required' });
    }

    if (!payload.startDate) {
      console.log(' Validation failed: Start date is required');
      return res.status(400).json({ success: false, message: 'Start date is required' });
    }

    // Set default values for optional fields
    const eventData = {
      title: payload.title.trim(),
      children: Array.isArray(payload.children) ? payload.children : [],
      color: payload.color || '#006F69',
      category: payload.category || 'General',
      startDate: new Date(payload.startDate),
      userId: userId,
      alert: payload.alert || 'At time of event',
      notes: payload.notes || '',
      url: payload.url || '',
      attachments: Array.isArray(payload.attachments) ? payload.attachments : []
    };

    // Add endDate only if provided
    if (payload.endDate) {
      eventData.endDate = new Date(payload.endDate);
    }

    // Validate dates
    if (isNaN(eventData.startDate.getTime())) {
      console.log(' Invalid start date:', payload.startDate);
      return res.status(400).json({ success: false, message: 'Invalid start date' });
    }

    if (eventData.endDate && isNaN(eventData.endDate.getTime())) {
      console.log(' Invalid end date:', payload.endDate);
      return res.status(400).json({ success: false, message: 'Invalid end date' });
    }

    console.log(' Final event data before save:', eventData);

    const event = new CalendarEvent(eventData);
    const savedEvent = await event.save();

    console.log(' Event saved successfully:', savedEvent._id);

    return res.status(201).json({
      success: true,
      event: savedEvent,
      message: 'Event created successfully'
    });

  } catch (err) {
    console.error(' Error creating calendar event:', err);
    console.error(' Error details:', err.message);
    console.error(' Error stack:', err.stack);

    // Check for MongoDB validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && (req.user._id || req.user.id);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log('Fetching event by ID:', id, 'for user:', userId);

    const event = await CalendarEvent.findOne({
      _id: id,
      userId: userId
    });

    if (!event) {
      console.log('Event not found or access denied');
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied'
      });
    }

    console.log('Event found:', event._id);
    return res.json({ success: true, event });

  } catch (err) {
    console.error('Error fetching calendar event by ID:', err);
    console.error('Error details:', err.message);

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Get events according to date, userid and their children 
exports.getEvents = async (req, res) => {
  try {
    const { start, end, child } = req.query;
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const filter = { userId };

    // Date range filter
    if (start || end) {
      filter.$or = [];

      // Events that start within the range
      const startFilter = {};
      if (start) startFilter.startDate = { $gte: new Date(start) };
      if (end) {
        if (startFilter.startDate) {
          startFilter.startDate.$lte = new Date(end);
        } else {
          startFilter.startDate = { $lte: new Date(end) };
        }
      }

      if (Object.keys(startFilter).length > 0) {
        filter.$or.push(startFilter);
      }

      if (start) {
        filter.$or.push({
          $and: [
            { startDate: { $lte: new Date(start) } },
            { endDate: { $gte: new Date(start) } }
          ]
        });
      }
    }

    // Child filter
    if (child && child !== 'All') {
      filter.children = child;
    }

    console.log(' Calendar query filter:', JSON.stringify(filter, null, 2));
    console.log(' Query params:', { start, end, child, userId });

    const events = await CalendarEvent.find(filter).sort({ startDate: 1 }).lean();
    console.log(' Found events:', events.length);

    return res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Update event by id 
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    console.log('=== UPDATE EVENT STARTED ===');
    console.log(' Updating event - ID:', id);
    console.log(' User ID:', req.user._id);
    console.log(' Update payload:', JSON.stringify(payload, null, 2));

    // Find the existing event first
    const existingEvent = await CalendarEvent.findById(id);
    if (!existingEvent) {
      console.log(' Event not found with ID:', id);
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check ownership
    if (String(existingEvent.userId) !== String(req.user._id)) {
      console.log(' Forbidden: User does not own this event');
      return res.status(403).json({ success: false, message: 'Forbidden - You can only update your own events' });
    }

    // Validate REQUIRED fields if they are being updated
    if (payload.title !== undefined && (!payload.title || !payload.title.trim())) {
      return res.status(400).json({ success: false, message: 'Event title is required' });
    }

    // if (payload.category !== undefined && (!payload.category || !payload.category.trim())) {
    //   return res.status(400).json({ success: false, message: 'Category is required' });
    // }

    // if (payload.alert !== undefined && (!payload.alert || !payload.alert.trim())) {
    //   return res.status(400).json({ success: false, message: 'Alert time is required' });
    // }

    if (payload.children !== undefined && (!Array.isArray(payload.children) || payload.children.length === 0)) {
      return res.status(400).json({ success: false, message: 'At least one child must be selected' });
    }

    // Prepare update data - EMPTY STRINGS ARE FINE FOR OPTIONAL FIELDS
    const updateData = {};

    if (payload.title !== undefined) updateData.title = payload.title.trim();
    if (payload.children !== undefined) updateData.children = payload.children;
    if (payload.color !== undefined) updateData.color = payload.color || '#006F69';
    if (payload.category !== undefined) updateData.category = payload.category.trim();
    if (payload.alert !== undefined) updateData.alert = payload.alert.trim() || 'At time of event';
    
    // Optional fields - empty strings are acceptable
 if (payload.notes !== undefined) updateData.notes = payload.notes || '';
    if (payload.url !== undefined) updateData.url = payload.url || '';
    if (payload.attachments !== undefined) {
      updateData.attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
    }

    // Handle dates
    if (payload.startDate) {
      updateData.startDate = new Date(payload.startDate);
      if (isNaN(updateData.startDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid start date' });
      }
    }

    if (payload.endDate !== undefined) {
      if (payload.endDate) {
        updateData.endDate = new Date(payload.endDate);
        if (isNaN(updateData.endDate.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid end date' });
        }
      } else {
        updateData.endDate = null;
      }
    }

    console.log(' Final update data:', updateData);

    // Perform the update
    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true,
        runValidators: true
      }
    );

    console.log(' Event updated successfully:', updatedEvent._id);
    console.log('=== UPDATE EVENT COMPLETED ===');

    return res.json({ 
      success: true, 
      event: updatedEvent,
      message: 'Event updated successfully'
    });

  } catch (err) {
    console.error('❌ Error updating calendar event:', err);
    console.error('❌ Error details:', err.message);
    console.error('❌ Error stack:', err.stack);

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Server error during update',
      error: err.message 
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting event - ID:', id);
    console.log('User ID:', req.user._id);

    const event = await CalendarEvent.findById(id);
    if (!event) {
      console.log('Event not found for deletion');
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (String(event.userId) !== String(req.user._id)) {
      console.log('Forbidden: User does not own this event for deletion');
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await CalendarEvent.findByIdAndDelete(id);
    console.log('Event deleted successfully');

    return res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting calendar event:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during deletion',
      error: err.message
    });
  }
};