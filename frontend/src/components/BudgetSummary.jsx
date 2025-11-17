import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetEmptyIcon = ({ className = "w-8 h-8 text-[#232527]" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className={className}
    fill="none"
  >
    <path
      d="M8.89016 17.6751C9.10252 17.9969 9.39357 18.2592 9.73572 18.437C10.0779 18.6149 10.4598 18.7023 10.8452 18.6912M10.8452 18.6912C11.3717 18.7378 11.8953 18.5748 12.3022 18.2377C12.7092 17.9005 12.9668 17.4164 13.0189 16.8905C12.97 16.3622 12.7138 15.8749 12.3064 15.535C11.8991 15.1951 11.3737 15.0304 10.8452 15.0769C10.3189 15.1198 9.7968 14.9535 9.39228 14.6139C8.98776 14.2744 8.7334 13.7891 8.68436 13.2633C8.73656 12.7398 8.99227 12.2577 9.39644 11.9209C9.8006 11.5841 10.3209 11.4195 10.8452 11.4626M10.8452 18.6912V19.9002M10.8452 11.4626C11.2313 11.4477 11.6145 11.5335 11.9573 11.7117C12.3001 11.8899 12.5906 12.1542 12.8003 12.4787M10.8452 11.4626V10.2536M18.2924 19.9002V16.0416M22.7942 19.9002V12.1829M2.21467 1.25H29.2253C29.2253 1.25 30.19 1.25 30.19 2.21467V5.43022C30.19 5.43022 30.19 6.39489 29.2253 6.39489H2.21467C2.21467 6.39489 1.25 6.39489 1.25 5.43022V2.21467C1.25 2.21467 1.25 1.25 2.21467 1.25Z"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.72 28.9039V23.4375M15.72 28.9039C16.7876 28.9039 17.6493 29.4827 17.6493 30.1901M15.72 28.9039C14.6524 28.9039 13.7907 29.4827 13.7907 30.1901M1.25 23.4375H30.19M3.17933 6.39502H28.2607V23.4375H3.17933V6.39502Z"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BudgetSummary = () => {
  const navigate = useNavigate();
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
        borderRadius: 8, // rounded corners for progress arc
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

  const showEmptyState =
    !loading &&
    Number(overview.total || 0) <= 0 &&
    Number(overview.spent || 0) <= 0 &&
    (!overview.categories || overview.categories.length === 0);

  return (
    <div className="space-y-[23px] h-full flex flex-col">
      <h2 className="text-lg font-medium text-black">Budget Summary</h2>
      <div className="flex flex-col gap-[23px] flex-1">
        {loading ? (
          <div className="flex-1 bg-white rounded-[15px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-[#238D88]">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#238D88]"></div>
              <p className="text-sm font-medium text-black">
                Loading budget summary…
              </p>
            </div>
          </div>
        ) : showEmptyState ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full bg-white rounded-[20px] border border-gray-200 shadow-sm px-8 py-10 flex flex-col items-center gap-6 text-center">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">
                Expenses for {monthLabel}
              </h3>
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-[#EDEDED]"></div>
                <div className="absolute inset-5 rounded-full border-[8px] border-[#F7F7F7]"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <p className="text-2xl font-semibold text-[#D4D4D4]">$0.00</p>
                  <div className="p-3 rounded-full bg-white shadow">
                    <BudgetEmptyIcon className="w-8 h-8 text-[#232527]" />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-semibold text-[#111111]">
                  No budget data yet
                </h4>
                <p className="text-sm text-[#6F717A]">
                  Try adding your first family budget activity!
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/budget")}
                className="inline-flex items-center justify-center rounded-full bg-[#F3BE08] px-8 py-3 text-[#1C1C1C] font-semibold text-base leading-[22px] shadow-[0_10px_25px_rgba(243,190,8,0.35)] hover:bg-[#E0B108] transition-colors"
              >
                Budget Setup&nbsp;+
              </button>
              <div className="grid grid-cols-2 gap-4 w-full max-w-md opacity-60">
                {["Education", "Medicine", "Consumable", "Misc"].map(
                  (label) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-gray-200 px-4 py-3 flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 rounded-full border-[6px] border-[#F0F0F0]"></div>
                      <p className="text-sm font-semibold text-gray-400">
                        $0.00
                      </p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-[#EFEFEF] rounded-[15px] p-6 flex flex-col gap-6">
            {/* Main Chart Card */}
            <div className="bg-white rounded-[15px] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-6">
                Expenses for {monthLabel}
              </h3>

              {/* Large Donut Chart - Full Circle */}
              <div className="flex justify-center items-center py-6">
                <div className="relative w-[280px] h-[280px]">
                  <Doughnut
                    data={budgetData}
                    options={chartOptions}
                    strokeLinecap="round"
                    style={{ transform: "rotate(222deg)" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-4xl font-bold text-black">
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

            {/* Category Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div
                  key={`${category.name}-${index}`}
                  className="bg-white rounded-[15px] p-5 shadow-sm flex flex-col items-center gap-0 relative min-h-[160px]"
                >
                  {/* Donut Background Ring with 30% gap at bottom */}
                  <div className="relative w-[130px] h-[130px] -mb-3">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 100"
                      style={{ transform: "rotate(157deg)" }}
                    >
                      {/* Background track (gray) - 70% of circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="10"
                        strokeDasharray="178 283"
                        strokeLinecap="round"
                      />
                      {/* Progress arc (teal) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#238D88"
                        strokeWidth="10"
                        strokeDasharray={`${
                          (categories[index]?.percent || 0) * 178
                        } 283`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 0.3s ease" }}
                      />
                    </svg>
                    {/* Center amount */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-lg font-bold text-black">
                        {category.amount}
                      </p>
                    </div>
                  </div>

                  {/* Category Name */}
                  <p className="text-lg font-bold text-black text-center -mt-3">
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetSummary;
