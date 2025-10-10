// Default: empty object, meaning no budgets set yet
let monthlyBudgets = {};

exports.getBudget = (req, res) => {
  res.json(monthlyBudgets);
};

exports.updateBudget = (req, res) => {
  const { month, amount } = req.body;

  if (!month || !amount || isNaN(amount)) {
    return res.status(400).json({ message: "Please provide a valid month and number." });
  }

  // If no value exists for the month, default is 0
  monthlyBudgets[month] = Number(amount);

  res.json({
    message: `Budget for ${month} updated`,
    monthlyBudgets
  });
};
