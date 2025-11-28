import { useEffect, useState } from "react";
import ChildAvatar from "./ChildAvatar";
import { useChild } from "../contexts/ChildContext";
import Loader from "./Loader";

// "All" avatar component - matches the sidebar "All" button style
const AllChildrenAvatar = ({ width = 48, height = 48 }) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-bold"
    style={{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: "#238D88",
      fontSize: `${Math.floor(width / 3)}px`,
    }}
  >
    All
  </div>
);

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
  const { user, children } = useChild();

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const base = import.meta.env.VITE_BACKEND_URL || "";

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const start = now.toISOString();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const end = thirtyDaysLater.toISOString();

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      // Fetch calendar events
      const params = new URLSearchParams();
      params.set("start", start);
      params.set("end", end);
      // Only filter by child if a specific child is selected (not "All")
      if (selectedChild?._id) {
        params.set("child", selectedChild._id);
      }

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

      // Map calendar events and attach child info if available
      const calendarEvents = (json.events || [])
        .filter((e) => e?.startDate && new Date(e.startDate) >= now)
        .map((e) => {
          // Find the child associated with this event
          const eventChild = e.child
            ? children.find((c) => c._id === e.child || c._id === e.child._id)
            : null;
          return {
            ...e,
            eventType: "calendar",
            childData: eventChild || null,
          };
        });

      // Fetch vaccination recommendations
      let vaccinationEvents = [];

      if (selectedChild?._id && user?.id) {
        // Single child selected - fetch vaccinations for that child
        try {
          const vaccUrl = `${base}/api/users/${user.id}/children/${
            selectedChild._id
          }/vaccinations/recommendations${
            selectedChild.dateOfBirth
              ? `?birthDate=${encodeURIComponent(selectedChild.dateOfBirth)}`
              : ""
          }`;

          const vaccRes = await fetch(vaccUrl, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (vaccRes.ok) {
            const vaccData = await vaccRes.json();
            vaccinationEvents = (vaccData?.recommendations || [])
              .filter((r) => {
                if (!r?.recommendedDate) return false;
                const vaccDate = new Date(r.recommendedDate);
                vaccDate.setHours(0, 0, 0, 0);
                return vaccDate >= now;
              })
              .map((r) => ({
                _id: `vacc-${selectedChild._id}-${r.name}-${r.recommendedDate}`,
                title: `${r.name} vaccination`,
                startDate: r.recommendedDate,
                notes:
                  r.description ||
                  `Recommended vaccination for ${selectedChild.name}`,
                eventType: "vaccination",
                color: selectedChild.backgroundColor || "#006F69",
                childData: selectedChild,
              }));
          }
        } catch (e) {
          console.error("Error fetching vaccinations:", e);
        }
      } else if (!selectedChild && user?.id && children.length > 0) {
        // "All" children selected - fetch vaccinations for all children
        for (const child of children) {
          try {
            const vaccUrl = `${base}/api/users/${user.id}/children/${
              child._id
            }/vaccinations/recommendations${
              child.dateOfBirth
                ? `?birthDate=${encodeURIComponent(child.dateOfBirth)}`
                : ""
            }`;

            const vaccRes = await fetch(vaccUrl, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (vaccRes.ok) {
              const vaccData = await vaccRes.json();
              const childVaccinations = (vaccData?.recommendations || [])
                .filter((r) => {
                  if (!r?.recommendedDate) return false;
                  const vaccDate = new Date(r.recommendedDate);
                  vaccDate.setHours(0, 0, 0, 0);
                  return vaccDate >= now;
                })
                .map((r) => ({
                  _id: `vacc-${child._id}-${r.name}-${r.recommendedDate}`,
                  title: `${r.name} vaccination`,
                  startDate: r.recommendedDate,
                  notes:
                    r.description ||
                    `Recommended vaccination for ${child.name}`,
                  eventType: "vaccination",
                  color: child.backgroundColor || "#006F69",
                  childData: child,
                }));
              vaccinationEvents = [...vaccinationEvents, ...childVaccinations];
            }
          } catch (e) {
            console.error(`Error fetching vaccinations for ${child.name}:`, e);
          }
        }
      }

      // Combine and sort all events by date (ascending order)
      const allEvents = [...calendarEvents, ...vaccinationEvents].sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );

      setEvents(allEvents);
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
  }, [selectedChild?._id, refreshTrigger, user?.id, children.length]);

  const getDateSegments = (startDateString, endDateString) => {
    if (!startDateString) return null;
    const startDate = new Date(startDateString);
    const endDate = endDateString ? new Date(endDateString) : null;
    const optionsDate = { month: "short", day: "2-digit", year: "numeric" };
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
    // Use childData from event if available (for "All" mode), otherwise use selectedChild
    const eventChild = event.childData || selectedChild;
    const childName = eventChild?.name?.trim();
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

  // Get the child to display for an event (from event data or selectedChild)
  const getEventChild = (event) => {
    return event.childData || selectedChild;
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-black ml-1 mb-4">
        Upcoming Events
      </h2>

      <div className="flex-1 overflow-hidden">
        <div className="overflow-y-auto pr-1 max-h-[540px] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent scrollbar-none">
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader fullPage={false} size="md" className="bg-transparent" />
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
                const isVaccination = event.eventType === "vaccination";
                const eventChild = getEventChild(event);

                return (
                  <div
                    key={event._id}
                    onClick={() => handleEventCardClick(event)}
                    className="bg-white rounded-2xl border border-[#F4F4F5] p-4 transition cursor-pointer hover:shadow-md"
                  >
                    {dateSegments && (
                      <div className="flex flex-wrap justify-between items-center gap-1 mb-1">
                        {isVaccination && (
                          <span className="text-[10px] sm:text-xs font-medium text-[#006F69] bg-[#006F69]/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                            Vaccination
                          </span>
                        )}
                        <p
                          className={`text-[10px] sm:text-sm font-semibold text-[#0F172A] ${
                            !isVaccination ? "ml-auto" : ""
                          }`}
                        >
                          <span>{dateSegments.start.date}</span>{" "}
                          <span className="hidden sm:inline">
                            {dateSegments.start.time}
                          </span>
                          {dateSegments.end && (
                            <>
                              <span className="mx-0.5 sm:mx-1 text-[#C9CDD6]">
                                ~
                              </span>
                              <span>{dateSegments.end.date}</span>{" "}
                              <span className="hidden sm:inline">
                                {dateSegments.end.time}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 items-center mt-0">
                      <div className="flex-shrink-0 self-center">
                        {eventChild ? (
                          <ChildAvatar
                            child={eventChild}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <AllChildrenAvatar width={48} height={48} />
                        )}
                      </div>

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
