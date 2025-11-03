import React, { useEffect, useMemo, useState } from "react";
import VaccinationDashboard from "./VaccinationDashboard";
import BudgetSummary from "./BudgetSummary";
import AIInsights from "./AIInsights";
import ScheduleCalendar from "./ScheduleCalendar";
import UpcomingEvents from "./UpcomingEvents";
import RecommendedArticles from "./RecommendedArticles";
import Header from "./Header";
import { useChild } from "../contexts/ChildContext";

const Dashboard = () => {
  const { selectedChild, user, loading } = useChild();
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Fetch vaccination recommendations to feed calendar events
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedChild || !user?.id) {
        setCalendarEvents([]);
        return;
      }
      try {
        const base = import.meta.env.VITE_BACKEND_URL || "";
        const url = `${base}/api/users/${user.id}/children/${
          selectedChild._id
        }/vaccinations/recommendations${
          selectedChild.dateOfBirth
            ? `?birthDate=${encodeURIComponent(selectedChild.dateOfBirth)}`
            : ""
        }`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        const data = await res.json();
        const mapped = (data?.recommendations || [])
          .filter((r) => r?.recommendedDate)
          .map((r) => ({
            title: `${r.name} vaccination`,
            date: r.recommendedDate,
            type: "vaccination",
          }));
        setCalendarEvents(mapped);
      } catch (e) {
        setCalendarEvents([]);
      }
    };
    fetchRecommendations();
  }, [selectedChild, user?.id]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* Header Component */}
      <Header />

      <div className="px-6 py-5">
        <div className="w-full max-w-[95%] 2xl:max-w-[1600px] mx-auto space-y-8">
          {/* Row 1: Budget (left) + AI Insights (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <BudgetSummary />
            </div>
            <div>
              <AIInsights />
            </div>
          </div>

          {/* Row 2: Calendar (left) + Upcoming Events (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ScheduleCalendar events={calendarEvents} />
            </div>
            <div>
              <UpcomingEvents selectedChild={selectedChild} />
            </div>
          </div>

          {/* Row 3: Articles full width */}
          <div>
            <RecommendedArticles />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
