const Budget = require("../models/budget");
const Expense = require("../models/expense");
const User = require("../models/User"); // Fixed: was requiring Expense twice
const mongoose = require("mongoose");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/receipts/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Helper function to get userId from request
function getUserId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.body.userId ||
    req.query.userId ||
    req.params.userId
  );
}

// Helper function to safely convert to ObjectId
function toObjectId(id) {
  try {
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return null;
  } catch (err) {
    console.error("ObjectId conversion error:", err);
    return null;
  }
}

// Upload Receipt and Process with OpenAI Vision
exports.uploadReceipt = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No receipt image uploaded" });
    }

    // Read the uploaded image
    const imagePath = req.file.path;
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Use OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the following information in JSON format:
              {
                "merchantName": "store name",
                "totalAmount": numeric value only,
                "date": "YYYY-MM-DD format",
                "items": [
                  {
                    "name": "item name",
                    "amount": numeric value,
                    "category": "one of: Food & Dining, Education, Healthcare, Other"
                  }
                ],
                "suggestedCategory": "main category for the entire purchase",
                "currency": "currency symbol or code"
              }
              Be accurate with numbers. If you cannot determine something, use null or "Unknown".`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.2,
    });

    // Parse JSON result
    const content = response.choices[0].message.content;
    let receiptData;

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      receiptData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return res.status(500).json({
        message: "Failed to parse receipt data",
        rawResponse: content,
      });
    }

    // Create expenses
    const expenses = [];
    if (receiptData.items && receiptData.items.length > 0) {
      for (const item of receiptData.items) {
        const expense = new Expense({
          userId,
          amount: item.amount || 0,
          category: item.category || receiptData.suggestedCategory || "Other",
          description: item.name || "Unknown item",
          merchantName: receiptData.merchantName || "Unknown",
          date: receiptData.date ? new Date(receiptData.date) : new Date(),
          receiptImage: imagePath,
          paymentMethod: "Receipt Upload",
          notes: `From receipt at ${receiptData.merchantName}`,
        });

        await expense.save();
        expenses.push(expense);
      }
    } else {
      const expense = new Expense({
        userId,
        amount: receiptData.totalAmount || 0,
        category: receiptData.suggestedCategory || "Other",
        description: `Purchase at ${receiptData.merchantName || "Unknown"}`,
        merchantName: receiptData.merchantName || "Unknown",
        date: receiptData.date ? new Date(receiptData.date) : new Date(),
        receiptImage: imagePath,
        paymentMethod: "Receipt Upload",
      });

      await expense.save();
      expenses.push(expense);
    }

    // Get updated budget overview
    const budget = await Budget.findOne({ userId }).sort({ createdAt: -1 });
    const allExpenses = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
    ]);

    const total = budget?.total || 0;
    const spent = allExpenses.length ? allExpenses[0].totalSpent : 0;
    const remaining = total - spent;

    // Update budget spent and remaining
    if (budget) {
      budget.spent = spent;
      budget.remaining = remaining < 0 ? 0 : remaining;
      await budget.save();
    }

    res.json({
      message: "Receipt processed successfully",
      receiptData,
      expenses,
      budgetOverview: {
        total,
        spent,
        remaining: remaining < 0 ? 0 : remaining,
        status: remaining < 0 ? "Over budget" : "On track",
      },
    });
  } catch (error) {
    console.error("Error processing receipt:", error);
    res.status(500).json({
      message: "Failed to process receipt",
      error: error.message,
    });
  }
};

// Get Budget Overview
exports.getBudgetOverview = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    console.log("getBudgetOverview - Raw userId:", rawUserId);

    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    console.log("getBudgetOverview - Converted userId:", userId);

    if (!userId) {
      return res.status(400).json({
        message: "Invalid User ID format",
        receivedId: rawUserId,
      });
    }

    const budget = await Budget.findOne({ userId }).sort({ createdAt: -1 });
    console.log("getBudgetOverview - Found budget:", budget);

    if (!budget) {
      return res
        .status(404)
        .json({ message: "Budget not found. Please set a budget first." });
    }

    const expenses = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
    ]);

    const total = budget.total;
    const spent = expenses.length ? expenses[0].totalSpent : 0;
    const remaining = total - spent;

    // Update budget
    budget.spent = spent;
    budget.remaining = remaining < 0 ? 0 : remaining;
    await budget.save();

    res.json({
      total,
      spent,
      remaining: remaining < 0 ? 0 : remaining,
      status: remaining < 0 ? "Over budget" : "On track",
    });
  } catch (error) {
    console.error("Error fetching budget overview:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Expenses by Category
exports.getExpensesByCategory = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const expensesByCategory = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(expensesByCategory);
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: error.message });
  }
};

// Set or Update Budget
exports.setBudget = async (req, res) => {
  try {
    const { total } = req.body;
    const rawUserId = getUserId(req);

    // console.log('\n=== SET BUDGET REQUEST ===');
    // console.log('setBudget - Raw userId:', rawUserId);
    // console.log('setBudget - Total:', total);
    // console.log('setBudget - Body:', req.body);

    if (!rawUserId) {
      console.log("No userId found");
      return res.status(400).json({ message: "User ID required" });
    }

    if (total === undefined || isNaN(total)) {
      console.log("Invalid total amount");
      return res
        .status(400)
        .json({ message: "Please provide a valid total budget amount." });
    }

    const userId = toObjectId(rawUserId);
    console.log("setBudget - Converted userId:", userId);

    if (!userId) {
      console.log("Invalid ObjectId format");
      return res.status(400).json({
        message: "Invalid User ID format",
        receivedId: rawUserId,
      });
    }

    // Check if budget already exists
    let budget = await Budget.findOne({ userId });
    console.log("setBudget - Existing budget:", budget);

    if (budget) {
      // Update existing budget
      console.log("Updating existing budget...");
      budget.total = total;
      budget.remaining = total - budget.spent;
      const savedBudget = await budget.save();
      console.log(" Budget updated:", savedBudget);
      console.log(" Budget saved to DB with _id:", savedBudget._id);

      // Verify it's in database
      const verify = await Budget.findById(savedBudget._id);
      console.log("🔍 Verification - Budget found in DB:", verify);

      res.json({
        message: "Budget updated successfully!",
        budget: savedBudget,
      });
    } else {
      // Create new budget
      console.log(" Creating new budget...");
      console.log("Data to save:", {
        userId,
        total,
        spent: 0,
        remaining: total,
      });

      budget = new Budget({
        userId,
        total,
        spent: 0,
        remaining: total,
      });

      console.log("Budget document before save:", budget);
      const savedBudget = await budget.save();
      console.log(" Budget created:", savedBudget);
      console.log("Budget _id:", savedBudget._id);
      console.log("Budget saved to collection:", Budget.collection.name);

      // Verify it's in database
      const verify = await Budget.findById(savedBudget._id);
      console.log("Verification - Budget found in DB:", verify);

      // Also check with userId
      const verifyByUser = await Budget.findOne({ userId });
      console.log("Verification - Budget found by userId:", verifyByUser);

      // Link budget to user
      console.log("Linking budget to user");
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { budget: savedBudget._id },
        { new: true }
      );
      console.log("User updated:", updatedUser);

      res.json({
        message: "Budget set successfully!",
        budget: savedBudget,
      });
    }
    console.log("=== END SET BUDGET ===\n");
  } catch (error) {
    console.error("❌ Error saving budget:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: error.message, error: error.stack });
  }
};

// Middleware export
exports.uploadMiddleware = upload.single("receipt");

// Export everything explicitly
module.exports = {
  uploadReceipt: exports.uploadReceipt,
  getBudgetOverview: exports.getBudgetOverview,
  setBudget: exports.setBudget,
  getExpensesByCategory: exports.getExpensesByCategory,
  getAllExpenses: exports.getAllExpenses,
  uploadMiddleware: exports.uploadMiddleware,
};
