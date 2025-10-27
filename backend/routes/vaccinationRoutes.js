const express = require("express");
const router = express.Router();
const controller = require("../controllers/vaccinationController");

// Get vaccination recommendations for a child
// GET /api/users/:userId/children/:childId/vaccinations/recommendations
router.get(
  "/users/:userId/children/:childId/vaccinations/recommendations",
  controller.getVaccinationRecommendations
);

module.exports = router;
