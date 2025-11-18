const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

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
    const { name, email, imageUrl } = req.body;
    const userId = req.params.id;
    
    // Check if user exists and is authorized to update
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized to update this user" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

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

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this user" });
    }

    const user = await User.findById(userId);
    if (!user)  {
      return res.status(404).json({ message: "User not found" });
    } 

    const filesToDelete = [];

    // Delete user image
    if (user.imageUrl) {
      const userImagePath = extractFilePath(user.imageUrl, "userImages");
      if (userImagePath) {
        filesToDelete.push(userImagePath);
      }
    }

    // Delete child images
    const { ChildProfile, getAllChildrenByUser } = require("../models/ChildProfile");
    const children = await getAllChildrenByUser(userId);
    for (const child of children) {
      if (child.imageUrl) {
        const childImagePath = extractFilePath(child.imageUrl, "childImages");
        if (childImagePath) {
          filesToDelete.push(childImagePath);
        }
      }
    }

    // Delete reciepts
    const Expense = require("../models/expense");
    const expenses = await Expense.find({ userId: userId });
    for (const expense of expenses) {
      if (expense.receiptImage) {
        const receiptImagePath = extractFilePath(expense.receiptImage, "receipts");
        if (receiptImagePath) {
          filesToDelete.push(receiptImagePath);
        }
      }
    }

    // Delete CalendarEvent attachments
    const CalendarEvent = require("../models/calendarEvent");
    const calendarEvents = await CalendarEvent.find({ userId: userId });
    for (const calendarEvent of calendarEvents) {
      if (calendarEvent.attachments) {
        for (const attachment of calendarEvent.attachments) {
          const attachmentPath = extractFilePath(attachment, "calendarEventAttachments");
          if (attachmentPath) {
            filesToDelete.push(attachmentPath);
          }
        }
      }
    }

    await ChildProfile.deleteMany({ userId: String(userId) });

    const Budget = require("../models/budget");
    await Budget.deleteMany({ userId: userId });

    await Expense.deleteMany({ userId: userId });

    const CategoryAllocation = require("../models/CategoryAllocation");
    await CategoryAllocation.deleteMany({ userId: userId });

    await CalendarEvent.deleteMany({ userId: userId });

    const SavedArticle = require("../models/SavedArticle");
    await SavedArticle.deleteMany({ userId: userId });


    await User.findByIdAndDelete(userId);
    deleteFiles(filesToDelete);

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// helper function to extract the file path from the image url
function extractFilePath(imageUrl, type) {
  if (!imageUrl) return null;
  try {
    if (imageUrl.startsWith("/static/")) {
      const filename = imageUrl.split("/").pop();
      const uploadsDir = path.join(__dirname, "..", "uploads", type);
      return path.join(uploadsDir, filename);
    }
  
    if (!imageUrl.includes("/") && !imageUrl.includes("\\")) {
      const uploadDir = path.join(__dirname, "..", "uploads", type);
      return path.join(uploadDir, imageUrl);
    }

    if (imageUrl.includes("uploads")){
      const filename = imageUrl.split("/").pop();
      const uploadsDir = path.join(__dirname, "..", "uploads", type);
      return path.join(uploadsDir, filename);
    }

    return null;
  } catch (error) {
    console.error(`Error extracting file path from image url: ${imageUrl}`, error);
    return null;
  }
}

// Multer設定 for user images
const userImagesDir = path.join(__dirname, "..", "uploads", "userImages");
if (!fs.existsSync(userImagesDir)) {
  fs.mkdirSync(userImagesDir, { recursive: true });
}

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userImagesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const uploadUser = multer({
  storage: userStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/users/:id/photo
// Uploads the file but does NOT update the database
// The imageUrl will be saved when PATCH /api/users/:id is called
exports.uploadUserPhoto = async (req, res) => {
  try {
    const userId = req.params.id;

    // 認証チェック
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized to upload photo for this user" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const publicPath = `/static/user-images/${req.file.filename}`;
    
    // Note: We do NOT update the database here
    // The imageUrl will be saved when the user clicks "Save Changes"
    // This allows users to preview the image before saving

    res.status(200).json({ url: publicPath });
  } catch (err) {
    console.error("Error uploading user photo:", err);
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
};

exports.uploadUserPhotoMiddleware = uploadUser.single("image");

// helper function to delete the files in the filePaths array
function deleteFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // delete the file
        console.log(`Deleted file: ${filePath}`);
      } else {
        console.log(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file: ${filePath}`, error);
    }
  }
}