// backend/routes/calendarRoutes.js
// backend/routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const calendarCtrl = require('../controllers/calendarController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create
router.post('/', calendarCtrl.createEvent);

// Read (all or filtered by query)
router.get('/', calendarCtrl.getEvents);

// Get single event by ID - THIS MUST COME BEFORE OTHER DYNAMIC ROUTES
router.get('/:id', calendarCtrl.getEventById);

// Update
router.put('/:id', calendarCtrl.updateEvent);

// Delete
router.delete('/:id', calendarCtrl.deleteEvent);

// Debug route
router.get('/debug/status', async (req, res) => {
    try {
        const Category = require('../models/Category');
        const categoryCount = await Category.countDocuments();

        return res.json({
            success: true,
            categories: {
                exists: true,
                count: categoryCount
            },
            user: {
                id: req.user.id,
                name: req.user.name
            }
        });
    } catch (err) {
        console.error('Debug status error:', err);
        return res.status(500).json({
            success: false,
            message: 'Debug failed',
            error: err.message
        });
    }
});

module.exports = router;

