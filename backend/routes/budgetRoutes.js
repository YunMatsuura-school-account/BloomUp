const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Your existing middleware
const budgetController = require('../controllers/budgetController');

// All routes require authentication
router.get('/overview', verifyToken, budgetController.getBudgetOverview);
router.post('/set', verifyToken, budgetController.setBudget);

// IMPORTANT: More specific routes MUST come BEFORE general routes
router.get('/expenses/year/:year', verifyToken, budgetController.getExpensesByYear); // MOVED HERE - BEFORE /expenses
router.get('/expenses/category', verifyToken, budgetController.getExpensesByCategory);
router.get('/expenses', verifyToken, budgetController.getAllExpenses); // NOW AFTER /expenses/year/:year

router.post('/upload-receipt', verifyToken, budgetController.uploadMiddleware, budgetController.uploadReceipt);
router.post("/add-manual", verifyToken, budgetController.addManualExpense);

module.exports = router;