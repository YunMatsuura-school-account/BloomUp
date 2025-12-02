const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// POST /api/contact - Send contact form email
router.post("/", contactController.sendContactEmail);

module.exports = router;
