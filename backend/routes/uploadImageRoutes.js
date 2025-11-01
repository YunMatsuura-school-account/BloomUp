const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const verifyToken = require("../middleware/authMiddleware");

// Ensure upload directories exist
const userImagesDir = path.join(__dirname, "..", "uploads", "userImages");
const childImagesDir = path.join(__dirname, "..", "uploads", "childImages");
if (!fs.existsSync(userImagesDir)) fs.mkdirSync(userImagesDir, { recursive: true });
if (!fs.existsSync(childImagesDir)) fs.mkdirSync(childImagesDir, { recursive: true });

function makeStorage(dest) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
      cb(null, name);
    },
  });
}

const uploadUser = multer({
  storage: makeStorage(userImagesDir),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadChild = multer({
  storage: makeStorage(childImagesDir),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload user profile image
router.post(
  "/upload/user-image",
  verifyToken,
  uploadUser.single("image"),
  (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const publicPath = `/static/user-images/${req.file.filename}`;
      return res.json({ message: "Uploaded", path: publicPath });
    } catch (err) {
      console.error("Error uploading user image:", err);
      return res.status(500).json({ message: "Upload failed" });
    }
  }
);

// Upload child image
router.post(
  "/upload/child-image",
  verifyToken,
  uploadChild.single("image"),
  (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const publicPath = `/static/child-images/${req.file.filename}`;
      return res.json({ message: "Uploaded", path: publicPath });
    } catch (err) {
      console.error("Error uploading child image:", err);
      return res.status(500).json({ message: "Upload failed" });
    }
  }
);

module.exports = router;