const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { 
      type: Number, 
      required: true 
    },
    category: { 
      type: String,
      default: "Other"
    },
    description: { 
      type: String 
    },
    merchantName: {  // Added for receipt uploads
      type: String
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
    receiptImage: {  // Added for storing receipt image path
      type: String
    },
    paymentMethod: {  // Added for payment tracking
      type: String
    },
    notes: {  // Added for additional notes
      type: String
    },
    remarks: { 
      type: String 
    },
  },
  { 
    collection: "Expenses",
    timestamps: true 
  }
);

module.exports = mongoose.model("Expense", expenseSchema);