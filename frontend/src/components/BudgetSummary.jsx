import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import AIInsights from "./AIInsights";

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetSummary = () => {
  // Dummy budget data
  const budgetData = {
    labels: ["Medicine", "Education", "Groceries", "Consumables"],
    datasets: [
      {
        data: [2456.76, 2456.76, 2456.76, 2456.76],
        backgroundColor: ["#238D88", "#6CC31F", "#F3BE08", "#E2E2E2"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    cutout: "70%",
    maintainAspectRatio: true,
    responsive: true,
  };

  const categories = [
    { name: "Medicine", amount: "$2,456.76", color: "#238D88" },
    { name: "Education", amount: "$2,456.76", color: "#6CC31F" },
    { name: "Groceries", amount: "$2,456.76", color: "#F3BE08" },
    { name: "Consumable", amount: "$2,456.76", color: "#E2E2E2" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-white">Budget Summary</h2>

      <div className="grid grid-cols-1 gap-4">
        {/* Budget Chart Section */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="text-xs font-medium text-black mb-4">
            Expenses for Sep, 2025
          </h3>

          {/* Chart Container */}
          <div className="flex justify-center items-center mb-4">
            <div className="relative w-32 h-32">
              <Doughnut data={budgetData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-medium text-black">$34,560.34</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-white rounded-xl p-4 flex flex-col items-center justify-end gap-4 h-[90px]"
            >
              <div className="flex flex-col items-center gap-4 relative">
                {/* Circular Icon Background */}
                <div
                  className="absolute top-0 w-[90px] h-[90px] rounded-full opacity-20"
                  style={{ backgroundColor: category.color }}
                ></div>

                {/* Amount & Label */}
                <div className="relative z-10 flex flex-col items-center pt-6">
                  <p className="text-sm font-medium text-black">
                    {category.amount}
                  </p>
                  <p className="text-sm font-semibold text-black">
                    {category.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights />
    </div>
  );
};

export default BudgetSummary;
