import React, { useEffect, useState } from "react";
import { useChild } from "../contexts/ChildContext";

const AIInsights = () => {
  const { user } = useChild();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const run = async () => {
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
      } catch (e) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  const top = data?.insights?.topSpending;
  const suggestions = data?.insights?.suggestions || [];
  const predictions = data?.insights?.predictions || [];

  return (
    <div className="space-y-5 h-full flex flex-col">
      <h2 className="text-lg font-medium text-black">
        AI Insight & Suggestion
      </h2>

      <div className="bg-white rounded-2xl py-9 px-[45px] flex-1 flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-6 flex-1">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#238D88]"></div>
            <p className="text-large font-medium text-black leading-7">
              Loading AI insights…
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-[44px]">
            {/* Main Content Section - Figma: gap 51px, height 437px */}
            <div className="flex flex-col items-center gap-[41px] w-full">
              {/* Title */}
              <h3 className="text-2xl font-semibold text-black leading-4 text-center w-full">
                AI Insight & Suggestion
              </h3>

              {/* Top Spending Text */}
              {top ? (
                <p className="text-large font-medium text-black leading-7 text-left w-full">
                  📊 This month's top spending: {top.category} ({top.percent}%)
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
            <button className="bg-[#238D88] text-white font-semibold text-base leading-[22.4px] py-[15px] px-[136px] rounded-[15px] hover:bg-[#1a6d68] transition-colors">
              Adjust Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
