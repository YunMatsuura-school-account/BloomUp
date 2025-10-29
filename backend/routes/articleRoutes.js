// backend/routes/articleRoutes.js
const express = require('express');
const router = express.Router();

// Import controller
const articleController = require('../controllers/articleController');

// Import YOUR auth middleware (verifyToken, not protect)
const verifyToken = require('../middleware/authMiddleware');

// Public routes - specific paths first (these work without login)
router.get('/stats', articleController.getArticleStats);
router.get('/category/:category', articleController.getArticlesByCategory);

// Main list route
router.get('/', articleController.getArticles);

// Protected route - specific (must come BEFORE /:id or Express will think "saved" is an id)
router.get('/saved/me', verifyToken, articleController.getSavedArticles);

// Public dynamic routes
router.get('/:id/related', articleController.getRelatedArticles);
router.get('/:id', articleController.getArticleById);

// Protected dynamic routes (require login)
router.get('/:id/is-saved', verifyToken, articleController.isArticleSaved);
router.post('/:id/save', verifyToken, articleController.saveArticle);
router.delete('/:id/save', verifyToken, articleController.unsaveArticle);

// Admin routes (require login)
router.post('/', verifyToken, articleController.createArticle);
router.put('/:id', verifyToken, articleController.updateArticle);
router.delete('/:id', verifyToken, articleController.deleteArticle);

module.exports = router;