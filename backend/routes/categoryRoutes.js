const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, categoryCtrl.getCategories);
router.post('/', authMiddleware, categoryCtrl.createCategory);

module.exports = router;