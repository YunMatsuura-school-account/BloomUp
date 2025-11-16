// frontend/src/components/ScheduleCalendar.jsx
import React, { useMemo, useState } from "react";

const ScheduleCalendar = ({ events = [], initialDate }) => {
  const [currentDate, setCurrentDate] = useState(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calendar data
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Build year options based on events to include future years
  const yearOptions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let minYear = currentYear - 2;
    let maxYear = currentYear + 6;
    (events || []).forEach((ev) => {
      if (!ev?.date) return;
      const y = new Date(ev.date).getFullYear();
      if (!Number.isNaN(y)) {
        if (y < minYear) minYear = y;
        if (y > maxYear) maxYear = y;
      }
    });
    const ys = [];
    for (let y = minYear; y <= maxYear; y++) ys.push(y);
    return ys;
  }, [events]);

  // Month navigation
  const goToPrevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Generate calendar days - ONLY CURRENT MONTH (no previous/next month dates)
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start

    // Fill empty cells for days before the first day of month
    for (let i = 0; i < startDay; i++) {
      days.push({ day: "", isCurrentMonth: false, isEmpty: true });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, isEmpty: false });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Normalize incoming events to a map keyed by day number for current month
  const eventsByDay = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const map = {};
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    (events || []).forEach((ev) => {
      if (!ev || !ev.date) return;
      const startDate = new Date(ev.date);
      
      // Only include events that start in the current month
      if (startDate < monthStart || startDate > monthEnd) {
        return; // Event doesn't belong to current month
      }

      const day = startDate.getDate();
      
      let derivedColor = "#F3BE08"; // default calendar/school
      if (ev.type === "vaccination") derivedColor = "#006F69";
      else if (ev.type === "school") derivedColor = "#F3BE08";

      const entry = {
        title: ev.title || ev.name || "Event",
        color: ev.color || derivedColor,
        type: ev.type,
        date: ev.date,
        _id: ev._id,
        endDate: ev.endDate,
        notes: ev.notes,
      };

      if (!map[day]) map[day] = [];
      map[day].push(entry);
    });
    return map;
  }, [events, currentDate]);

  // Handle date click - show modal with events for that day
  const handleDateClick = (day) => {
    if (!day || !day.isCurrentMonth || day.isEmpty) return;

    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day.day
    );
    setSelectedDate(clickedDate);
    setIsModalOpen(true);
  };

  // Get events for selected date
  const getEventsForDate = (date) => {
    if (!date) return [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    return (events || []).filter((ev) => {
      if (!ev || !ev.date) return false;
      const evDate = new Date(ev.date);
      return (
        evDate.getFullYear() === year &&
        evDate.getMonth() === month &&
        evDate.getDate() === day
      );
    });
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-5 h-full flex flex-col">
      <h2 className="text-lg font-medium text-black">Schedule</h2>

      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.2)] p-0 overflow-hidden flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-2 border-b border-[rgba(218,220,224,0.6)]">
          {/* Left: Month & Year */}
          <div className="flex items-center gap-3.5 px-3.5">
            <div className="flex gap-2.5 items-center">
              <select
                className="text-base font-semibold text-[#333333] bg-transparent outline-none"
                value={currentDate.getMonth()}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setCurrentDate((d) => new Date(d.getFullYear(), m, 1));
                }}
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx} className="text-[#333333]">
                    {m}
                  </option>
                ))}
              </select>
              <select
                className="text-base font-medium text-[#333333] bg-transparent outline-none"
                value={currentDate.getFullYear()}
                onChange={(e) => {
                  const y = Number(e.target.value);
                  setCurrentDate((d) => new Date(y, d.getMonth(), 1));
                }}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="text-[#333333]">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button className="p-2" onClick={goToToday} title="Go to Today">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
              >
                <path
                  d="M3.28125 6.125C3.28125 5.95095 3.35039 5.78403 3.47346 5.66096C3.59653 5.53789 3.76345 5.46875 3.9375 5.46875H17.0625C17.2365 5.46875 17.4035 5.53789 17.5265 5.66096C17.6496 5.78403 17.7188 5.95095 17.7188 6.125C17.7188 6.29905 17.6496 6.46597 17.5265 6.58904C17.4035 6.71211 17.2365 6.78125 17.0625 6.78125H3.9375C3.76345 6.78125 3.59653 6.71211 3.47346 6.58904C3.35039 6.46597 3.28125 6.29905 3.28125 6.125ZM5.46875 10.5C5.46875 10.3259 5.53789 10.159 5.66096 10.036C5.78403 9.91289 5.95095 9.84375 6.125 9.84375H14.875C15.049 9.84375 15.216 9.91289 15.339 10.036C15.4621 10.159 15.5312 10.3259 15.5312 10.5C15.5312 10.674 15.4621 10.841 15.339 10.964C15.216 11.0871 15.049 11.1562 14.875 11.1562H6.125C5.95095 11.1562 5.78403 11.0871 5.66096 10.964C5.53789 10.841 5.46875 10.674 5.46875 10.5ZM8.09375 14.875C8.09375 14.7009 8.16289 14.534 8.28596 14.411C8.40903 14.2879 8.57595 14.2187 8.75 14.2187H12.25C12.424 14.2187 12.591 14.2879 12.714 14.411C12.8371 14.534 12.9062 14.7009 12.9062 14.875C12.9062 15.049 12.8371 15.216 12.714 15.339C12.591 15.4621 12.424 15.5312 12.25 15.5312H8.75C8.57595 15.5312 8.40903 15.4621 8.28596 15.339C8.16289 15.216 8.09375 15.049 8.09375 14.875Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-gray-100 rounded"
              onClick={goToPrevMonth}
              title="Previous Month"
            >
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <path d="M12 2L5 10L12 18" stroke="#000" strokeWidth="2" />
              </svg>
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded"
              onClick={goToNextMonth}
              title="Next Month"
            >
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <path d="M6 2L13 10L6 18" stroke="#000" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-[#238D88]">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="flex justify-center items-center p-2.5 h-6"
            >
              <span className="text-xs font-medium text-white">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid - Only show current month dates */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {calendarDays.map((dayObj, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(dayObj)}
              className={`border border-[rgba(218,220,224,0.6)] p-0.5 min-h-[78px] flex flex-col justify-between ${
                dayObj.isCurrentMonth && !dayObj.isEmpty
                  ? "cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                  : "bg-gray-100" // Gray background for empty cells
              }`}
            >
              {dayObj.isCurrentMonth && !dayObj.isEmpty && (
                <>
                  {/* Day Number */}
                  <div className="p-1">
                    <div className="p-1.5">
                      {(() => {
                        const today = new Date();
                        const isToday =
                          dayObj.day === today.getDate() &&
                          currentDate.getMonth() === today.getMonth() &&
                          currentDate.getFullYear() === today.getFullYear();
                        return (
                          <span
                            className={`text-[10px] font-semibold inline-flex items-center justify-center w-5 h-5 rounded-full ${
                              isToday
                                ? "bg-[#238D88] text-white"
                                : "text-[#333333]"
                            }`}
                          >
                            {dayObj.day < 10 ? `0${dayObj.day}` : dayObj.day}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Events - Show only title without time */}
                  {eventsByDay[dayObj.day] && (
                    <div className="flex flex-col" style={{ rowGap: "6px" }}>
                      {eventsByDay[dayObj.day].slice(0, 2).map((event, idx) => (
                        <div
                          key={`${event._id}-${idx}`}
                          className="relative h-[22px] flex-shrink-0"
                        >
                          <div
                            className="py-0.5 text-[10px] font-semibold text-white truncate h-full flex items-center rounded px-0.5"
                            style={{
                              backgroundColor: event.color,
                            }}
                          >
                            {event.title}
                          </div>
                        </div>
                      ))}
                      {eventsByDay[dayObj.day].length > 2 && (
                        <p className="text-[10px] font-semibold text-[#A0A0A0] px-0.5 mt-1">
                          +{eventsByDay[dayObj.day].length - 2} More
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Events Modal */}
      {isModalOpen && selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {formatDate(selectedDate)}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {(() => {
                const dayEvents = getEventsForDate(selectedDate);
                if (dayEvents.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg mb-2">No events scheduled</p>
                      <p className="text-sm">This day is free!</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {dayEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {/* Color Indicator */}
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                            style={{
                              backgroundColor: event.color || "#F3BE08",
                            }}
                          ></div>

                          {/* Event Details - Only show title */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {event.title || "Event"}
                            </h4>
                            {event.notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Notes:</span>{" "}
                                {event.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;