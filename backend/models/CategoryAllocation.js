const mongoose = require("mongoose");

const categoryAllocationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    allocatedAmount: {
      type: Number,
      required: true,
    },
     percentage: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CategoryAllocations",
    timestamps: true,
  }
);

module.exports = mongoose.model("CategoryAllocation", categoryAllocationSchema);
