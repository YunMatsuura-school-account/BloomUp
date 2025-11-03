// backend/controllers/reminderController.js
const Reminder = require('../models/Reminder');
const CalendarEvent = require('../models/calendarEvent');

// Create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { eventId, eventTitle, eventDate, alert, customAlert, customDays } = req.body;

    console.log('📥 Creating/updating reminder for user:', userId);
    console.log('📦 Reminder data:', { eventId, eventTitle, eventDate, alert, customAlert, customDays });

    // Validate required fields
    if (!eventId || !eventTitle || !eventDate || !alert) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        received: { eventId, eventTitle, eventDate, alert }
      });
    }

    // Validate custom alert - allow very small values for minutes/hours
    if (customAlert && (customDays === null || customDays === undefined || customDays < 0.00001)) {
      console.error('❌ Invalid custom days:', customDays);
      return res.status(400).json({ 
        success: false, 
        message: 'Custom days must be provided and greater than 0.00001 (minimum ~1 second)'
      });
    }

    // Check if reminder already exists for this event and user
    const existingReminder = await Reminder.findOne({ userId, eventId });
    
    if (existingReminder) {
      console.log('🔄 Updating existing reminder:', existingReminder._id);
      
      // Update existing reminder
      existingReminder.eventTitle = eventTitle;
      existingReminder.eventDate = new Date(eventDate);
      existingReminder.alert = alert;
      existingReminder.customAlert = customAlert || false;
      existingReminder.customDays = customDays;
      existingReminder.isRead = false; // Mark as unread since it's updated
      existingReminder.isSent = false;
      await existingReminder.save();
      
      console.log('✅ Reminder updated successfully');
      return res.status(200).json({ 
        success: true, 
        reminder: existingReminder,
        message: 'Reminder updated successfully' 
      });
    }

    // Create new reminder
    console.log('➕ Creating new reminder');
    const reminder = new Reminder({
      userId,
      eventId,
      eventTitle,
      eventDate: new Date(eventDate),
      alert,
      customAlert: customAlert || false,
      customDays: customDays || null
    });

    await reminder.save();
    console.log('✅ Reminder created successfully:', reminder._id);

    return res.status(201).json({ 
      success: true, 
      reminder,
      message: 'Reminder created successfully' 
    });
  } catch (err) {
    console.error('❌ Error creating reminder:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get all reminders for the authenticated user
exports.getReminders = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    console.log('📋 Fetching reminders for user:', userId);

    const { unreadOnly } = req.query;

    const filter = { userId };

    // Filter for unread only if requested
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    // DON'T filter by eventDate here - let frontend handle filtering
    // This way frontend can decide what to show based on event date vs trigger time

    const reminders = await Reminder.find(filter)
      .sort({ eventDate: 1 })
      .lean();

    console.log('✅ Found', reminders.length, 'reminders');
    console.log('📊 Reminders:', reminders.map(r => ({
      id: r._id,
      title: r.eventTitle,
      eventDate: r.eventDate,
      alert: r.alert,
      customAlert: r.customAlert,
      customDays: r.customDays
    })));

    return res.json({ 
      success: true, 
      reminders,
      count: reminders.length 
    });
  } catch (err) {
    console.error('❌ Error fetching reminders:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

// Get a specific reminder by ID
exports.getReminderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && (req.user._id || req.user.id);

    const reminder = await Reminder.findById(id);
    
    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    // Check if reminder belongs to the user
    if (String(reminder.userId) !== String(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden' 
      });
    }

    return res.json({ 
      success: true, 
      reminder 
    });
  } catch (err) {
    console.error('Error fetching reminder:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update a reminder
exports.updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && (req.user._id || req.user.id);
    const updates = req.body;

    const reminder = await Reminder.findById(id);
    
    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    // Check if reminder belongs to the user
    if (String(reminder.userId) !== String(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden' 
      });
    }

    // Update allowed fields
    const allowedUpdates = ['alert', 'customAlert', 'customDays', 'isRead', 'isSent', 'eventTitle', 'eventDate'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        reminder[field] = updates[field];
      }
    });

    await reminder.save();

    return res.json({ 
      success: true, 
      reminder,
      message: 'Reminder updated successfully' 
    });
  } catch (err) {
    console.error('Error updating reminder:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Delete a reminder
exports.deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && (req.user._id || req.user.id);

    const reminder = await Reminder.findById(id);
    
    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    // Check if reminder belongs to the user
    if (String(reminder.userId) !== String(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden' 
      });
    }

    await Reminder.findByIdAndDelete(id);

    return res.json({ 
      success: true, 
      message: 'Reminder deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting reminder:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Mark all reminders as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const result = await Reminder.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    console.log('✅ Marked', result.modifiedCount, 'reminders as read');

    return res.json({ 
      success: true, 
      message: 'All reminders marked as read',
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error('Error marking reminders as read:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get reminders count (for notification badge)
exports.getRemindersCount = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Count unread reminders where event hasn't passed yet
    const now = new Date();
    const unreadCount = await Reminder.countDocuments({ 
      userId, 
      isRead: false,
      eventDate: { $gte: now } // Only count if event is in the future
    });

    // Count all upcoming reminders
    const upcomingCount = await Reminder.countDocuments({ 
      userId, 
      eventDate: { $gte: now } 
    });

    console.log('📊 Reminder counts - Unread:', unreadCount, 'Upcoming:', upcomingCount);

    return res.json({ 
      success: true, 
      unreadCount,
      upcomingCount 
    });
  } catch (err) {
    console.error('Error getting reminders count:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update reminders when event is updated
exports.updateRemindersForEvent = async (eventId, eventData) => {
  try {
    console.log('🔄 Updating reminders for event:', eventId);
    
    // Find all reminders for this event
    const reminders = await Reminder.find({ eventId });
    
    if (reminders.length === 0) {
      console.log('ℹ️ No reminders found for event', eventId);
      return;
    }

    // Update each reminder with new event data
    await Promise.all(reminders.map(async (reminder) => {
      reminder.eventTitle = eventData.title;
      reminder.eventDate = new Date(eventData.startDate);
      reminder.isRead = false; // Mark as unread since event changed
      reminder.isSent = false; // Reset sent status
      await reminder.save();
    }));

    console.log(`✅ Updated ${reminders.length} reminders for event ${eventId}`);
  } catch (err) {
    console.error('❌ Error updating reminders for event:', err);
  }
};

// Delete reminders when event is deleted
exports.deleteRemindersForEvent = async (eventId) => {
  try {
    const result = await Reminder.deleteMany({ eventId });
    console.log(`✅ Deleted ${result.deletedCount} reminders for event ${eventId}`);
  } catch (err) {
    console.error('❌ Error deleting reminders for event:', err);
  }
};