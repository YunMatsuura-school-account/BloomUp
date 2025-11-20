import React, { useEffect, useMemo, useState } from "react";
import VaccinationDashboard from "./VaccinationDashboard";
import BudgetSummary from "./BudgetSummary";
import AIInsights from "./AIInsights";
import ScheduleCalendar from "./ScheduleCalendar";
import UpcomingEvents from "./UpcomingEvents";
import RecommendedArticles from "./RecommendedArticles";
import { useChild } from "../contexts/ChildContext";

const Dashboard = () => {
  const { selectedChild, user, loading } = useChild();
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Fetch both vaccination recommendations AND calendar events
  useEffect(() => {
    const fetchAllEvents = async () => {
      if (!user?.id) {
        setCalendarEvents([]);
        return;
      }

      try {
        const base = import.meta.env.VITE_BACKEND_URL || "";
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken");

        // Fetch vaccination recommendations (if child is selected)
        let vaccinationEvents = [];
        if (selectedChild?._id) {
          try {
            const vaccUrl = `${base}/api/users/${user.id}/children/${
              selectedChild._id
            }/vaccinations/recommendations${
              selectedChild.dateOfBirth
                ? `?birthDate=${encodeURIComponent(selectedChild.dateOfBirth)}`
                : ""
            }`;
            const vaccRes = await fetch(vaccUrl);
            if (vaccRes.ok) {
              const vaccData = await vaccRes.json();
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              vaccinationEvents = (vaccData?.recommendations || [])
                .filter((r) => {
                  if (!r?.recommendedDate) return false;
                  const vaccDate = new Date(r.recommendedDate);
                  vaccDate.setHours(0, 0, 0, 0);
                  // Only show future vaccinations
                  return vaccDate >= today;
                })
                .map((r) => ({
                  title: `${r.name} vaccination`,
                  date: r.recommendedDate,
                  type: "vaccination",
                  color: "#006F69", // Vaccination color
                }));
            }
          } catch (e) {
            console.error("Error fetching vaccinations:", e);
          }
        }

        // Fetch calendar events (all event types: custom events, appointments, etc.)
        let calendarEventList = [];
        try {
          // Calculate date range: 2 months back to 10 years ahead to include all vaccination dates
          const now = new Date();
          const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          const endDate = new Date(
            now.getFullYear() + 10,
            now.getMonth() + 3,
            0
          );

          const params = new URLSearchParams();
          params.set("start", startDate.toISOString());
          params.set("end", endDate.toISOString());
          if (selectedChild?._id) {
            params.set("child", selectedChild._id);
          }

          const calendarUrl = `${base}/api/calendar?${params.toString()}`;
          const calendarRes = await fetch(calendarUrl, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: "include",
          });

          if (calendarRes.ok) {
            const calendarData = await calendarRes.json();
            calendarEventList = (calendarData.events || []).map((ev) => ({
              title: ev.title || "Event",
              date: ev.startDate, // ScheduleCalendar expects 'date' field
              type: ev.category || "event",
              color: ev.color || "#F3BE08", // Default color for custom events
              _id: ev._id,
              endDate: ev.endDate,
              notes: ev.notes,
            }));
          }
        } catch (e) {
          console.error("Error fetching calendar events:", e);
        }

        // Combine both event types
        const allEvents = [...vaccinationEvents, ...calendarEventList];
        setCalendarEvents(allEvents);
      } catch (e) {
        console.error("Error fetching events:", e);
        setCalendarEvents([]);
      }
    };

    fetchAllEvents();
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
      <div className="px-4 lg:px-10 py-6">
        <div className="w-full max-w-[1728px] mx-auto space-y-10">
          {/* Row 1: Budget Summary & AI Insights */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="min-w-0">
              <BudgetSummary />
            </div>
            <div className="min-w-0">
              <AIInsights />
            </div>
          </div>

          {/* Row 2: Schedule & Upcoming Events */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="min-w-0">
              <ScheduleCalendar events={calendarEvents} />
            </div>
            <div className="min-w-0">
              <UpcomingEvents selectedChild={selectedChild} />
            </div>
          </div>

          {/* Row 3: Articles */}
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <RecommendedArticles />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
