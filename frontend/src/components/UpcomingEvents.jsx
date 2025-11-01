import React, { useEffect, useMemo, useState } from "react";

// Fetch and display next 3 upcoming events for the selected child
const UpcomingEvents = ({ selectedChild }) => {
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
        // Include child filter if available
        if (selectedChild?._id) params.set("child", selectedChild._id);

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken");

        const resp = await fetch(`${base}/api/calendar?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        let json = {};
        try {
          json = await resp.json();
        } catch {}

        if (!resp.ok) throw new Error(json?.message || "Failed to load events");

        // Sort future events and take next 3
        const future = (json.events || [])
          .filter((e) => e?.startDate && new Date(e.startDate) >= now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 3);
        setEvents(future);
      } catch (e) {
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
    const fmt = (d) =>
      `${d.toLocaleString("en-US", { month: "short" })} ${String(
        d.getDate()
      ).padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    return e ? `${fmt(s)} ~ ${fmt(e)}` : fmt(s);
  };

  const derived = useMemo(() => {
    return (events || []).map((ev) => {
      const initial = (ev.type || "E").trim().charAt(0).toUpperCase();
      // Color priority: explicit color -> by type
      let color = ev.color || "#F3BE08";
      if (!ev.color && typeof ev.type === "string") {
        const t = ev.type.toLowerCase();
        if (t.includes("vaccination")) color = "#006F69"; // vaccination green
        else color = "#F3BE08"; // default/school yellow
      }
      return {
        id: ev._id,
        titleTop: ev.type || "Event",
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
          <div className="bg-white rounded-xl p-3 text-sm text-gray-600">
            No upcoming events
          </div>
        )}

        {!loading &&
          derived.map((event) => (
            <div key={event.id} className="bg-white rounded-xl p-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-black text-right">
                  {event.rangeText}
                </p>
                <div className="flex gap-3">
                  <div
                    className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.initial}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-black leading-[18px]">
                      {event.titleTop}
                      <br />
                      {event.titleBottom}
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
