// backend/models/Article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Health', 'Education', 'Finances', 'Routines', 'Parenting'],
      message: '{VALUE} is not a valid category'
    }
  },
  image: {
    type: String,
    required: [true, 'Main image URL is required']
  },
  image1: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Article content is required']
  },
  author: {
    type: String,
    default: 'Staff Writer'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  viewCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ isFeatured: 1, status: 1 });
articleSchema.index({ title: 'text', description: 'text', content: 'text' });

// Virtual for saved articles count
articleSchema.virtual('savedCount', {
  ref: 'SavedArticle',
  localField: '_id',
  foreignField: 'articleId',
  count: true
});

module.exports = mongoose.model('Article', articleSchema);