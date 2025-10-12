const express = require("express");
const router = express.Router({ mergeParams: true }); // use UserId(parents)
const controller = require("../controllers/childProfileController");

//+++ /users/:userId/children +++
// get all
router.get("/", controller.getAllChildrenByUser); // get all children for the user

// post
router.post("/", controller.createChildForUser);


// +++ /users/:userId/children/:childId +++
// get one user's child
router.get("/:childId", controller.getChildByIdForUser);

// Update one user's child
router.put("/:childId", controller.updateChildForUser);

// delete one user's child
router.delete("/:childId", controller.deleteChildForUser);

module.exports = router;
