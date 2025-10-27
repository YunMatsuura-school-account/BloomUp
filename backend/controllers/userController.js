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

exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.id;
    
    // Check if user exists and is authorized to update
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized to update this user" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ message: "User not found" });
    
    res.json({
      message: "User updated successfully",
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        imageUrl: updated.imageUrl
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
