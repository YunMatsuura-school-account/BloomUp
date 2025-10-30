const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer"); //Library to upload images. convert multipart/form-data
const router = express.Router({ mergeParams: true });

//create directly only when there is no directry to upload
function makeDirIfNotExists(dir) {
  fs.mkdirSync(dir, { recursive: true }); //create /uploads directly as well if necessary
}

// mime type: jpeg, png, webp,...
function isImage(mime) {
  return /^image\/(png|jpe?g|webp|gif)$/.test(mime);
}

// fieldname, originalname, encoding, mimetype, destination, filename, path, size
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const base = path.join(__dirname, "..", "uploads");
    let dir = path.join(base, "userImages");
    if (req.params.childId) {
      dir = path.join(base, "childImages");
    }
    makeDirIfNotExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uid = req.params.userId || "u";
    const cid = req.params.childId ? `-${req.params.childId}` : "";
    const name = `${uid}${cid}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 1 Mib = 1 * 1024 * 1024
  fileFilter: (req, file, cb) => {
    if (!isImage(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }, //cb: callback. cb(error, result)
});

// user /api/:userId/photo
router.post(
  "/users/:userId/photo",
  upload.single("image"),
  async (req, res) => {
    const publicUrl = `/static/user-images/${req.file.filename}`;
    return res.status(201).json({ url: publicUrl });
  }
);

// /api/users/:userId/children/:childId/photo
router.post(
  "/users/:userId/children/:childId/photo",
  upload.single("image"),
  async (req, res) => {
    const publicUrl = `/static/child-images/${req.file.filename}`;

    const ChildProfile = require("../models/ChildProfile");
    await ChildProfile.updateChildForUser(
      req.params.userId,
      req.params.childId,
      { imageUrl: publicUrl }
    );

    return res.status(201).json({ url: publicUrl });
  }
);

router.use((err, req, res, _next) => {
  if (err) {
    return res.status(400).json({
      message: err.message || "Upload image error",
    });
  }
  res.status(500).json({ message: "Unexpected error" });
});

module.exports = router;
