const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const budgetController = require('../controllers/budgetController');

// All routes require authentication
router.get('/overview', verifyToken, budgetController.getBudgetOverview);
router.post('/set', verifyToken, budgetController.setBudget);

// IMPORTANT: More specific routes MUST come BEFORE general routes
router.get('/expenses/year/:year', verifyToken, budgetController.getExpensesByYear);
router.get('/expenses/category', verifyToken, budgetController.getExpensesByCategory);
router.get('/expenses', verifyToken, budgetController.getAllExpenses);
router.put('/expenses/:expenseId', verifyToken, budgetController.updateExpense);
router.delete('/expenses/:expenseId', verifyToken, budgetController.deleteExpense);

// Receipt & Manual Entry
router.post('/upload-receipt', verifyToken, budgetController.uploadMiddleware, budgetController.uploadReceipt);
router.post("/add-manual", verifyToken, budgetController.addManualExpense);

// Analytics & Insights
router.get("/monthly-spending", verifyToken, budgetController.getMonthlySpending); 
router.get("/weekly-spending", verifyToken, budgetController.getWeeklySpending);
router.get("/budgets/historical", verifyToken, budgetController.getHistoricalBudgets);
router.get("/ai-insights", verifyToken, budgetController.getAIInsights);

// Restock
router.get("/restock-items", verifyToken, budgetController.getRestockItems);
router.post("/restock/toggle", verifyToken, budgetController.toggleRestockReminder);

module.exports = router;