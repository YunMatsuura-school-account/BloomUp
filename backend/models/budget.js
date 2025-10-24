const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the Users collection
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Budget" } // Explicitly set collection name
);

module.exports = mongoose.model("Budget", budgetSchema);
