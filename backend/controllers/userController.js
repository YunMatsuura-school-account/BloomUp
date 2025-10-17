const User = require("../models/User");

exports.updateFamilyName = async (req, res) => {
  try {
    const { familyName } = req.body;
    // if(!familyName) {}
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { familyName } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Family name saved", familyName: updated.familyName });
  } catch (error) {
    console.error("Error updating family name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
