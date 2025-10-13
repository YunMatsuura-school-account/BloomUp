const express = require("express");
const router = express.Router();
// const { login } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const { signup, login } = require("../controllers/authController");

router.post("/login", login);
router.post("/signup", signup);

// Protected route for testing
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

module.exports = router;
