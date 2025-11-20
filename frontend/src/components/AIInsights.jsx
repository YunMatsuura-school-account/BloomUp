import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChild } from "../contexts/ChildContext";

const BulbIcon = ({ className = "w-14 h-14" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 56 56"
    className={className}
    fill="none"
  >
    <path
      d="M35 32.6667C35.4667 30.3334 36.6333 28.7 38.5 26.8334C40.8333 24.7334 42 21.7 42 18.6667C42 14.9537 40.525 11.3927 37.8995 8.76719C35.274 6.14168 31.713 4.66669 28 4.66669C24.287 4.66669 20.726 6.14168 18.1005 8.76719C15.475 11.3927 14 14.9537 14 18.6667C14 21 14.4667 23.8 17.5 26.8334C19.1333 28.4667 20.5333 30.3334 21 32.6667M21 42H35M23.3333 51.3334H32.6667"
      stroke="black"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AIInsights = () => {
  const { user } = useChild();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Check if AI insights have been shown for this session
  const hasShownInsights = () => {
    return sessionStorage.getItem("aiInsightsShown") === "true";
  };

  // Mark AI insights as shown
  const markInsightsShown = () => {
    sessionStorage.setItem("aiInsightsShown", "true");
  };

  // Load cached insights from sessionStorage
  const loadCachedInsights = () => {
    try {
      const cached = sessionStorage.getItem("aiInsightsData");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error("Error loading cached insights:", e);
    }
    return null;
  };

  // Store insights in sessionStorage
  const cacheInsights = (insightsData) => {
    try {
      sessionStorage.setItem("aiInsightsData", JSON.stringify(insightsData));
    } catch (e) {
      console.error("Error caching insights:", e);
    }
  };

  // Fetch AI insights
  const fetchInsights = async (forceRefresh = false) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const base = import.meta.env.VITE_BACKEND_URL || "";
      const now = new Date();
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toISOString();
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");
      const res = await fetch(
        `${base}/api/ai/insights/budget?userId=${
          user.id
        }&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
        {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const json = await res.json();
      setData(json);
      // Cache the insights
      cacheInsights(json);
      // Mark insights as shown after successful fetch
      markInsightsShown();
    } catch (e) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const cached = loadCachedInsights();
    const cachedHasBudget = (cached?.stats?.total || 0) > 0;

    if (cached) {
      setData(cached);
    }

    if (!cachedHasBudget) {
      fetchInsights(true);
    } else if (!hasShownInsights()) {
      markInsightsShown();
    }
  }, [user?.id]);

  // Handle Adjust Budget button click - refresh AI insights
  const handleAdjustBudget = () => {
    // Fetch fresh insights (force refresh)
    fetchInsights(true);
  };

  const top = data?.insights?.topSpending;
  const suggestions = data?.insights?.suggestions || [];
  const predictions = data?.insights?.predictions || [];
  const hasBudgetActivity = (data?.stats?.total || 0) > 0;
  const showEmptyState = !loading && !hasBudgetActivity;

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-medium text-black mb-3">
        AI Insight & Suggestion
      </h2>

      <div className="flex-1 bg-[#EFEFEF] rounded-[15px] p-6 flex flex-col min-h-0">
        <div className="flex-1 bg-white rounded-[20px] px-[45px] py-9 flex flex-col min-h-0 shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-6 flex-1">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#238D88]"></div>
              <p className="text-large font-medium text-black leading-7">
                Loading AI insights…
              </p>
            </div>
          ) : showEmptyState ? (
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="relative w-full max-w-3xl bg-white rounded-[32px] border border-gray-200 shadow-md overflow-hidden px-6 py-8 min-h-[420px] sm:min-h-[480px]">
                <div className="space-y-4 opacity-50 pointer-events-none select-none">
                  <div className="h-12 rounded-2xl bg-gradient-to-r from-[#F4F4F4] to-white border border-gray-200 flex items-center px-5 text-sm text-gray-400">
                    📊 This month’s top spending: Education (36%), up 12% from
                    last month.
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-[#FEFDF9] to-[#FBFBFB] px-5 py-4 flex flex-col gap-2">
                    <p className="text-base font-semibold text-gray-700">
                      💡 Suggestion
                    </p>
                    <p className="text-sm text-gray-500">
                      Consider lowering Consumables by 10% to balance next
                      month’s budget.
                    </p>
                  </div>
                  <button
                    disabled
                    className="h-12 rounded-2xl bg-gray-200 text-gray-500 font-semibold"
                  >
                    Refresh
                  </button>
                </div>

                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 bg-white rounded-[24px] border border-gray-200 shadow-[0_20px_45px_rgba(35,141,136,0.08)] px-8 py-10 flex flex-col items-center text-center gap-4">
                  <BulbIcon />
                  <h3 className="text-2xl font-semibold text-[#111111]">
                    AI Insight & Suggestions
                  </h3>
                  <p className="text-base text-[#4B4E57] max-w-md">
                    Once you add your first expenses, BloomUp will show smart
                    insights here.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard/budget")}
                    className="inline-flex items-center justify-center rounded-full bg-[#F3BE08] px-8 py-3 text-[#1C1C1C] font-semibold text-base leading-[22px] shadow-[0_10px_25px_rgba(243,190,8,0.35)] hover:bg-[#E0B108] transition-colors"
                  >
                    Budget Setup&nbsp;+
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-[44px] flex-1">
              {/* Main Content Section - Figma: gap 51px, height 437px */}
              <div className="flex flex-col items-center gap-[41px] w-full">
                {/* Title */}
                <h3 className="text-2xl font-semibold text-black leading-4 text-center w-full">
                  AI Insight & Suggestion
                </h3>

                {/* Top Spending Text */}
                {top ? (
                  <p className="text-large font-medium text-black leading-7 text-left w-full">
                    📊 This month's top spending: {top.category} ({top.percent}
                    %)
                    {typeof top.deltaFromLastMonth === "number"
                      ? `, ${
                          top.deltaFromLastMonth > 0 ? "up" : "down"
                        } ${Math.abs(top.deltaFromLastMonth)}% from last month.`
                      : "."}
                  </p>
                ) : (
                  <p className="text-large font-medium text-black leading-7 text-left w-full">
                    No insights available yet.
                  </p>
                )}

                {/* Suggestion & Prediction Cards - Figma: gap 20px */}
                <div className="flex flex-col items-center gap-5 w-full">
                  {suggestions.length > 0 && (
                    <div className="bg-[rgba(243,190,8,0.5)] rounded-[15px] py-5 px-[30px] w-full">
                      <div className="flex flex-col gap-1.5 w-full">
                        <p className="text-large font-medium text-black leading-7 w-full">
                          💡 Suggestion
                        </p>
                        {suggestions.map((s, idx) => (
                          <p
                            key={idx}
                            className="text-base font-medium text-black leading-[22.4px] w-full"
                          >
                            {s.text}
                            {s.percentChange != null
                              ? ` (${s.category}: ${
                                  s.percentChange > 0 ? "+" : ""
                                }${s.percentChange}%)`
                              : ""}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {predictions.length > 0 && (
                    <div className="bg-[rgba(243,190,8,0.5)] rounded-[15px] py-5 px-[30px] w-full">
                      <div className="flex flex-col gap-1.5 w-full">
                        <p className="text-large font-medium text-black leading-7 w-full">
                          🔮 Prediction
                        </p>
                        {predictions.map((p, idx) => (
                          <p
                            key={idx}
                            className="text-base font-medium text-black leading-[22.4px] w-full"
                          >
                            {p.text} {p.likelihood ? `(${p.likelihood})` : ""}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Adjust Budget Button - Figma: 461x54px, padding 15px 136px */}
              <button
                onClick={handleAdjustBudget}
                className="bg-[#238D88] text-white font-semibold text-base leading-[22.4px] py-[15px] px-[136px] rounded-[15px] hover:bg-[#1a6d68] transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
