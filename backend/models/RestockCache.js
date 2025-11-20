// backend/models/RestockCache.js
const mongoose = require('mongoose');

const restockCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One cache per user
  },
  items: [{
    productName: String,
    category: String,
    lastPurchaseDate: Date,
    lastPurchasedText: String,
    daysSinceLastPurchase: Number,
    averageIntervalDays: Number,
    totalPurchases: Number,
    status: String,
    nextRestockDate: Date,
    daysUntilRestock: Number,
    reminderEnabled: Boolean
  }],
  lastCalculated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for efficient querying
restockCacheSchema.index({ userId: 1 });

// TTL index to automatically delete old caches after 30 days (safety cleanup)
restockCacheSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('RestockCache', restockCacheSchema);