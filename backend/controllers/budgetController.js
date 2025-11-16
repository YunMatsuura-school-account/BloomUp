const Budget = require("../models/budget");
const Expense = require("../models/expense");
const CategoryAllocation = require("../models/CategoryAllocation");
const User = require("../models/User");
const mongoose = require("mongoose");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");
const RestockReminder = require('../models/RestockReminder'); 
const CalendarEvent = require('../models/calendarEvent'); 
const Reminder = require('../models/Reminder'); 
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



async function classifyChildProducts(productNames) {
  try {
   
    
    const prompt = `Analyze this list of products and identify which ones are typically used by or purchased for children aged 0-12 years old.

Products to classify:
${productNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

CHILD PRODUCTS (0-12 years) include:
- Baby essentials: diapers, formula, baby food, wipes, bottles, pacifiers
- Children's health: children's tylenol/advil, kids' vitamins, teething gel
- Kids' food: juice boxes, fruit pouches, kids' cereals, goldfish crackers, baby snacks
- School supplies: crayons, markers, notebooks, pencils, scissors, glue sticks
- Children's toiletries: kids' shampoo, children's toothpaste, bubble bath
- Baby care: baby lotion, diaper cream, baby powder
- Toys and games
- Children's clothing and shoes (kids sizes)
- Educational books and materials for children

DO NOT classify as child products:
- Regular groceries used by whole family (unless specifically marketed for kids)
- Adult medications and supplements
- Adult clothing and shoes
- Household cleaning products
- Adult personal care items
- Coffee, tea, alcohol
- Regular toiletries (unless marked "kids" or "children's")

IMPORTANT RULES:
- If product name contains "kids", "children's", "baby", "infant", "toddler" → true
- If product is specifically designed for ages 0-12 → true
- If it's a general household item used by everyone → false
- When uncertain, default to false (only include clear child products)

Return ONLY valid JSON in this exact format:
{
  "Product Name 1": true,
  "Product Name 2": false,
  "Product Name 3": true
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a product classifier specialized in identifying children's products (ages 0-12). Be strict: only classify items clearly designed for children. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.2, // Lower temperature for more consistent results
      response_format: { type: "json_object" }
    });

    // Log token usage for monitoring
    const usage = response.usage;
    console.log('\nCHILD PRODUCT CLASSIFICATION - TOKEN USAGE:');
    console.log(`  Products classified: ${productNames.length}`);
    console.log(`  Prompt tokens: ${usage.prompt_tokens}`);
    console.log(`  Completion tokens: ${usage.completion_tokens}`);
    console.log(`  Total tokens: ${usage.total_tokens}`);
    const inputCost = (usage.prompt_tokens / 1000000) * 0.150;
    const outputCost = (usage.completion_tokens / 1000000) * 0.600;
    const totalCost = inputCost + outputCost;
    console.log(`  Estimated cost: $${totalCost.toFixed(6)}`);

    const classifications = JSON.parse(response.choices[0].message.content);
    
    // Log results
    const childCount = Object.values(classifications).filter(v => v === true).length;
    console.log(`\n Classification complete: ${childCount} child products, ${productNames.length - childCount} excluded\n`);
    
    return classifications;

  } catch (error) {
    console.error(" Error classifying child products:", error);
    // On error, return empty object - won't filter anything (safe fallback)
    return {};
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
          role: "system",
          content: "You are a receipt analyzer that extracts information accurately. Always return valid JSON only."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract ONLY the physical products/services purchased in this EXACT JSON format:

{
  "merchantName": "store name",
  "totalAmount": 0.00,
  "date": "YYYY-MM-DD",
  "currency": "USD",
  "suggestedCategory": "Other",
  "items": [
    {
      "name": "item name",
      "quantity": 1,
      "unitPrice": 0.00,
      "amount": 0.00,
      "category": "Other"
    }
  ]
}

 CRITICAL EXTRACTION RULES - READ CAREFULLY:

1. ONLY EXTRACT PHYSICAL PRODUCTS OR SERVICES:
    Extract: Milk, Bread, Medicine, Clothing, Food items, Services
    DO NOT extract: Any line that is NOT a physical product

2. ABSOLUTELY IGNORE THESE (DO NOT ADD TO ITEMS ARRAY):
    Any discount (sale, coupon, promo, markdown, savings, "You saved")
    Any deposit (bottle, container, bag deposit)
    Any recycling fee (recycle, eco fee, environmental charge)
    Any tax (GST, PST, HST, VAT, sales tax, tax)
    Any service fee, delivery fee, tip, gratuity
    Any subtotal line
    Any "Total" or "Balance" line
    Any negative amounts (these are always discounts)
    Any weight/price calculation lines (e.g., "1.240 kg @ $9.50/kg", "2.5 lb @ $3.99/lb")
    Lines showing only weight, unit price, or price per kg/lb without product name

3. totalAmount = The FINAL amount customer paid (found near "Total", "Grand Total", "Amount Due")

4. For each PRODUCT item only:
   - name: Product name exactly as shown (e.g., "Milk 2L", "Aspirin 100ct", "Chicken Breast")
   - If you see weight pricing (e.g., "1.240 kg @ $9.50/kg"), look for the PRODUCT NAME above or nearby
   - quantity: Number of units purchased (default to 1 for weighted items)
   - unitPrice: Price per unit AFTER any item-level discounts are applied
   - amount: quantity × unitPrice (the actual amount paid for this item)
   - category: Medical, Education, Consumable, Clothes, Entertainment, Transport, or Other

5. IMPORTANT: If an item shows a discount, calculate the final price:
   - Example: "Milk $5.99 - $1.00 off = $4.99" → unitPrice: 4.99, amount: 4.99
   - The discount is already reflected in the price, DON'T add it as separate item

6. Category guide:
   - Medical: medicines, pharmacy, health products
   - Education: books, stationery, school supplies
   - Consumable: food, groceries, beverages, household items
   - Clothes: clothing, shoes, accessories
   - Entertainment: games, movies, subscriptions
   - Transport: fuel, tickets, parking
   - Other: everything else OR when uncertain

7. Main suggestedCategory = Most common category among extracted items

EXAMPLE - Canadian Grocery Receipt with Discount:
Receipt shows:
---
Milk 2L         $4.99 x2  $9.98
Bread           $3.49
Eggs            $4.29
Member Savings            -$2.00
Subtotal                  $15.76
GST                       $0.79
Total                     $16.55
---

CORRECT JSON (only 3 product items, discount is absorbed):
{
  "merchantName": "Loblaws",
  "totalAmount": 16.55,
  "date": "2024-03-15",
  "currency": "CAD",
  "suggestedCategory": "Consumable",
  "items": [
    {
      "name": "Milk 2L",
      "quantity": 2,
      "unitPrice": 4.99,
      "amount": 9.98,
      "category": "Consumable"
    },
    {
      "name": "Bread",
      "quantity": 1,
      "unitPrice": 3.49,
      "amount": 3.49,
      "category": "Consumable"
    },
    {
      "name": "Eggs",
      "quantity": 1,
      "unitPrice": 4.29,
      "amount": 4.29,
      "category": "Consumable"
    }
  ]
}

Notice: 
- Items total: $17.76
- Member Savings: -$2.00
- Subtotal after discount: $15.76
- Tax: $0.79
- Final total: $16.55
- We DON'T add discount or tax as items!
- The totalAmount reflects what was actually paid

Remember: The items array shows what was purchased. Discounts, taxes, deposits, and weight calculation lines are just calculations that lead to the final totalAmount. Don't include them as separate items.

IMPORTANT FOR WEIGHTED ITEMS:
- "Chicken Breast" followed by "1.240 kg @ $9.50/kg $11.78" = ONE item called "Chicken Breast" with amount $11.78
- "Bananas" followed by "2.5 lb @ $1.99/lb $4.98" = ONE item called "Bananas" with amount $4.98
- The weight/price line is NOT a separate item, it's just the pricing detail for the product above it`,
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
      max_tokens: 2000,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const usage = response.usage;
    console.log('\ TOKEN USAGE:');
    console.log('Prompt tokens:', usage.prompt_tokens);
    console.log('Completion tokens:', usage.completion_tokens);
    console.log('Total tokens:', usage.total_tokens);
    const inputCost = (usage.prompt_tokens / 1000000) * 0.150;
    const outputCost = (usage.completion_tokens / 1000000) * 0.600;
    const totalCost = inputCost + outputCost;
    console.log('Estimated cost: $' + totalCost.toFixed(6));

    const content = response.choices[0].message.content;
    let receiptData;

    try {
      receiptData = JSON.parse(content);
      
      // Validation: Ensure category is valid
      const validCategories = ["Medical", "Education", "Consumable", "Clothes", "Entertainment", "Transport", "Other"];
      if (!validCategories.includes(receiptData.suggestedCategory)) {
        console.warn(`Invalid category detected: ${receiptData.suggestedCategory}, defaulting to Other`);
        receiptData.suggestedCategory = "Other";
      }

      // Validate items
      if (!receiptData.items || receiptData.items.length === 0) {
        console.warn('No items found, creating default item');
        receiptData.items = [{
          name: receiptData.merchantName || "Unknown Item",
          quantity: 1,
          unitPrice: receiptData.totalAmount || 0,
          amount: receiptData.totalAmount || 0,
          category: receiptData.suggestedCategory
        }];
      }

      // Validate each item's category
      receiptData.items = receiptData.items.map(item => ({
        ...item,
        category: validCategories.includes(item.category) ? item.category : "Other"
      }));

      // Calculate items total
      const itemsTotal = receiptData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // Ensure totalAmount is set
      if (!receiptData.totalAmount || receiptData.totalAmount <= 0) {
        receiptData.totalAmount = itemsTotal;
      }

      
     
      const difference = receiptData.totalAmount - itemsTotal;
      const tolerance = 0.05; // 5 cent tolerance for rounding errors

      if (difference > tolerance) {
        // Only add Tax & Fees if total is higher than items
        
        
        receiptData.items.push({
          name: 'Tax & Fees',
          quantity: 1,
          unitPrice: difference,
          amount: difference,
          category: 'Other'
        });
        
        console.log(` Added Tax & Fees: ${difference.toFixed(2)}`);
      } else if (difference < -tolerance) {
        // Items total is higher than final total = discount was applied
        // DON'T add discount item, just log it
        console.log(`Discount detected and ignored: ${Math.abs(difference).toFixed(2)}`);
      }

      console.log('\nParsed Receipt Data:');
      console.log('Merchant:', receiptData.merchantName);
      console.log('Total Amount:', receiptData.totalAmount);
      console.log('Category:', receiptData.suggestedCategory);
      console.log('Items:', receiptData.items.length);
      receiptData.items.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.name} - Qty: ${item.quantity} - $${item.amount}`);
      });
      
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return res.status(500).json({
        message: "Failed to parse receipt data",
        rawResponse: content,
      });
    }

    // Create expenses array - one per item
    const expenses = receiptData.items.map(item => ({
      date: receiptData.date || new Date().toISOString().split("T")[0],
      description: item.name || "Unknown Item",
      category: item.category,
      amount: parseFloat(item.amount) || 0,
      quantity: parseInt(item.quantity) || 1,
      unitPrice: parseFloat(item.unitPrice) || 0
    }));

    console.log('\nCreated Expenses for Review:');
    expenses.forEach((exp, idx) => {
      console.log(`${idx + 1}. ${exp.description} - ${exp.category} - Qty: ${exp.quantity} - ${exp.amount}`);
    });
    
    res.json({
      message: "Receipt processed successfully",
      receiptData: {
        merchantName: receiptData.merchantName,
        totalAmount: receiptData.totalAmount,
        date: receiptData.date,
        currency: receiptData.currency,
        category: receiptData.suggestedCategory,
        items: receiptData.items,
        expenses: expenses, // Multiple expenses - one per item
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

//  addManualExpense function

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

    //  Extract productName and merchantName from request body
    const { amount, category, description, productName, merchantName, date, quantity } = req.body;

    if (!amount || !category) {
      return res
        .status(400)
        .json({ message: "Amount and category are required" });
    }

    // Parse date properly
    const expenseDate = date ? new Date(date) : new Date();
    

    
    let finalDescription;
    let finalMerchantName;
    
    if (productName) {
      // Receipt upload path: use productName for item, merchantName for store
      finalDescription = productName;
      finalMerchantName = merchantName || "Unknown Store";
      console.log(` Receipt item: ${finalDescription} from ${finalMerchantName}`);
    } else {
      // Manual entry path: use description for item
      finalDescription = description || "Unknown Item";
      finalMerchantName = merchantName || description || "Manual Entry";
      console.log(` Manual entry: ${finalDescription} at ${finalMerchantName}`);
    }
    
   
    // Create the expense
    const expense = new Expense({
      userId,
      amount: parseFloat(amount),
      category,
      description: finalDescription,      //  Product name - used for restock tracking
      merchantName: finalMerchantName,    // Store name - NOT product name
      quantity: quantity ? parseInt(quantity) : 1,
      date: expenseDate,
    });

    await expense.save();

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

    console.log(`Expense saved successfully with ID: ${expense._id}`);

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

    
    const { startDate, endDate } = getPeriodDateRange(period.month, period.year);
    
    

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
    
   
    
    // Get date range for entire year
    const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)); // Jan 1
    const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // Dec 31
    
    
    // Get all expenses for the year
    const expenses = await Expense.find({ 
      userId,
      date: { $gte: yearStart, $lte: yearEnd }
    }).sort({ date: -1 });

    

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

    console.log(`\n Getting expenses for period: ${period.month}/${period.year} ===`);
    
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
    
    //  Get category filter from query
    const categoryFilter = req.query.category;

    console.log(`\n=== Getting monthly spending for year: ${year} ===`);
    if (categoryFilter) {
      console.log(`Category filter: ${categoryFilter}`);
    }

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

    
    //  Fetch all budgets for the year with their allocations
    const budgets = await Budget.find({
      userId,
      'period.year': year
    }).sort({ 'period.month': 1 });

    console.log(`Found ${budgets.length} budgets for year ${year}`);

    // Create a budget lookup map (month -> budget data)
    const budgetMap = {};
    for (const budget of budgets) {
      const month = budget.period.month;
      
      // Get allocations for this budget
      const allocations = await CategoryAllocation.find({ 
        userId, 
        budget: budget._id 
      });

      budgetMap[month] = {
        total: budget.total,
        spent: budget.spent,
        remaining: budget.remaining,
        categories: allocations.reduce((acc, alloc) => {
          acc[alloc.category] = {
            allocated: alloc.allocatedAmount,
            percentage: alloc.percentage
          };
          return acc;
        }, {})
      };
    }

    // Initialize 12 months with empty data
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1, // 1-12
      total: 0,
      categories: {},
      budget: budgetMap[i + 1] || null //  Include budget for this month
    }));

    // Fill in the actual expense data
    expenses.forEach(exp => {
      const monthIndex = exp._id.month - 1; // Convert to 0-indexed
      monthlyData[monthIndex].total += exp.spent;
      monthlyData[monthIndex].categories[exp._id.category] = 
        (monthlyData[monthIndex].categories[exp._id.category] || 0) + exp.spent;
    });

    console.log(`Monthly totals:`, monthlyData.map(m => `${m.month}: ${m.total}`).join(', '));
    console.log(`Budgets available for months:`, Object.keys(budgetMap).join(', '));

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

    console.log(`\n Getting weekly spending for: ${period.month}/${period.year} ===`);

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


exports.getHistoricalBudgets = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

    console.log(`\n=== Fetching historical budgets for year: ${year} ===`);

    // Get all budgets for the specified year
    const budgets = await Budget.find({
      userId,
      'period.year': year
    }).sort({ 'period.month': 1 });

    console.log(`Found ${budgets.length} budgets for year ${year}`);

    // Create a map of month -> budget
    const budgetByMonth = {};
    
    for (const budget of budgets) {
      const month = budget.period.month;
      
      // Get allocations for this budget
      const allocations = await CategoryAllocation.find({ 
        userId, 
        budget: budget._id 
      });

      budgetByMonth[month] = {
        month: month,
        year: budget.period.year,
        total: budget.total,
        spent: budget.spent,
        remaining: budget.remaining,
        categories: allocations.map(alloc => ({
          name: alloc.category,
          allocated: alloc.allocatedAmount,
          percentage: alloc.percentage
        }))
      };
    }

    console.log(`Budget months found: ${Object.keys(budgetByMonth).join(', ')}`);

    res.json({
      year,
      budgets: budgetByMonth
    });

  } catch (error) {
    console.error("Error fetching historical budgets:", error);
    res.status(500).json({ message: error.message });
  }
};



// Get AI Insights & Suggestions
exports.getAIInsights = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const period = getCurrentPeriod();
    const { startDate, endDate } = getPeriodDateRange(period.month, period.year);

    // Get budget
    const budget = await Budget.findOne({ 
      userId, 
      'period.month': period.month,
      'period.year': period.year 
    });

    // Get expenses
    const expenses = await Expense.find({ 
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Get allocations
    const allocations = budget ? await CategoryAllocation.find({ userId, budget: budget._id }) : [];

    // Calculate category spending
    const categorySpending = {};
    expenses.forEach(exp => {
      if (!categorySpending[exp.category]) {
        categorySpending[exp.category] = 0;
      }
      categorySpending[exp.category] += exp.amount;
    });

    // Prepare data for AI
    const budgetData = {
      totalBudget: budget ? budget.total : 0,
      totalSpent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      categories: allocations.map(alloc => {
        const spent = categorySpending[alloc.category] || 0;
        return {
          name: alloc.category,
          allocated: alloc.allocatedAmount,
          spent: spent,
          percentage: alloc.allocatedAmount > 0 ? ((spent / alloc.allocatedAmount) * 100).toFixed(1) : 0
        };
      }),
      recentExpenses: expenses.slice(0, 10).map(exp => ({
        category: exp.category,
        amount: exp.amount,
        description: exp.merchantName,
        date: exp.date
      }))
    };

    // Create prompt for OpenAI
    const prompt = `Analyze this user's budget and spending data and provide actionable insights:

Budget Overview:
- Total Budget: $${budgetData.totalBudget}
- Total Spent: $${budgetData.totalSpent}
- Remaining: $${budgetData.totalBudget - budgetData.totalSpent}

Category Breakdown:
${budgetData.categories.map(cat => 
  `- ${cat.name}: Allocated $${cat.allocated}, Spent $${cat.spent} (${cat.percentage}%)`
).join('\n')}

Recent Expenses:
${budgetData.recentExpenses.map(exp => 
  `- ${exp.category}: $${exp.amount} at ${exp.description}`
).join('\n')}

Provide insights in this exact JSON format:
{
  "immediateAlerts": [
    {
      "title": "Alert title",
      "message": "Main alert message",
      "suggestion": "Actionable suggestion"
    }
  ],
  "budgetAlerts": [
    {
      "title": "Budget alert title",
      "message": "Budget status message",
      "suggestion": "What to do"
    }
  ],
  "predictiveAlerts": [
    {
      "title": "Prediction title",
      "message": "Future cost prediction",
      "suggestion": "How to prepare"
    }
  ],
  "smartShopping": [
    {
      "title": "Shopping tip title",
      "message": "Shopping opportunity or advice",
      "suggestion": "Action to take"
    }
  ]
}

Rules:
- Only include alerts/suggestions that are relevant and actionable
- Be specific with amounts and categories from the data
- If a category is over budget, include it in immediateAlerts
- If a category is at 80%+ of budget, include it in budgetAlerts
- Provide practical, money-saving suggestions
- If everything is good, provide 1-2 positive reinforcement messages
- Keep messages concise and clear`;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a financial advisor AI that provides clear, actionable budget insights. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Log token usage
    const usage = response.usage;
    console.log('\n AI INSIGHTS TOKEN USAGE:');
    console.log('Prompt tokens:', usage.prompt_tokens);
    console.log('Completion tokens:', usage.completion_tokens);
    console.log('Total tokens:', usage.total_tokens);
    const inputCost = (usage.prompt_tokens / 1000000) * 0.150;
    const outputCost = (usage.completion_tokens / 1000000) * 0.600;
    const totalCost = inputCost + outputCost;
    console.log('Estimated cost: $' + totalCost.toFixed(6));
    console.log('---\n');

    const insights = JSON.parse(response.choices[0].message.content);

    res.json({
      insights: insights,
      hasData: budget !== null && expenses.length > 0,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error generating AI insights:", error);
    res.status(500).json({ 
      message: "Failed to generate insights",
      error: error.message 
    });
  }
};


// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const { expenseId } = req.params;

    if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }

    // Find the expense first to get its details
    const expense = await Expense.findOne({ 
      _id: expenseId, 
      userId 
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Get the period for this expense
    const expenseDate = new Date(expense.date);
    const period = {
      month: expenseDate.getMonth() + 1,
      year: expenseDate.getFullYear()
    };

    // Delete the expense
    await Expense.findByIdAndDelete(expenseId);

    // Recalculate budget totals
    const { startDate, endDate } = getPeriodDateRange(period.month, period.year);

    const budget = await Budget.findOne({ 
      userId,
      'period.month': period.month,
      'period.year': period.year
    });

    if (budget) {
      // Recalculate total spent after deletion
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

      res.json({
        message: "Expense deleted successfully",
        budgetOverview: {
          total: budget.total,
          spent: budget.spent,
          remaining: budget.remaining,
          status: budget.remaining < 0 ? "Over budget" : "On track",
          period: period
        }
      });
    } else {
      res.json({
        message: "Expense deleted successfully",
        budgetOverview: null
      });
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      message: "Failed to delete expense",
      error: error.message,
    });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const { expenseId } = req.params;
    const { amount, category, description, date, quantity } = req.body;

    if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }

    // Find the expense
    const expense = await Expense.findOne({ 
      _id: expenseId, 
      userId 
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Store old date for budget recalculation
    const oldDate = new Date(expense.date);
    const oldPeriod = {
      month: oldDate.getMonth() + 1,
      year: oldDate.getFullYear()
    };

    // Update expense fields
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category !== undefined) expense.category = category;
    if (description !== undefined) {
      expense.description = description;
      expense.merchantName = description;
    }
    if (date !== undefined) expense.date = new Date(date);
    if (quantity !== undefined) expense.quantity = parseInt(quantity);

    await expense.save();

    // Get new period
    const newDate = new Date(expense.date);
    const newPeriod = {
      month: newDate.getMonth() + 1,
      year: newDate.getFullYear()
    };

    // Update budget for old period (if different from new period)
    if (oldPeriod.month !== newPeriod.month || oldPeriod.year !== newPeriod.year) {
      const oldRange = getPeriodDateRange(oldPeriod.month, oldPeriod.year);
      const oldBudget = await Budget.findOne({ 
        userId,
        'period.month': oldPeriod.month,
        'period.year': oldPeriod.year
      });

      if (oldBudget) {
        const oldExpenses = await Expense.aggregate([
          { 
            $match: { 
              userId,
              date: { $gte: oldRange.startDate, $lte: oldRange.endDate }
            } 
          },
          { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
        ]);

        const oldSpent = oldExpenses.length ? oldExpenses[0].totalSpent : 0;
        oldBudget.spent = oldSpent;
        oldBudget.remaining = oldBudget.total - oldSpent;
        await oldBudget.save();
      }
    }

    // Update budget for new period
    const newRange = getPeriodDateRange(newPeriod.month, newPeriod.year);
    const newBudget = await Budget.findOne({ 
      userId,
      'period.month': newPeriod.month,
      'period.year': newPeriod.year
    });

    let budgetOverview = null;
    if (newBudget) {
      const newExpenses = await Expense.aggregate([
        { 
          $match: { 
            userId,
            date: { $gte: newRange.startDate, $lte: newRange.endDate }
          } 
        },
        { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
      ]);

      const newSpent = newExpenses.length ? newExpenses[0].totalSpent : 0;
      newBudget.spent = newSpent;
      newBudget.remaining = newBudget.total - newSpent;
      await newBudget.save();

      budgetOverview = {
        total: newBudget.total,
        spent: newBudget.spent,
        remaining: newBudget.remaining,
        status: newBudget.remaining < 0 ? "Over budget" : "On track",
        period: newPeriod
      };
    }

    res.json({
      message: "Expense updated successfully",
      expense,
      budgetOverview
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      message: "Failed to update expense",
      error: error.message,
    });
  }
};





exports.getRestockItems = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    console.log('\n RESTOCK ITEMS REQUEST');
    console.log(`User ID: ${userId}`);

    // Optional: Allow override for debugging
    const showAllItems = req.query.showAll === 'true';
    
    if (showAllItems) {
      console.log(' Debug mode: Showing ALL items (filter disabled)');
    } else {
      console.log(' Child filter ACTIVE: Only showing items for ages 0-12');
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const query = {
      userId,
      date: { $gte: sixMonthsAgo }
    };

    const expenses = await Expense.find(query).sort({ date: 1 });
    console.log(`Found ${expenses.length} expenses in last 6 months`);

    if (expenses.length === 0) {
      return res.json({
        success: true,
        items: [],
        totalItems: 0,
        childItemsFilter: !showAllItems,
        message: "No expenses found in the last 6 months"
      });
    }

    // Group expenses by product name
    const productGroups = {};

    expenses.forEach(expense => {
      const productName = (expense.description || '').trim();
      if (!productName) return;
      
      const productKey = productName.toLowerCase();
      
      if (!productGroups[productKey]) {
        productGroups[productKey] = {
          productName: productName,
          category: expense.category || 'Other',
          purchases: []
        };
      }
      
      productGroups[productKey].purchases.push({
        date: expense.date,
        amount: expense.amount,
        quantity: expense.quantity || 1,
        expenseId: expense._id
      });
    });

    console.log(`Identified ${Object.keys(productGroups).length} unique products`);
    
console.log('\n DEBUG - All Product Names Found:');
Object.values(productGroups).forEach(group => {
  console.log(`  - "${group.productName}" (${group.purchases.length} purchases, category: ${group.category})`);
});
console.log('');

    const eligibleProducts = Object.entries(productGroups).filter(
      ([key, group]) => group.purchases.length >= 2
    );

    console.log(` ${eligibleProducts.length} products with recurring purchase patterns`);

    if (eligibleProducts.length === 0) {
      return res.json({
        success: true,
        items: [],
        totalItems: 0,
        childItemsFilter: !showAllItems,
        message: "No recurring purchases found. Items purchased at least twice will appear here."
      });
    }

    // Calculate restock patterns
    const restockItems = [];

    for (const [key, group] of eligibleProducts) {
      const intervals = [];
      for (let i = 1; i < group.purchases.length; i++) {
        const daysDiff = Math.floor(
          (new Date(group.purchases[i].date) - new Date(group.purchases[i - 1].date)) / 
          (1000 * 60 * 60 * 24)
        );
        intervals.push(daysDiff);
      }

      const averageInterval = Math.round(
        intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
      );

      if (averageInterval > 90) {
        continue;
      }

      const lastPurchase = group.purchases[group.purchases.length - 1];
      const daysSinceLastPurchase = Math.floor(
        (new Date() - new Date(lastPurchase.date)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastPurchase < averageInterval) {
        continue;
      }

      const status = 'NEEDS_RESTOCK';
      const nextRestockDate = new Date(lastPurchase.date);
      nextRestockDate.setDate(nextRestockDate.getDate() + averageInterval);

      const reminderPref = await RestockReminder.findOne({ 
        userId, 
        productName: group.productName 
      });

      restockItems.push({
        productName: group.productName,
        category: group.category,
        lastPurchaseDate: lastPurchase.date,
        lastPurchasedText: formatLastPurchased(daysSinceLastPurchase),
        daysSinceLastPurchase,
        averageIntervalDays: averageInterval,
        totalPurchases: group.purchases.length,
        status,
        nextRestockDate,
        daysUntilRestock: Math.ceil((nextRestockDate - new Date()) / (1000 * 60 * 60 * 24)),
        reminderEnabled: reminderPref ? reminderPref.enabled : false
      });
    }

    console.log(` ${restockItems.length} items need restocking`);

    //  AI-POWERED CHILD FILTER (DEFAULT: ON)
    let filteredItems = [];
    let unfilteredCount = restockItems.length;
    
    if (!showAllItems && restockItems.length > 0) {
      console.log('\nAI FILTERING FOR CHILD ITEMS ');
      
      const productNames = restockItems.map(item => item.productName);
      const classifications = await classifyChildProducts(productNames);
      
      filteredItems = restockItems.filter(item => {
        const isChildProduct = classifications[item.productName] === true;
        
        if (isChildProduct) {
          console.log(` INCLUDED: ${item.productName} (${item.category})`);
        } else {
          console.log(`EXCLUDED: ${item.productName} (${item.category}) - Not a child item`);
        }
        
        return isChildProduct;
      });
      
      console.log(`\n FINAL RESULT: ${filteredItems.length} child products (filtered out ${unfilteredCount - filteredItems.length} non-child items)`);
    } else {
      filteredItems = restockItems;
      if (showAllItems) {
        console.log('  Returning ALL items (debug mode)\n');
      }
    }

    const statusPriority = { 
      'OVERDUE': 1, 
      'DUE_SOON': 2, 
      'ON_TRACK': 3, 
      'RECENTLY_BOUGHT': 4
    };
    filteredItems.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

    res.json({
      success: true,
      items: filteredItems,
      totalItems: filteredItems.length,
      childItemsFilter: !showAllItems,
      unfilteredCount: showAllItems ? null : unfilteredCount,
      message: filteredItems.length === 0 
        ? "No child items (0-12 age) need restocking at this time"
        : `Found ${filteredItems.length} child items that need restocking`
    });

  } catch (error) {
    console.error(" Error getting restock items:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get restock items",
      error: error.message 
    });
  }
};
// Toggle restock reminder for a product
exports.toggleRestockReminder = async (req, res) => {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const userId = toObjectId(rawUserId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const { productName, enabled, nextRestockDate, alertType, customDays } = req.body;

   

    if (!productName) {
      return res.status(400).json({ message: "Product name is required" });
    }

    //  Map alert types to match Reminder model enum
    const alertTypeMap = {
      'None': 'None',
      '5 minutes before': '5 minutes before',
      '15 minutes before': '15 minutes before',
      '1 hour before': '1 hour before',
      '1 day before': '1 day before',
      '2 Weeks before': '2 Weeks before',
      '3 Weeks before': '3 Weeks before',
      'At time of event': 'At time of event',
      'Custom': 'Custom'
    };
    
    let finalAlertType = alertTypeMap[alertType] || 'At time of event';
    
    // If None, use default
    if (finalAlertType === 'None' || !alertType) {
      finalAlertType = '1 day before'; // Better default for restock reminders
    }
    
 

    // Find or create reminder preference
    let reminderPref = await RestockReminder.findOne({ userId, productName });

    if (reminderPref) {
      reminderPref.enabled = enabled;
      reminderPref.nextRestockDate = nextRestockDate;
      reminderPref.alertType = finalAlertType;
      reminderPref.customDays = customDays || null;
      await reminderPref.save();
      console.log(' Updated existing reminder preference');
    } else {
      reminderPref = new RestockReminder({
        userId,
        productName,
        enabled,
        nextRestockDate, 
        alertType: finalAlertType,
        customDays: customDays || null
      });
      await reminderPref.save();
      
    }

    //  IMPORTANT: Only handle notification reminders (NO calendar events)
    if (enabled && nextRestockDate) {
    
      
      try {
        // Clean up any OLD calendar events (from previous version)
        const deletedEvents = await CalendarEvent.deleteMany({
          userId,
          title: ` Restock: ${productName}`
        });
        if (deletedEvents.deletedCount > 0) {
          
        }
        
        // Clean up any existing notification reminders
        const deletedReminders = await Reminder.deleteMany({
          userId,
          eventTitle: `Restock: ${productName}`
        });
        if (deletedReminders.deletedCount > 0) {
          console.log(` Deleted ${deletedReminders.deletedCount} old reminders`);
        }

        // CREATE NOTIFICATION REMINDER ONLY (no calendar event)
        const eventDate = new Date(nextRestockDate);
        // Set to noon to avoid timezone issues
        eventDate.setUTCHours(12, 0, 0, 0);
        
    
        
        const notificationReminder = new Reminder({
          userId,
          eventId: null, //  NO calendar event - standalone reminder
          eventTitle: ` Restock: ${productName}`,
          eventDate: eventDate,
          alert: finalAlertType,
          customAlert: finalAlertType === 'Custom',
          customDays: customDays || null,
          isRead: false,
          isSent: false
        });
        
        await notificationReminder.save();
        
        
        
      } catch (eventError) {
        console.error(' Error creating reminder:', eventError);
        throw eventError;
      }
      
    } else if (!enabled) {
     
      
      try {
        // Clean up calendar events (if any exist from old version)
        const deletedEvents = await CalendarEvent.deleteMany({
          userId,
          title: ` Restock: ${productName}`
        });
        if (deletedEvents.deletedCount > 0) {
        
        }
        
        // Clean up notification reminders
        const deletedReminders = await Reminder.deleteMany({
          userId,
          eventTitle: ` Restock: ${productName}`
        });
        
        
      } catch (deleteError) {
        console.error(' Error deleting reminders:', deleteError);
        throw deleteError;
      }
    } else {
      console.log('Reminder not enabled or no date provided');
      
    }



    res.json({
      success: true,
      message: enabled 
        ? ' Restock reminder set! Check the Reminders tab in your notifications.' 
        : ' Restock reminder disabled',
      reminder: {
        productName: reminderPref.productName,
        enabled: reminderPref.enabled,
        nextRestockDate: reminderPref.nextRestockDate,
        alertType: reminderPref.alertType,
        customDays: reminderPref.customDays
      }
    });

  } catch (error) {
    console.error('\n ERROR in toggleRestockReminder:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: "Failed to toggle restock reminder",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
function formatLastPurchased(days) {
  if (days === 0) return 'item today';
  if (days === 1) return 'item 1 day ago';
  if (days < 7) return `item ${days} days ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return 'item 1 week ago';
  if (weeks < 4) return `item ${weeks} weeks ago`;
  
  const months = Math.floor(days / 30);
  if (months === 1) return 'item 1 month ago';
  return `item ${months} months ago`;
}


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
  getHistoricalBudgets: exports.getHistoricalBudgets,
  uploadMiddleware: exports.uploadMiddleware,
  getExpensesByYear: exports.getExpensesByYear,
   getAIInsights: exports.getAIInsights, 
   deleteExpense: exports.deleteExpense,
  updateExpense: exports.updateExpense,

  getRestockItems: exports.getRestockItems, // NEW
  toggleRestockReminder: exports.toggleRestockReminder, // NEW
};