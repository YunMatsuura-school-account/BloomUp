const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const { updateFamilyName, updateUser } = require("../controllers/userController");

const User = require("../models/User");

// router.get("/")
router.put("/family-name", verifyToken, updateFamilyName);
router.patch("/:id", verifyToken, updateUser);



// Get current user profile
router.get("/current", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('children');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      familyName: user.familyName,
      country: user.country,
      state: user.state,
      children: user.children || [],
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;


