import React from "react";

const AIInsights = () => {
  return (
    <div className="bg-white rounded-xl p-5">
      <div className="flex flex-col items-center gap-4">
        {/* Header & Main Insight */}
        <div className="flex flex-col items-center gap-4 w-full">
          <h3 className="text-lg font-semibold text-black text-center">
            AI Insight & Suggestion
          </h3>

          <p className="text-sm font-medium text-black leading-6">
            📊 This month's top spending: Education (36%), up 12% from last
            month.
          </p>

          {/* Suggestion & Prediction Cards */}
          <div className="flex flex-col items-center gap-3 w-full">
            {/* Suggestion Card */}
            <div className="bg-[rgba(243,190,8,0.5)] rounded-xl p-4 w-full">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-black">💡 Suggestion</p>
                <p className="text-xs font-medium text-black leading-5">
                  Consider lowering Consumables by 10% to balance next month's
                  budget.
                </p>
              </div>
            </div>

            {/* Prediction Card */}
            <div className="bg-[rgba(243,190,8,0.5)] rounded-xl p-4 w-full">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-black">🔮 Prediction</p>
                <p className="text-xs font-medium text-black leading-5">
                  Medical expenses may increase due to upcoming check-ups.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Adjust Budget Button */}
        <button className="bg-[#238D88] text-white font-semibold text-sm px-16 py-3 rounded-xl hover:bg-[#1a6d68] transition-colors w-full">
          Adjust Budget
        </button>
      </div>
    </div>
  );
};

export default AIInsights;
