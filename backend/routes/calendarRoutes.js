// backend/routes/calendarRoutes.js

const express = require('express');
const router = express.Router();
const calendarCtrl = require('../controllers/calendarController');

const authMiddleware = require('../middleware/authMiddleware');

// Create
router.post('/', authMiddleware, calendarCtrl.createEvent);

// Read (all or filtered by query)
router.get('/', authMiddleware, calendarCtrl.getEvents);

// Update
router.put('/:id', authMiddleware, calendarCtrl.updateEvent);

// Delete
router.delete('/:id', authMiddleware, calendarCtrl.deleteEvent);

module.exports = router;

