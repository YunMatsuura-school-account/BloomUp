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

// Helper function to get current period
function getCurrentPeriod() {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-12
    year: now.getFullYear()
  };
}

// Helper function to get date range for a period - FIXED
function getPeriodDateRange(month, year) {
  // month parameter is 1-12 (human readable)
  // JavaScript Date months are 0-11, so we subtract 1
  
  // Start: First day of the month at 00:00:00
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  
  // End: Last day of the month at 23:59:59.999
  // Using month (without -1) and day 0 gives us the last day of the previous month
  // So month - 1 + 1 = month, and day 0 gives last day of month-1, which is our target month
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  
  console.log(`Date range for month ${month}/${year}:`);
  console.log(`  Start: ${startDate.toISOString()}`);
  console.log(`  End: ${endDate.toISOString()}`);
  
  return { startDate, endDate };
}

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

    const imagePath = req.file.path;
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString("base64");

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
      let jsonString = content.trim();
      jsonString = jsonString.replace(/^```json\s*/i, '').replace(/```\s*$/g, '').trim();
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      const jsonToParse = jsonMatch ? jsonMatch[0] : jsonString;
      receiptData = JSON.parse(jsonToParse);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return res.status(500).json({
        message: "Failed to parse receipt data",
        rawResponse: content,
      });
    }

    const expenses = [];

    if (receiptData.items && receiptData.items.length > 0) {
      const grouped = {};

      for (const item of receiptData.items) {
        const cat = item.category || receiptData.suggestedCategory || "Other";
        const qty = Number(item.quantity) || 1;

        if (!grouped[cat]) grouped[cat] = { total: 0, items: [], quantity: 0 };

        grouped[cat].items.push(item.name || "Unknown item");
        grouped[cat].total += (Number(item.amount) || 0) * qty;
        grouped[cat].quantity += qty;
      }

      for (const [category, data] of Object.entries(grouped)) {
        expenses.push({
          date: receiptData.date || new Date().toISOString().split("T")[0],
          description: data.items.join(", "),
          category: category,
          quantity: data.quantity,
          amount: data.total,
        });
      }
    } else {
      expenses.push({
        date: receiptData.date || new Date().toISOString().split("T")[0],
        description: `Purchase at ${receiptData.merchantName || "Unknown"}`,
        category: receiptData.suggestedCategory || "Other",
        quantity: 1,
        amount: receiptData.totalAmount || 0,
      });
    }

    res.json({
      message: "Receipt processed successfully",
      receiptData: {
        merchantName: receiptData.merchantName,
        totalAmount: receiptData.totalAmount,
        date: receiptData.date,
        currency: receiptData.currency,
        expenses: expenses,
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

// Add Manual Expense - FIXED
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
      return res
        .status(400)
        .json({ message: "Amount and category are required" });
    }

    // Parse date properly
    const expenseDate = date ? new Date(date) : new Date();
    
    // Create the expense
    const expense = new Expense({
      userId,
      amount: parseFloat(amount),
      category,
      description: description || "",
      merchantName: description || "Unknown",
      quantity: quantity ? parseInt(quantity) : 1,
      date: expenseDate,
      paymentMethod: "Manual Entry",
      notes: `Manually added expense${quantity ? ` (Qty: ${quantity})` : ""}`,
    });

    await expense.save(); // SINGLE SAVE

    // Get the period for this expense
    const period = {
      month: expenseDate.getMonth() + 1,
      year: expenseDate.getFullYear()
    };

    const { startDate, endDate } = getPeriodDateRange(period.month, period.year);

    // Find budget for this period
    const budget = await Budget.findOne({ 
      userId,
      'period.month': period.month,
      'period.year': period.year
    });

    if (budget) {
      // Recalculate total spent
      const allExpenses = await Expense.aggregate([
        { 
          $match: { 
            userId,
            date: { $gte: startDate, $lte: endDate }
          } 
        },
        { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
      ]);

      const spent = allExpenses.length ? allExpenses[0].totalSpent : 0;
      const remaining = budget.total - spent;

      budget.spent = spent;
      budget.remaining = remaining;
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
        period: period
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

// Get Budget Overview - FIXED
exports.getBudgetOverview = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId)
      return res.status(400).json({ message: "User ID required" });

    const userId = toObjectId(rawUserId);
    if (!userId)
      return res.status(400).json({ message: "Invalid User ID format" });

    // Get period
    const period = req.query.month && req.query.year 
      ? { month: parseInt(req.query.month), year: parseInt(req.query.year) }
      : getCurrentPeriod();

    console.log(`\n=== Getting budget overview for: ${period.month}/${period.year} ===`);

    // Find budget for this period
    const budget = await Budget.findOne({ 
      userId, 
      'period.month': period.month,
      'period.year': period.year 
    });

    if (!budget) {
      console.log(`No budget found for ${period.month}/${period.year}`);
      return res.status(404).json({ 
        message: "Budget not found for this period. Please set a budget first.",
        period 
      });
    }

    console.log(`Budget found: Total=${budget.total}, Month=${budget.period.month}, Year=${budget.period.year}`);

    const { startDate, endDate } = getPeriodDateRange(period.month, period.year);
    
    console.log(`Expense date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      { 
        $match: { 
          userId,
          date: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    console.log(`Expenses by category:`, expensesByCategory);

    // Get allocations
    const allocations = await CategoryAllocation.find({ userId, budget: budget._id });

    // Map categories with spent
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

    // Calculate totals
    const totalSpent = expensesByCategory.reduce((sum, e) => sum + e.spent, 0);
    const remaining = budget.total - totalSpent;

    console.log(`Total spent: ${totalSpent}, Remaining: ${remaining}\n`);

    // Update budget
    budget.spent = totalSpent;
    budget.remaining = remaining;
    await budget.save();

    res.json({
      total: budget.total,
      spent: totalSpent,
      remaining: remaining,
      status: remaining < 0 ? "Over budget" : "On track",
      categories,
      period: period
    });
  } catch (error) {
    console.error("Error fetching budget overview:", error);
    res.status(500).json({ message: error.message });
  }
};
// Get All Expenses for a Specific Year
exports.getExpensesByYear = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const year = parseInt(req.params.year) || new Date().getFullYear();
    
    console.log(`\n=== Getting all expenses for year: ${year} ===`);
    
    // Get date range for entire year
    const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)); // Jan 1
    const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // Dec 31
    
    console.log(`Query range: ${yearStart.toISOString()} to ${yearEnd.toISOString()}`);

    // Get all expenses for the year
    const expenses = await Expense.find({ 
      userId,
      date: { $gte: yearStart, $lte: yearEnd }
    }).sort({ date: -1 });

    console.log(`Found ${expenses.length} expenses for year ${year}\n`);

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses by year:", error);
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

    const period = req.query.month && req.query.year 
      ? { month: parseInt(req.query.month), year: parseInt(req.query.year) }
      : getCurrentPeriod();

    const { startDate, endDate } = getPeriodDateRange(period.month, period.year);

    const expensesByCategory = await Expense.aggregate([
      { 
        $match: { 
          userId,
          date: { $gte: startDate, $lte: endDate }
        } 
      },
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

// Get All Expenses - FIXED
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

    const period = req.query.month && req.query.year 
      ? { month: parseInt(req.query.month), year: parseInt(req.query.year) }
      : getCurrentPeriod();

    console.log(`\n=== Getting expenses for period: ${period.month}/${period.year} ===`);
    
    const { startDate, endDate } = getPeriodDateRange(period.month, period.year);
    
    console.log(`Query range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // First check all expenses for this user
    const allUserExpenses = await Expense.find({ userId });
    console.log(`Total expenses for user: ${allUserExpenses.length}`);
    if (allUserExpenses.length > 0) {
      console.log('Sample expense dates:');
      allUserExpenses.slice(0, 3).forEach(exp => {
        console.log(`  - ${exp.date.toISOString()} (${exp.description})`);
      });
    }

    // Get expenses for this period
    const expenses = await Expense.find({ 
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    console.log(`Found ${expenses.length} expenses in range for ${period.month}/${period.year}\n`);

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: error.message });
  }
};

// Set or Update Budget
exports.setBudget = async (req, res) => {
  try {
    const { total, categories } = req.body;
    const rawUserId = getUserId(req);

    if (!rawUserId)
      return res.status(400).json({ message: "User ID required" });
    if (total === undefined || isNaN(total))
      return res
        .status(400)
        .json({ message: "Provide a valid total budget amount." });

    const userId = toObjectId(rawUserId);
    if (!userId) return res.status(400).json({ message: "Invalid User ID format" });

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: "Categories must be an array" });
    }

    const period = getCurrentPeriod();
    const { startDate, endDate } = getPeriodDateRange(period.month, period.year);

    // Get current spent
    const allExpenses = await Expense.aggregate([
      { 
        $match: { 
          userId,
          date: { $gte: startDate, $lte: endDate }
        } 
      },
      { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
    ]);
    const spent = allExpenses.length ? allExpenses[0].totalSpent : 0;

    // Find or create budget
    let budget = await Budget.findOne({ 
      userId,
      'period.month': period.month,
      'period.year': period.year
    });

    if (budget) {
      budget.total = total;
      budget.spent = spent;
      budget.remaining = total - spent;
      await budget.save();
      await CategoryAllocation.deleteMany({ userId, budget: budget._id });
    } else {
      budget = new Budget({
        userId,
        total,
        spent,
        remaining: total - spent,
        period: period,
        isActive: true
      });
      await budget.save();
      await User.findByIdAndUpdate(userId, { budget: budget._id });
    }

    // Save allocations
    const allocations = categories.map(cat => ({
      userId,
      budget: budget._id,
      category: cat.name,
      allocatedAmount: parseFloat(cat.allocated) || 0,
      percentage: parseFloat(cat.percentage) || 0,
    }));

    await CategoryAllocation.insertMany(allocations);

    const savedAllocations = await CategoryAllocation.find({ userId, budget: budget._id });
    
    const expensesByCategory = await Expense.aggregate([
      { 
        $match: { 
          userId,
          date: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    const remaining = total - spent;

    res.json({
      total,
      spent,
      remaining: remaining,
      status: remaining < 0 ? "Over budget" : "On track",
      period: period,
      categories: savedAllocations.map(a => {
        const spentEntry = expensesByCategory.find(e => e._id === a.category);
        const spentAmount = spentEntry ? spentEntry.spent : 0;

        return {
          name: a.category,
          allocated: a.allocatedAmount,
          percentage:
            a.percentage || ((a.allocatedAmount / total) * 100).toFixed(2),
          spent: spentAmount,
        };
      }),
    });
  } catch (error) {
    console.error("Error saving budget:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Monthly Spending for Chart (Current Year)
exports.getMonthlySpending = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    // Get year from query or use current year
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

    console.log(`\n=== Getting monthly spending for year: ${year} ===`);

    // Get all expenses for the entire year
    const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)); // Jan 1
    const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // Dec 31

    const expenses = await Expense.aggregate([
      { 
        $match: { 
          userId,
          date: { $gte: yearStart, $lte: yearEnd }
        } 
      },
      {
        $project: {
          month: { $month: "$date" },
          amount: 1,
          category: 1
        }
      },
      {
        $group: {
          _id: { month: "$month", category: "$category" },
          spent: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);

    console.log(`Found ${expenses.length} expense groups for year ${year}`);

    // Initialize 12 months with empty data
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1, // 1-12
      total: 0,
      categories: {}
    }));

    // Fill in the actual expense data
    expenses.forEach(exp => {
      const monthIndex = exp._id.month - 1; // Convert to 0-indexed
      monthlyData[monthIndex].total += exp.spent;
      monthlyData[monthIndex].categories[exp._id.category] = 
        (monthlyData[monthIndex].categories[exp._id.category] || 0) + exp.spent;
    });

    console.log(`Monthly totals:`, monthlyData.map(m => `${m.month}: ${m.total}`).join(', '));

    res.json({
      year,
      months: monthlyData
    });

  } catch (error) {
    console.error("Error fetching monthly spending:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Weekly Spending for Current Month
exports.getWeeklySpending = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    // Get period from query or use current
    const period = req.query.month && req.query.year 
      ? { month: parseInt(req.query.month), year: parseInt(req.query.year) }
      : getCurrentPeriod();

    console.log(`\n=== Getting weekly spending for: ${period.month}/${period.year} ===`);

    const { startDate, endDate } = getPeriodDateRange(period.month, period.year);

    // Get all expenses for the month
    const expenses = await Expense.find({ 
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Initialize 4 weeks
    const weeklyData = Array.from({ length: 4 }, (_, i) => ({
      week: i + 1,
      total: 0,
      categories: {}
    }));

    // Group expenses by week
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const dayOfMonth = expDate.getUTCDate();
      const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3); // 0-3

      weeklyData[weekIndex].total += exp.amount;
      weeklyData[weekIndex].categories[exp.category] = 
        (weeklyData[weekIndex].categories[exp.category] || 0) + exp.amount;
    });

    console.log(`Weekly totals:`, weeklyData.map(w => `Week ${w.week}: ${w.total}`).join(', '));

    res.json({
      period,
      weeks: weeklyData
    });

  } catch (error) {
    console.error("Error fetching weekly spending:", error);
    res.status(500).json({ message: error.message });
  }
};

// Middleware export
exports.uploadMiddleware = upload.single("receipt");

// Export everything
module.exports = {
  uploadReceipt: exports.uploadReceipt,
  getBudgetOverview: exports.getBudgetOverview,
  setBudget: exports.setBudget,
  getExpensesByCategory: exports.getExpensesByCategory,
  getAllExpenses: exports.getAllExpenses,
  addManualExpense: exports.addManualExpense,
  getMonthlySpending: exports.getMonthlySpending,
  getWeeklySpending: exports.getWeeklySpending,
  uploadMiddleware: exports.uploadMiddleware,
  getExpensesByYear: exports.getExpensesByYear,
};