const express = require("express");
const router = express.Router();
const { getPosts } = require("../controllers/postController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, getPosts);

module.exports = router;
