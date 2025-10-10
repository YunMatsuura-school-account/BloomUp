const express = require("express");
const router = express.Router();
const { getBudget, updateBudget } = require("../controllers/budgetController");

// Get all budgets
router.get("/", getBudget);

// Update or add a budget for a month
router.post("/", updateBudget);

module.exports = router;
