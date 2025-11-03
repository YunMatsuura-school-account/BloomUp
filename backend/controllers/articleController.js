// backend/controllers/articleController.js
const Article = require('../models/Article');
const SavedArticle = require('../models/SavedArticle');

// Helper function to get user ID from req.user (supports both 'id' and '_id')
const getUserId = (user) => {
  return user.id || user._id || user.userId;
};

// @desc    Get all articles with optional filters
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res) => {
  try {
    const { category, search, featured, limit = 50, page = 1 } = req.query;
    
    let query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: articles
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
};

// @desc    Get single article by ID
// @route   GET /api/articles/:id
// @access  Public
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article || article.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    article.viewCount += 1;
    await article.save();

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: error.message
    });
  }
};

// @desc    Get articles by category
// @route   GET /api/articles/category/:category
// @access  Public
exports.getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const validCategories = ['Health', 'Education', 'Finances', 'Routines', 'Parenting'];
    
    // DEBUG LOGGING
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 GET ARTICLES BY CATEGORY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 Requested category:', category);
    console.log('📋 Valid categories:', validCategories);
    
    if (!validCategories.includes(category)) {
      console.log('❌ Invalid category provided:', category);
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
        requestedCategory: category,
        validCategories: validCategories
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // EXACT MATCH QUERY - CRITICAL!
    const query = { 
      category: category,  // Must match EXACTLY
      status: 'published' 
    };
    
    console.log('🔎 MongoDB Query:', JSON.stringify(query, null, 2));

    // Execute query
    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Article.countDocuments(query);
    
    console.log('📊 Query Results:');
    console.log('   - Found:', articles.length, 'articles');
    console.log('   - Total:', total);
    
    // CRITICAL VERIFICATION - Check if returned articles match category
    if (articles.length > 0) {
      console.log('📄 First article details:');
      console.log('   - Title:', articles[0].title);
      console.log('   - Category:', articles[0].category);
      console.log('   - Status:', articles[0].status);
      
      // Check for any mismatched articles
      const mismatchedArticles = articles.filter(a => a.category !== category);
      
      if (mismatchedArticles.length > 0) {
        console.error('🚨 CRITICAL ERROR: Found articles with WRONG category!');
        console.error('🚨 Expected category:', category);
        console.error('🚨 Wrong articles:', mismatchedArticles.map(a => ({
          id: a._id,
          title: a.title,
          category: a.category
        })));
        console.error('🚨 This should NEVER happen! Database integrity issue!');
      } else {
        console.log('✅ All articles match requested category');
      }
      
      // Log all categories found
      const categoriesFound = [...new Set(articles.map(a => a.category))];
      console.log('📂 Unique categories in results:', categoriesFound);
    } else {
      console.log('⚠️ No articles found for category:', category);
      
      // Check if ANY articles exist at all
      const anyArticles = await Article.countDocuments({ status: 'published' });
      console.log('ℹ️ Total published articles in database:', anyArticles);
      
      if (anyArticles > 0) {
        // Show what categories DO exist
        const existingCategories = await Article.distinct('category', { status: 'published' });
        console.log('ℹ️ Categories that exist:', existingCategories);
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      category,
      data: articles
    });
  } catch (error) {
    console.error('❌ ERROR in getArticlesByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
};

// @desc    Get related articles (same category, excluding current)
// @route   GET /api/articles/:id/related
// @access  Public
exports.getRelatedArticles = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const relatedArticles = await Article.find({
      _id: { $ne: article._id },
      category: article.category,
      status: 'published'
    })
      .limit(3)
      .select('title description image category author viewCount createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: relatedArticles.length,
      data: relatedArticles
    });
  } catch (error) {
    console.error('Error fetching related articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related articles',
      error: error.message
    });
  }
};

// @desc    Get user's saved articles
// @route   GET /api/articles/saved/me
// @access  Private
exports.getSavedArticles = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    
    console.log('Getting saved articles for user:', userId);
    console.log('req.user object:', req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    const savedArticles = await SavedArticle.find({ userId })
      .populate({
        path: 'articleId',
        match: { status: 'published' },
        select: '-__v'
      })
      .sort({ savedAt: -1 });

    const articles = savedArticles
      .filter(item => item.articleId !== null)
      .map(item => ({
        ...item.articleId._doc,
        savedAt: item.savedAt
      }));

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved articles',
      error: error.message
    });
  }
};

// @desc    Save/bookmark an article
// @route   POST /api/articles/:id/save
// @access  Private
exports.saveArticle = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    
    console.log('Saving article for user:', userId);
    console.log('req.user object:', req.user);
    console.log('Article ID:', req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const existingSave = await SavedArticle.findOne({
      userId,
      articleId: req.params.id
    });

    if (existingSave) {
      return res.status(400).json({
        success: false,
        message: 'Article already saved'
      });
    }

    const savedArticle = await SavedArticle.create({
      userId,
      articleId: req.params.id
    });

    console.log('Article saved successfully:', savedArticle);

    res.status(201).json({
      success: true,
      message: 'Article saved successfully',
      data: savedArticle
    });
  } catch (error) {
    console.error('Error saving article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save article',
      error: error.message
    });
  }
};

// @desc    Unsave/remove bookmark from article
// @route   DELETE /api/articles/:id/save
// @access  Private
exports.unsaveArticle = async (req, res) => {
  try {
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    const savedArticle = await SavedArticle.findOneAndDelete({
      userId,
      articleId: req.params.id
    });

    if (!savedArticle) {
      return res.status(404).json({
        success: false,
        message: 'Saved article not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article removed from saved'
    });
  } catch (error) {
    console.error('Error unsaving article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsave article',
      error: error.message
    });
  }
};

// @desc    Check if article is saved by user
// @route   GET /api/articles/:id/is-saved
// @access  Private
exports.isArticleSaved = async (req, res) => {
  try {
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    const savedArticle = await SavedArticle.findOne({
      userId,
      articleId: req.params.id
    });

    res.status(200).json({
      success: true,
      isSaved: !!savedArticle
    });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check saved status',
      error: error.message
    });
  }
};

// @desc    Create new article (Admin only)
// @route   POST /api/articles
// @access  Private/Admin
exports.createArticle = async (req, res) => {
  try {
    const article = await Article.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create article',
      error: error.message
    });
  }
};

// @desc    Update article (Admin only)
// @route   PUT /api/articles/:id
// @access  Private/Admin
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: article
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update article',
      error: error.message
    });
  }
};

// @desc    Delete article (Admin only)
// @route   DELETE /api/articles/:id
// @access  Private/Admin
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    await SavedArticle.deleteMany({ articleId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete article',
      error: error.message
    });
  }
};

// @desc    Get article statistics
// @route   GET /api/articles/stats
// @access  Public
exports.getArticleStats = async (req, res) => {
  try {
    const stats = await Article.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$viewCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalArticles = await Article.countDocuments({ status: 'published' });
    const totalViews = await Article.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: '$viewCount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalArticles,
        totalViews: totalViews[0]?.total || 0,
        byCategory: stats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};