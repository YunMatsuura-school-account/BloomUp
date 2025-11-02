const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    spent: {
      type: Number,
      required: true,
      default: 0,
    },
    remaining: {
      type: Number,
      required: true,
      default: 0,
    },
    // Add period tracking
    period: {
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
      },
      year: {
        type: Number,
        required: true
      }
    },
    // Add status to track if budget is active
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Budget" }
);

// Create compound index for efficient querying
budgetSchema.index({ userId: 1, 'period.year': 1, 'period.month': 1 });

module.exports = mongoose.model("Budget", budgetSchema);