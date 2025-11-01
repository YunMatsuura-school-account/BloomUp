const express = require("express");
const router = express.Router({ mergeParams: true }); // use UserId(parents)
const controller = require("../controllers/childProfileController");
const verifyToken = require("../middleware/authMiddleware");

//+++ /users/:userId/children +++
// get all
router.get("/", controller.getAllChildrenByUser); // get all children for the user

// post
router.post("/", controller.createChildForUser);

// +++ /users/:userId/children/:childId +++
// Upload child photo - this route must be before /:childId to avoid route conflicts
router.post("/:childId/photo", verifyToken, controller.uploadMiddleware, controller.uploadChildPhoto);

// get one user's child
router.get("/:childId", controller.getChildByIdForUser);

// Update one user's child
router.put("/:childId", controller.updateChildForUser);

// delete one user's child
router.delete("/:childId", controller.deleteChildForUser);

module.exports = router;
