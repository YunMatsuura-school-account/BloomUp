const childModel = require("../models/ChildProfile");

// Get All
async function getAllChildren(req, res) {
  try {
    const profiles = await childModel.getAllChildren();
    res.status(200).json(profiles);
  } catch (err) {
    console.error("Error fetching child profiles:", err);
    res.status(500).json({ message: "Failed to fetch child profiles" });
  }
}

// /api/child/:id
async function getChildById(req, res) {
  try {
    const id = req.params.id;
    const profile = await childModel.getChildById(id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
}

// POST /api/child
async function createChild(req, res) {
  try {
    const data = req.body;
    const insertedId = await childModel.createChild(data);
    res.status(201).json({
      message: "Child profile created successfully",
      id: insertedId,
    });
  } catch (err) {
    console.error("Error creating child profile:", err);
    res.status(500).json({ message: "Failed to create profile" });
  }
}

// PUT /api/child/:id
async function updateChild(req, res) {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    await childModel.updateChild(id, updatedData);
    res.status(200).json({ message: "Child profile updated successfully" });
  } catch (err) {
    console.error("Error updating child profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
}

// DELETE /api/child/:id
async function deleteChild(req, res) {
  try {
    const id = req.params.id;
    await childModel.deleteChild(id);
    res.status(200).json({ message: "Child profile deleted successfully" });
  } catch (err) {
    console.error("Error deleting child profile:", err);
    res.status(500).json({ message: "Failed to delete profile" });
  }
}

module.exports = {
  getAllChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild,
};
