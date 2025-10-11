const express = require("express");
const router = express.Router();
const controller = require("../controllers/childProfileController");

// get all
router.get("/", controller.getAllChildren);

// get
router.get("/:id", controller.getChildById);

// post
router.post("/", controller.createChild);

// put
router.put("/:id", controller.updateChild);

// delete
router.delete("/:id", controller.deleteChild);

module.exports = router;
