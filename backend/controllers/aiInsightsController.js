const { getOpenAI } = require("../services/openaiClient");
const Expense = require("../models/expense");

function computeCategoryStats(expenses) {
  const totals = {};
  let sum = 0;
  for (const e of expenses) {
    const category = e.category || "Other";
    const amount = Number(e.amount || 0);
    totals[category] = (totals[category] || 0) + amount;
    sum += amount;
  }
  const categories = Object.entries(totals)
    .map(([category, total]) => ({
      category,
      total,
      percent: sum > 0 ? +((100 * total) / sum).toFixed(2) : 0,
    }))
    .sort((a, b) => b.total - a.total);
  return { categories, total: sum };
}

exports.getBudgetInsights = async (req, res) => {
  try {
    const { userId, start, end } = req.query;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "userId required" });

    // Match schema: backend/models/expense.js uses userId
    const filter = { userId };
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }

    const expenses = await Expense.find(filter).lean();
    const stats = computeCategoryStats(expenses);

    const system =
      "You are a concise finance assistant. Respond ONLY as strict JSON with fields: topSpending, suggestions, predictions.";
    const prompt = {
      stats,
      instructions: [
        "Identify the top spending category with percent and month-over-month delta if inferable.",
        "Provide 1-3 specific suggestions to balance next month’s budget (each with category and percentChange).",
        "Provide 1-2 predictions with short rationale (e.g., upcoming checkups may increase medical).",
      ],
      outputShape: {
        topSpending: {
          category: "string",
          percent: "number",
          deltaFromLastMonth: "number|null",
        },
        suggestions: [
          { text: "string", category: "string", percentChange: "number" },
        ],
        predictions: [{ text: "string", likelihood: "low|medium|high" }],
      },
    };

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(prompt) },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content;
    let parsed = {};
    try {
      parsed = JSON.parse(content || "{}");
    } catch {}

    return res.json({ success: true, stats, insights: parsed });
  } catch (err) {
    console.error("AI insights error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate insights" });
  }
};
