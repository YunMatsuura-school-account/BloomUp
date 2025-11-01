import React, { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetSummary = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState({
    total: 0,
    spent: 0,
    remaining: 0,
    categories: [],
  });

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_BACKEND_URL || "";
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("authToken");
        // Current month range
        const now = new Date();
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ).toISOString();
        const end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        ).toISOString();
        const resp = await fetch(
          `${base}/api/budget/overview?start=${encodeURIComponent(
            start
          )}&end=${encodeURIComponent(end)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: "include",
          }
        );
        let json = {};
        try {
          json = await resp.json();
        } catch {}
        if (!resp.ok)
          throw new Error(json?.message || "Failed to load budget overview");
        setOverview({
          total: Number(json.total || 0),
          spent: Number(json.spent || 0),
          remaining: Number(json.remaining || 0),
          categories: Array.isArray(json.categories) ? json.categories : [],
        });
      } catch (e) {
        setOverview({ total: 0, spent: 0, remaining: 0, categories: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const categoryAmounts = useMemo(() => {
    const cats = overview.categories || [];
    if (!cats.length) return [0, 0, 0, 0];
    // Take top 4 categories by spent
    const top = [...cats]
      .sort((a, b) => (b.spent || 0) - (a.spent || 0))
      .slice(0, 4);
    // Pad to 4 entries
    while (top.length < 4) top.push({ name: "", spent: 0 });
    return top.map((c) => Number(c.spent || 0));
  }, [overview.categories]);

  const budgetData = {
    labels: ["Spent", "Remaining"],
    datasets: [
      {
        data: [
          Math.max(overview.spent, 0),
          Math.max(overview.total - overview.spent, 0),
        ],
        backgroundColor: ["#238D88", "#E5E7EB"],
        hoverBackgroundColor: ["#238D88", "#E5E7EB"],
        borderColor: "transparent",
        borderWidth: 0,
        spacing: 0,
        hoverOffset: 0,
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
    cutout: "85%", // thin donut ring per Figma
    maintainAspectRatio: true,
    responsive: true,
    elements: {
      arc: {
        borderWidth: 0, // no bold edges
      },
    },
  };

  const monthLabel = useMemo(() => {
    const d = new Date();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${month}, ${year}`;
  }, []);

  // Build 4 category cards from overview
  const categories = useMemo(() => {
    const formatted = (overview.categories || [])
      .map((c) => {
        const spent = Number(c.spent || 0);
        const allocated = Number(c.allocated || 0);
        const denom =
          allocated > 0 ? allocated : Number(overview.total || 0) || 1;
        const pct = Math.max(0, Math.min(1, spent / denom));
        return {
          name: c.name,
          amount: `$${spent.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          percent: pct,
          color: "#238D88",
        };
      })
      .sort(
        (a, b) =>
          Number(b.amount.replace(/[^0-9.]/g, "")) -
          Number(a.amount.replace(/[^0-9.]/g, ""))
      )
      .slice(0, 4);
    while (formatted.length < 4)
      formatted.push({
        name: "",
        amount: "$0.00",
        percent: 0,
        color: "#238D88",
      });
    return formatted;
  }, [overview.categories]);

  return (
    <div className="space-y-[23px] h-full flex flex-col">
      <h2 className="text-lg font-medium text-black">Budget Summary</h2>

      <div className="flex flex-col gap-[23px] flex-1">
        {/* Budget Chart Section - Figma: 609x320px */}
        <div className="bg-white rounded-[15px] py-[15px] px-5 pb-[18px] h-80">
          <h3 className="text-xs font-medium text-black leading-4 mb-[35px]">
            Expenses for {monthLabel}
          </h3>

          {/* Chart Container - Exact Figma sizing: 178x178px */}
          <div className="flex justify-center items-center">
            <div className="relative w-[178px] h-[178px]">
              <Doughnut data={budgetData} options={chartOptions} />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-medium text-black leading-4">
                  $
                  {overview.spent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Cards Grid - Figma: 609x320px container, 2x2 grid */}
        <div className="grid grid-cols-2 gap-y-[18px] gap-x-[10px] h-80">
          {categories.map((category, index) => (
            <div
              key={`${category.name}-${index}`}
              className="bg-white rounded-[15px] px-[18px] py-[3px] flex items-center justify-center relative overflow-hidden"
            >
              {/* Donut Background - progress ring using conic-gradient */}
              <div
                className="absolute w-[118px] h-[118px] rounded-full left-1/2 -translate-x-1/2 top-0"
                style={{
                  background: `conic-gradient(#238D88 ${Math.round(
                    (categories[index]?.percent || 0) * 360
                  )}deg, #E5E7EB 0deg)`,
                }}
              ></div>
              {/* Donut inner cutout to create ring */}
              <div className="absolute w-[86px] h-[86px] rounded-full bg-white left-1/2 -translate-x-1/2 top-[16px]"></div>

              {/* Content Container - Figma: 118x118px with specific padding */}
              <div className="relative z-10 w-[118px] h-[118px] flex flex-col items-center justify-end gap-[30px] pt-[15px] px-6 pb-2">
                <p className="text-base font-medium text-black leading-4">
                  {category.amount}
                </p>
                <p className="text-base font-semibold text-black leading-4">
                  {category.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;
