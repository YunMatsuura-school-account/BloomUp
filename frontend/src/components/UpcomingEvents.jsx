// frontend/src/components/UpcomingEvents.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CalendarIcon = ({ className = "w-7 h-7" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="30"
    viewBox="0 0 28 30"
    fill="none"
    className={className}
  >
    <path
      d="M8.125 1.25V6.75M19.125 1.25V6.75M1.25 12.25H26M4 4H23.25C24.7688 4 26 5.23122 26 6.75V26C26 27.5188 24.7688 28.75 23.25 28.75H4C2.48122 28.75 1.25 27.5188 1.25 26V6.75C1.25 5.23122 2.48122 4 4 4Z"
      stroke="#232527"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UpcomingEvents = ({ selectedChild }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_BACKEND_URL || "";
        const now = new Date();
        const start = now.toISOString();
        const params = new URLSearchParams();
        params.set("start", start);
        if (selectedChild?._id) params.set("child", selectedChild._id);

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken");

        console.log("Fetching events with params:", params.toString()); // Debug log

        const resp = await fetch(`${base}/api/calendar?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        console.log("Response status:", resp.status); // Debug log

        let json = {};
        try {
          json = await resp.json();
          console.log("Response data:", json); // Debug log
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
        }

        if (!resp.ok) {
          console.error("API Error:", json);
          throw new Error(
            json?.message || `HTTP ${resp.status}: Failed to load events`
          );
        }

        const future = (json.events || [])
          .filter((e) => e?.startDate && new Date(e.startDate) >= now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 3);
        setEvents(future);
      } catch (e) {
        console.error("Error fetching upcoming events:", e);

        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, [selectedChild?._id]);

  const formatRange = (startISO, endISO) => {
    if (!startISO) return "";
    const s = new Date(startISO);
    const e = endISO ? new Date(endISO) : null;

    const formatDateTime = (d) => {
      const month = d.toLocaleString("en-US", { month: "short" });
      const day = String(d.getDate()).padStart(2, "0");
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;

      return `${month} ${day} ${displayHours}:${minutes} ${ampm}`;
    };

    return e
      ? `${formatDateTime(s)} ~ ${formatDateTime(e)}`
      : formatDateTime(s);
  };

  const derived = useMemo(() => {
    return (events || []).map((ev) => {
      const initial = (ev.type || ev.title || "E")
        .trim()
        .charAt(0)
        .toUpperCase();
      let color = ev.color || "#F3BE08";
      if (!ev.color && typeof ev.type === "string") {
        const t = ev.type.toLowerCase();
        if (t.includes("vaccination")) color = "#006F69";
        else color = "#F3BE08";
      }
      return {
        id: ev._id,
        titleTop: ev.title || ev.type || "Event",
        titleBottom: ev.category || "",
        description: ev.notes || "",
        rangeText: formatRange(ev.startDate, ev.endDate),
        initial,
        color,
      };
    });
  }, [events]);

  return (
    <div className="space-y-5 h-full flex flex-col">
      <h2 className="text-lg font-medium text-black">Upcoming Events</h2>

      <div className="space-y-3 flex-1">
        {loading && (
          <div className="bg-white rounded-xl p-3 text-sm text-gray-600">
            Loading…
          </div>
        )}

        {!loading && derived.length === 0 && (
          <div className="bg-white rounded-[20px] border-2 border-dashed border-[#F3BE08] px-6 py-8 flex flex-col items-center text-center gap-4">
            <CalendarIcon className="w-7 h-7" />
            <div>
              <h3 className="text-lg font-semibold text-[#232527] mb-2">
                No upcoming events yet!
              </h3>
              <p className="text-sm text-[#6F717A]">
                Start by adding events to see here.
              </p>
            </div>
            <button
              onClick={() => navigate("/calendar")}
              className="inline-flex items-center justify-center rounded-full bg-[#F3BE08] px-6 py-2.5 text-[#1C1C1C] font-semibold text-sm leading-[22px] shadow-[0_8px_20px_rgba(243,190,8,0.3)] hover:bg-[#E0B108] transition-colors"
            >
              Add Event&nbsp;&nbsp;+
            </button>
          </div>
        )}

        {!loading &&
          derived.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-black text-right">
                  {event.rangeText}
                </p>
                <div className="flex gap-3">
                  <div
                    className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.initial}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-black leading-[18px]">
                      {event.titleTop}
                      {event.titleBottom && (
                        <>
                          <br />
                          {event.titleBottom}
                        </>
                      )}
                    </h3>
                    {event.description && (
                      <p className="text-xs font-normal text-black leading-4 mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;
