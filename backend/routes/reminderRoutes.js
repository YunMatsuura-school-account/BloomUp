// backend/routes/reminderRoutes.js
const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

// Import auth middleware - adjust path based on your project structure
// Common locations: '../middleware/auth', '../middlewares/auth', '../middleware/authMiddleware'
let authMiddleware;
try {
  authMiddleware = require('../middleware/auth');
} catch (e) {
  try {
    authMiddleware = require('../middlewares/auth');
  } catch (e2) {
    try {
      authMiddleware = require('../middleware/authMiddleware');
    } catch (e3) {
      try {
        authMiddleware = require('../middlewares/authMiddleware');
      } catch (e4) {
        console.error('❌ Could not find auth middleware. Please check the path.');
        console.error('   Update line 7 in routes/reminderRoutes.js with the correct path to your auth middleware');
        throw new Error('Auth middleware not found');
      }
    }
  }
}

// All routes require authentication
router.use(authMiddleware);

// Create a new reminder
router.post('/', reminderController.createReminder);

// Get all reminders for the authenticated user
router.get('/', reminderController.getReminders);

// Get reminders count (for notification badge)
router.get('/count', reminderController.getRemindersCount);

// Get a specific reminder by ID
router.get('/:id', reminderController.getReminderById);

// Update a reminder
router.put('/:id', reminderController.updateReminder);

// Delete a reminder
router.delete('/:id', reminderController.deleteReminder);

// Mark all reminders as read
router.post('/mark-all-read', reminderController.markAllAsRead);

module.exports = router;