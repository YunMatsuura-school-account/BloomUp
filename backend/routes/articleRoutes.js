// backend/routes/articleRoutes.js
const express = require('express');
const router = express.Router();

// Import controller
const articleController = require('../controllers/articleController');

// Import YOUR auth middleware (verifyToken, not protect)
const verifyToken = require('../middleware/authMiddleware');

// CRITICAL: Route order matters! Specific routes MUST come before dynamic ones

// 1. STATIC/SPECIFIC ROUTES FIRST (these have fixed paths)
router.get('/stats', articleController.getArticleStats);

// 2. SAVED ROUTES (must come before /:id or "saved" will be treated as an ID)
router.get('/saved/me', verifyToken, articleController.getSavedArticles);

// 3. CATEGORY ROUTES (must come before /:id or "category" will be treated as an ID)
router.get('/category/:category', articleController.getArticlesByCategory);

// 4. MAIN LIST ROUTE
router.get('/', articleController.getArticles);

// 5. DYNAMIC ROUTES WITH :id (these catch any remaining paths)
router.get('/:id/related', articleController.getRelatedArticles);
router.get('/:id/is-saved', verifyToken, articleController.isArticleSaved);
router.get('/:id', articleController.getArticleById);

// 6. PROTECTED DYNAMIC ROUTES
router.post('/:id/save', verifyToken, articleController.saveArticle);
router.delete('/:id/save', verifyToken, articleController.unsaveArticle);

// 7. ADMIN ROUTES
router.post('/', verifyToken, articleController.createArticle);
router.put('/:id', verifyToken, articleController.updateArticle);
router.delete('/:id', verifyToken, articleController.deleteArticle);

module.exports = router;