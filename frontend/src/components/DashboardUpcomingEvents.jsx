import { useEffect, useState } from "react";
import ChildAvatar from "./ChildAvatar";

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

const DashboardUpcomingEvents = ({
  selectedChild,
  onEventClick,
  onAddEvent,
  refreshTrigger,
}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const base = import.meta.env.VITE_BACKEND_URL || "";

      const now = new Date();
      const start = now.toISOString();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const end = thirtyDaysLater.toISOString();

      const params = new URLSearchParams();
      params.set("start", start);
      params.set("end", end);
      if (selectedChild?._id) {
        params.set("child", selectedChild._id);
      }

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
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
      }

      if (!resp.ok) {
        console.error("API Error:", json);
        throw new Error(
          json?.message || `HTTP ${resp.status}: Failed to load events`
        );
      }

      const upcomingEvents = (json.events || [])
        .filter((e) => e?.startDate && new Date(e.startDate) >= now)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      setEvents(upcomingEvents);
    } catch (e) {
      console.error("Error fetching upcoming events:", e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild?._id, refreshTrigger]);

  const getDateSegments = (startDateString, endDateString) => {
    if (!startDateString) return null;
    const startDate = new Date(startDateString);
    const endDate = endDateString ? new Date(endDateString) : null;
    const optionsDate = { month: "short", day: "2-digit" };
    const optionsTime = { hour: "2-digit", minute: "2-digit" };

    const start = {
      date: startDate.toLocaleDateString("en-US", optionsDate),
      time: startDate.toLocaleTimeString("en-US", optionsTime),
    };

    if (!endDate) {
      return { start, end: null };
    }

    const end = {
      date: endDate.toLocaleDateString("en-US", optionsDate),
      time: endDate.toLocaleTimeString("en-US", optionsTime),
    };

    return { start, end };
  };

  const truncateDescription = (text, eventId) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= 30 || expandedDescriptions[eventId]) {
      return text;
    }
    return words.slice(0, 30).join(" ") + "...";
  };

  const toggleReadMore = (eventId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleEventCardClick = (event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const getTitleParts = (event) => {
    const childName = selectedChild?.name?.trim();
    const title = event.title || "Event";

    if (childName) {
      return {
        primary: childName,
        secondary: title !== childName ? title : "",
      };
    }

    const words = title.split(" ");
    if (words.length <= 1) {
      return { primary: title, secondary: "" };
    }
    return {
      primary: words[0],
      secondary: words.slice(1).join(" "),
    };
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-black ml-1 mb-4">
        Upcoming Events
      </h2>

      <div className="flex-1 overflow-hidden">
        <div className="overflow-y-auto pr-1 max-h-[540px] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent scrollbar-none">
          {loading && (
            <div className="flex items-center justify-center h-20 p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#238D88]"></div>
              <span className="ml-2 text-gray-600 text-sm">
                Loading events...
              </span>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="w-full min-h-[500px] flex items-center justify-center rounded-[12px] border-[3px] border-dashed border-[#F3BE08] px-10 py-12">
              <div className="text-center space-y-3">
                <CalendarIcon className="w-14 h-14 text-[#232527] mx-auto" />
                <h3 className="text-2xl font-semibold text-[#1F2A37]">
                  No upcoming events!
                </h3>
                <p className="text-base text-[#111827]">
                  Start by adding events to see here.
                </p>
                <button
                  onClick={onAddEvent}
                  className="inline-flex items-center justify-center rounded-lg bg-[#F3BE08] px-7 py-2.5 font-semibold text-base text-[#111111] shadow-[0_8px_20px_rgba(243,190,8,0.35)] hover:bg-[#E0B108] transition-colors"
                >
                  Add Event&nbsp;+
                </button>
              </div>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="space-y-4 pb-2">
              {events.map((event) => {
                const dateSegments = getDateSegments(
                  event.startDate,
                  event.endDate
                );
                const titleParts = getTitleParts(event);

                return (
                  <div
                    key={event._id}
                    onClick={() => handleEventCardClick(event)}
                    className="bg-white rounded-2xl border border-[#F4F4F5] p-4 transition cursor-pointer hover:shadow-md"
                  >
                    {dateSegments && (
                      <div className="flex justify-end mb-3">
                        <p className="text-sm font-semibold text-[#0F172A] whitespace-nowrap">
                          <span className="text-[#0F172A]">
                            {dateSegments.start.date}
                          </span>{" "}
                          {dateSegments.start.time}
                          {dateSegments.end && (
                            <>
                              <span className="mx-1 text-[#C9CDD6]">~</span>
                              <span className="text-[#0F172A]">
                                {dateSegments.end.date}
                              </span>{" "}
                              {dateSegments.end.time}
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 items-start">
                      {selectedChild && (
                        <div className="flex-shrink-0">
                          <ChildAvatar
                            child={selectedChild}
                            width={48}
                            height={48}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-[#111827] leading-tight">
                          <span className="block">{titleParts.primary}</span>
                          {titleParts.secondary && (
                            <span className="block">
                              {titleParts.secondary}
                            </span>
                          )}
                        </h3>

                        {event.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-[#4B5563] leading-relaxed">
                              {truncateDescription(event.notes, event._id)}
                            </p>
                            {event.notes.split(" ").length > 30 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReadMore(event._id);
                                }}
                                className="text-[#238D88] text-xs font-medium mt-1 hover:text-[#1a6b67] transition-colors"
                              >
                                {expandedDescriptions[event._id]
                                  ? "Read Less"
                                  : "Read More"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardUpcomingEvents;
