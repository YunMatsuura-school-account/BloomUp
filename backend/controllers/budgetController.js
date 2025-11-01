const Budget = require("../models/budget");
const Expense = require("../models/expense");
const CategoryAllocation = require("../models/CategoryAllocation");
const User = require("../models/User");
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

// Upload Receipt and Process with OpenAI Vision (DO NOT SAVE TO DB YET)
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
                    "category": "one of: Medical, Education, Consumable, Other",
                    "quantity": integer
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

   const content = response.choices[0].message.content;
let receiptData;

try {
  // Remove markdown code blocks if present
  let jsonString = content.trim();
  
  // Remove ```json and ``` wrappers
  jsonString = jsonString.replace(/^```json\s*/i, '').replace(/```\s*$/g, '').trim();
  
  // Try to extract JSON object
  const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
  const jsonToParse = jsonMatch ? jsonMatch[0] : jsonString;
  
  receiptData = JSON.parse(jsonToParse);
} catch (parseError) {
  console.error("Error parsing OpenAI response:", parseError);
  console.error("Raw content:", content);
  return res.status(500).json({
    message: "Failed to parse receipt data",
    rawResponse: content,
  });
}

    // Format expenses for review (DO NOT SAVE TO DATABASE)
    const expenses = [];

    if (receiptData.items && receiptData.items.length > 0) {
      // Group items by category
      const grouped = {};

      for (const item of receiptData.items) {
        const cat = item.category || receiptData.suggestedCategory || "Other";
        const qty = Number(item.quantity) || 1;

        if (!grouped[cat]) grouped[cat] = { total: 0, items: [], quantity: 0 };

        grouped[cat].items.push(item.name || "Unknown item");
        grouped[cat].total += (Number(item.amount) || 0) * qty;
        grouped[cat].quantity += qty;
      }

      // Format grouped expenses for review
      for (const [category, data] of Object.entries(grouped)) {
        expenses.push({
          date: receiptData.date || new Date().toISOString().split('T')[0],
          description: data.items.join(", "),
          category: category,
          quantity: data.quantity,
          amount: data.total,
        });
      }
    } else {
      // Single expense fallback
      expenses.push({
        date: receiptData.date || new Date().toISOString().split('T')[0],
        description: `Purchase at ${receiptData.merchantName || "Unknown"}`,
        category: receiptData.suggestedCategory || "Other",
        quantity: 1,
        amount: receiptData.totalAmount || 0,
      });
    }

    // Return data for review without saving to database
    res.json({
      message: "Receipt processed successfully",
      receiptData: {
        merchantName: receiptData.merchantName,
        totalAmount: receiptData.totalAmount,
        date: receiptData.date,
        currency: receiptData.currency,
        expenses: expenses, // This will be reviewed and edited by user
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
// Add Manual Expense
exports.addManualExpense = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const { amount, category, description, date, quantity } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ message: "Amount and category are required" });
    }

    // Create the expense
    const expense = new Expense({
      userId,
      amount: parseFloat(amount),
      category,
      description: description || "",
      merchantName: description || "Unknown",
      quantity: quantity ? parseInt(quantity) : 1,
      date: date ? new Date(date) : new Date(),
      paymentMethod: "Manual Entry",
      notes: `Manually added expense${quantity ? ` (Qty: ${quantity})` : ""}`,
    });

    await expense.save();

    // Update budget overview
    const budget = await Budget.findOne({ userId }).sort({ createdAt: -1 });
    if (budget) {
      const allExpenses = await Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
      ]);

      const spent = allExpenses.length ? allExpenses[0].totalSpent : 0;
      const remaining = budget.total - spent;

      budget.spent = spent;
      budget.remaining = remaining < 0 ? 0 : remaining;
      await budget.save();
    }

    res.json({
      message: "Expense added successfully",
      expense,
      budgetOverview: budget ? {
        total: budget.total,
        spent: budget.spent,
        remaining: budget.remaining,
        status: budget.remaining < 0 ? "Over budget" : "On track",
      } : null,
    });
  } catch (error) {
    console.error("Error adding manual expense:", error);
    res.status(500).json({
      message: "Failed to add expense",
      error: error.message,
    });
  }
};
// Get Budget Overview
exports.getBudgetOverview = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) return res.status(400).json({ message: "User ID required" });

    const userId = toObjectId(rawUserId);
    if (!userId) return res.status(400).json({ message: "Invalid User ID format" });

    const budget = await Budget.findOne({ userId }).sort({ createdAt: -1 });
    if (!budget) return res.status(404).json({ message: "Budget not found. Please set a budget first." });

    // Get all expenses per category
    const expensesByCategory = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    // Get allocated categories
    const allocations = await CategoryAllocation.find({ userId, budget: budget._id });

    // Map allocations with spent amounts
    const categories = allocations.map(cat => {
      const spentEntry = expensesByCategory.find(e => e._id === cat.category);
      const spentAmount = spentEntry ? spentEntry.spent : 0;
      const percentage = cat.percentage || (budget.total > 0 ? ((cat.allocatedAmount / budget.total) * 100).toFixed(2) : 0);
      
      return {
        name: cat.category,
        allocated: cat.allocatedAmount,
        spent: spentAmount,
        percentage: parseFloat(percentage),
      };
    });

    // Total spent and remaining
    const totalSpent = expensesByCategory.reduce((sum, e) => sum + e.spent, 0);
    const remaining = budget.total - totalSpent;

    // Update budget in DB
    budget.spent = totalSpent;
    budget.remaining = remaining < 0 ? 0 : remaining;
    await budget.save();

    res.json({
      total: budget.total,
      spent: totalSpent,
      remaining: remaining < 0 ? 0 : remaining,
      status: remaining < 0 ? "Over budget" : "On track",
      categories,
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

// Set or Update Budget with Category Allocations
exports.setBudget = async (req, res) => {
  try {
    const { total, categories } = req.body;
    const rawUserId = getUserId(req);

    if (!rawUserId) return res.status(400).json({ message: "User ID required" });
    if (total === undefined || isNaN(total)) return res.status(400).json({ message: "Provide a valid total budget amount." });

    const userId = toObjectId(rawUserId);
    console.log("setBudget - Converted userId:", userId);
    if (!userId) return res.status(400).json({ message: "Invalid User ID format" });

    // Validate categories data
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: "Categories must be an array" });
    }

    // Get current spent amount
    const allExpenses = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
    ]);
    const spent = allExpenses.length ? allExpenses[0].totalSpent : 0;

    let budget = await Budget.findOne({ userId });

    if (budget) {
      // Update existing budget
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
      budget.spent = spent;
      budget.remaining = total - spent;
      await budget.save();
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
      budget = new Budget({ userId, total, spent: 0, remaining: total });
      await budget.save();
      await User.findByIdAndUpdate(userId, { budget: budget._id });
    }

    // Save category allocations
    // Remove old allocations
    await CategoryAllocation.deleteMany({ userId, budget: budget._id });

    // Insert new allocations with both allocated amount and percentage
    const allocations = categories.map(cat => ({
      userId,
      budget: budget._id,
      category: cat.name,
      allocatedAmount: parseFloat(cat.allocated) || 0,
      percentage: parseFloat(cat.percentage) || 0,
    }));
    
    await CategoryAllocation.insertMany(allocations);

    // Fetch allocations for response with spent amounts
    const savedAllocations = await CategoryAllocation.find({ userId, budget: budget._id });
    
    // Get expenses by category for spent amounts
    const expensesByCategory = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    // Calculate remaining
    const remaining = total - spent;

    res.json({
      total,
      spent,
      remaining: remaining < 0 ? 0 : remaining,
      status: remaining < 0 ? "Over budget" : "On track",
      categories: savedAllocations.map(a => {
        const spentEntry = expensesByCategory.find(e => e._id === a.category);
        const spentAmount = spentEntry ? spentEntry.spent : 0;
        
        return {
          name: a.category,
          allocated: a.allocatedAmount,
          percentage: a.percentage || ((a.allocatedAmount / total) * 100).toFixed(2),
          spent: spentAmount,
        };
      }),
    });

  } catch (error) {
    console.error("Error saving budget:", error);
    res.status(500).json({ message: error.message });
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
  addManualExpense: exports.addManualExpense,
  uploadMiddleware: exports.uploadMiddleware,
};
