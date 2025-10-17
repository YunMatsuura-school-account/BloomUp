const childModel = require("../models/ChildProfile");
const User = require("../models/User");

// Get All
async function getAllChildrenByUser(req, res) {
  try {
    const { userId } = req.params;
    const profiles = await childModel.getAllChildrenByUser(userId);
    res.status(200).json(profiles);
  } catch (err) {
    console.error("Error fetching child profiles:", err);
    res.status(500).json({ message: "Failed to fetch child profiles" });
  }
}

// /api/users/:userId/children/:childId
async function getChildByIdForUser(req, res) {
  try {
    const { userId, childId } = req.params;
    const profile = await childModel.getChildByIdForUser(userId, childId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
}

// POST /api/users/:userId/children/:childId
async function createChildForUser(req, res) {
  try {
    const { userId } = req.params;
    const data = { ...req.body, userId };

    //validation
    if (!data.name || !data.dateOfBirth) {
      return res.status(400).json({
        error: "Name and Date of Birth are required",
      });
    }

    const insertedId = await childModel.createChildForUser(userId, data);

    // Link child to user
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { children: insertedId } },
      { new: true }
    );

    res.status(201).json({
      message: "Child profile created successfully",
      id: insertedId,
    });
  } catch (err) {
    console.error("Error creating child profile:", err);
    res.status(500).json({ message: "Failed to create profile" });
  }
}

// PUT /api/users/:userId/children/:childId
async function updateChildForUser(req, res) {
  try {
    const { userId, childId } = req.params;
    const updatedData = { ...req.body, userId };
    const found = await childModel.updateChildForUser(
      userId,
      childId,
      updatedData
    );

    if (!found) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Child profile updated successfully" });
  } catch (err) {
    console.error("Error updating child profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
}

// DELETE /api/users/:userId/children/:childId
async function deleteChildForUser(req, res) {
  try {
    const { userId, childId } = req.params;
    const found = await childModel.deleteChildForUser(userId, childId);
    if (!found) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Unlink child from user
    await User.findByIdAndUpdate(
      userId,
      { $pull: { children: childId } },
      { new: true }
    );

    res.status(200).json({ message: "Child profile deleted successfully" });
  } catch (err) {
    console.error("Error deleting child profile:", err);
    res.status(500).json({ message: "Failed to delete profile" });
  }
}

module.exports = {
  getAllChildrenByUser,
  getChildByIdForUser,
  createChildForUser,
  updateChildForUser,
  deleteChildForUser,
};
