import React from "react";
import VaccinationDashboard from "./VaccinationDashboard";
import BudgetSummary from "./BudgetSummary";
import AIInsights from "./AIInsights";
import ScheduleCalendar from "./ScheduleCalendar";
import UpcomingEvents from "./UpcomingEvents";
import RecommendedArticles from "./RecommendedArticles";
import { useChild } from "../contexts/ChildContext";

const Dashboard = () => {
  const { selectedChild, user, loading } = useChild();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF] p-5">
      {/* Vaccination Recommendations - Full Width Below */}
      {selectedChild && (
        <div className="max-w-[1400px] mx-auto mt-6">
          <VaccinationDashboard
            key={selectedChild._id}
            childId={selectedChild._id}
            userId={user?.id}
            childDateOfBirth={selectedChild.dateOfBirth}
          />
        </div>
      )}
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1400px] mx-auto">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Budget Summary & AI Insights */}
          <BudgetSummary />

          {/* Schedule Calendar */}
          <ScheduleCalendar />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <UpcomingEvents selectedChild={selectedChild} />

          {/* Recommended Articles */}
          <RecommendedArticles />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
