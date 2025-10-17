const express = require("express");
const router = express.Router();
// const { login } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const {
  signup,
  login,
  getCurrentUser,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/signup", signup);

// To Validate User Data and we will use this route in the Frontend to validate the user data before signing up or logging in.
router.get("/me", verifyToken, getCurrentUser);

// Protected route for testing
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

module.exports = router;
