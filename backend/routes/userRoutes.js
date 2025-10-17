const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const { updateFamilyName } = require("../controllers/userController");

// router.get("/")
router.put("/family-name", verifyToken, updateFamilyName);
module.exports = router;
