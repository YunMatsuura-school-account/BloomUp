const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Your existing middleware
const budgetController = require('../controllers/budgetController');

// All routes require authentication
router.get('/overview', verifyToken, budgetController.getBudgetOverview);
router.post('/set', verifyToken, budgetController.setBudget);
router.get('/expenses/category', verifyToken, budgetController.getExpensesByCategory);
router.get('/expenses', verifyToken, budgetController.getAllExpenses);
router.post(
  '/upload-receipt', 
  verifyToken, 
  budgetController.uploadMiddleware, 
  budgetController.uploadReceipt
);

module.exports = router;