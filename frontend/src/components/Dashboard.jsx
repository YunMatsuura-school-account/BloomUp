import React, { useEffect, useState } from "react";
import BudgetSummary from "./BudgetSummary";
import AIInsights from "./AIInsights";
import ScheduleCalendar from "./ScheduleCalendar";
import DashboardUpcomingEvents from "./DashboardUpcomingEvents";
import RecommendedArticles from "./RecommendedArticles";
import Loader from "./Loader";
import { useChild } from "../contexts/ChildContext";

const Dashboard = () => {
  const { selectedChild, user, loading, children } = useChild();
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

        // Fetch vaccination recommendations
        let vaccinationEvents = [];

        if (selectedChild?._id) {
          // Single child selected
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
              const childColor = selectedChild?.backgroundColor || "#006F69";
              vaccinationEvents = (vaccData?.recommendations || [])
                .filter((r) => {
                  if (!r?.recommendedDate) return false;
                  const vaccDate = new Date(r.recommendedDate);
                  vaccDate.setHours(0, 0, 0, 0);
                  return vaccDate >= today;
                })
                .map((r) => ({
                  title: `${r.name} vaccination`,
                  date: r.recommendedDate,
                  type: "vaccination",
                  color: childColor,
                }));
            }
          } catch (e) {
            console.error("Error fetching vaccinations:", e);
          }
        } else if (!selectedChild && children.length > 0) {
          // "All" children selected - fetch vaccinations for all children
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          for (const child of children) {
            try {
              const vaccUrl = `${base}/api/users/${user.id}/children/${
                child._id
              }/vaccinations/recommendations${
                child.dateOfBirth
                  ? `?birthDate=${encodeURIComponent(child.dateOfBirth)}`
                  : ""
              }`;
              const vaccRes = await fetch(vaccUrl);
              if (vaccRes.ok) {
                const vaccData = await vaccRes.json();
                const childColor = child.backgroundColor || "#006F69";
                const childVaccinations = (vaccData?.recommendations || [])
                  .filter((r) => {
                    if (!r?.recommendedDate) return false;
                    const vaccDate = new Date(r.recommendedDate);
                    vaccDate.setHours(0, 0, 0, 0);
                    return vaccDate >= today;
                  })
                  .map((r) => ({
                    title: `${child.name}: ${r.name}`,
                    date: r.recommendedDate,
                    type: "vaccination",
                    color: childColor,
                  }));
                vaccinationEvents = [
                  ...vaccinationEvents,
                  ...childVaccinations,
                ];
              }
            } catch (e) {
              console.error(
                `Error fetching vaccinations for ${child.name}:`,
                e
              );
            }
          }
        }

        // Fetch calendar events (all event types: custom events, appointments, etc.)
        let calendarEventList = [];
        try {
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
          // Only filter by child if a specific child is selected
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
            calendarEventList = (calendarData.events || []).map((ev) => {
              // Find the child for this event to get their color
              const eventChild = ev.child
                ? children.find(
                    (c) => c._id === ev.child || c._id === ev.child._id
                  )
                : null;
              const eventColor =
                selectedChild?.backgroundColor ||
                eventChild?.backgroundColor ||
                ev.color ||
                "#F3BE08";

              return {
                title: ev.title || "Event",
                date: ev.startDate,
                type: ev.category || "event",
                color: eventColor,
                _id: ev._id,
                endDate: ev.endDate,
                notes: ev.notes,
              };
            });
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
  }, [selectedChild, user?.id, children]);

  if (loading) {
    return <Loader />;
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
              <DashboardUpcomingEvents selectedChild={selectedChild} />
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
