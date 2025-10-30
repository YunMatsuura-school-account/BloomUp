// backend/models/SavedArticle.js
const mongoose = require('mongoose');

const savedArticleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: [true, 'Article ID is required']
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can't save the same article twice
savedArticleSchema.index({ userId: 1, articleId: 1 }, { unique: true });

// Index for querying user's saved articles
savedArticleSchema.index({ userId: 1, savedAt: -1 });

module.exports = mongoose.model('SavedArticle', savedArticleSchema);