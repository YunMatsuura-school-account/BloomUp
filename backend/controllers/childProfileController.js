const childModel = require("../models/ChildProfile");
const User = require("../models/User");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const childImagesDir = path.join(__dirname, "..", "uploads", "childImages");
if (!fs.existsSync(childImagesDir)) fs.mkdirSync(childImagesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, childImagesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

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

// POST /api/users/:userId/children/:childId/photo
async function uploadChildPhoto(req, res) {
  try {
    const { userId, childId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const publicPath = `/static/child-images/${req.file.filename}`;
    
    // ChildProfileのimageUrlを更新
    const updated = await childModel.updateChildForUser(
      userId,
      childId,
      { imageUrl: publicPath }
    );

    if (!updated) {
      // ファイルはアップロード済みだが、更新に失敗した場合は削除
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Error deleting uploaded file:", unlinkErr);
      }
      return res.status(404).json({ message: "Child profile not found" });
    }

    res.status(200).json({ url: publicPath });
  } catch (err) {
    console.error("Error uploading child photo:", err);
    // エラー時はアップロードされたファイルを削除
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Error deleting uploaded file:", unlinkErr);
      }
    }
    res.status(500).json({ message: "Failed to upload photo" });
  }
}

module.exports = {
  getAllChildrenByUser,
  getChildByIdForUser,
  createChildForUser,
  updateChildForUser,
  deleteChildForUser,
  uploadChildPhoto,
  uploadMiddleware: upload.single("image"),
};
