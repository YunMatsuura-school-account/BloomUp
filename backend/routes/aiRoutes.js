const express = require("express");
const router = express.Router();
const { getBudgetInsights } = require("../controllers/aiInsightsController");
const auth = require("../middleware/authMiddleware");

router.get("/insights/budget", auth, getBudgetInsights);

module.exports = router;
