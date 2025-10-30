import React, { useState } from "react";

const ScheduleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025

  // Calendar data
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: "", isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Dummy events for specific dates
  const events = {
    1: [{ title: "kids Lunch", color: "#F3BE08" }],
    2: [{ title: "kids Lunch", color: "#F3BE08" }],
    7: [
      { title: "kids Lunch", color: "#F3BE08" },
      { title: "Event Name", color: "#006F69" },
    ],
    8: [{ title: "Event Name", color: "#006F69" }],
    14: [
      { title: "Event Name", color: "#006F69" },
      { title: "Event Name", color: "#6CC31F" },
    ],
    15: [{ title: "Event Name", color: "#6CC31F" }],
    17: [{ title: "Event Name", color: "#F3BE08" }],
    20: [
      { title: "Event Name", color: "#6CC31F" },
      { title: "Event Name", color: "#006F69" },
    ],
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-white">Schedule</h2>

      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.2)] p-0 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-2 border-b border-[rgba(218,220,224,0.6)]">
          {/* Left: Month & Year */}
          <div className="flex items-center gap-3.5 px-3.5">
            <div className="flex gap-2.5">
              <span className="text-base font-semibold text-[#333333]">
                {monthNames[currentDate.getMonth()]}
              </span>
              <span className="text-base font-medium text-[#333333] w-9">
                {currentDate.getFullYear()}
              </span>
              <button className="p-2">
                <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                  <path d="M3.5 6L0 0H7L3.5 6Z" fill="#202020" />
                </svg>
              </button>
            </div>

            <button className="p-2">
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path
                  d="M3.28 5.47L17.72 5.47L17.72 15.53L3.28 15.53"
                  stroke="#000"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <path d="M12 2L5 10L12 18" stroke="#000" strokeWidth="2" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 h-[300px] overflow-y-auto">
          {calendarDays.map((dayObj, index) => (
            <div
              key={index}
              className="border border-[rgba(218,220,224,0.6)] p-0.5 min-h-[78px] flex flex-col justify-between"
            >
              {dayObj.isCurrentMonth && (
                <>
                  {/* Day Number */}
                  <div className="p-1">
                    <div className="p-1.5">
                      <span
                        className={`text-[10px] font-semibold ${
                          events[dayObj.day]
                            ? "text-[#333333]"
                            : "text-[#333333]"
                        }`}
                      >
                        {dayObj.day < 10 ? `0${dayObj.day}` : dayObj.day}
                      </span>
                    </div>
                  </div>

                  {/* Events */}
                  {events[dayObj.day] && (
                    <div className="flex flex-col gap-0.5 p-0.5">
                      {events[dayObj.day].slice(0, 2).map((event, idx) => (
                        <div
                          key={idx}
                          className="rounded px-0.5 py-0.5 text-[10px] font-semibold text-white truncate"
                          style={{ backgroundColor: event.color }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {events[dayObj.day].length > 2 && (
                        <p className="text-[10px] font-semibold text-[#A0A0A0] px-0.5">
                          +{events[dayObj.day].length - 2} More
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

      {/* Upcoming Schedule Details */}
      <div className="space-y-4">
        <div className="space-y-3">
          {/* Event 1 */}
          <div className="bg-white rounded-xl p-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-black text-right">
                Oct 03 10:00 ~ Oct 06 14:30
              </p>
              <div className="flex gap-3">
                <div className="w-[40px] h-[40px] bg-[#006F69] rounded-full flex items-center justify-center text-white font-medium text-sm">
                  D
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-black leading-[18px]">
                    David
                    <br />
                    School Trip
                  </h3>
                  <p className="text-xs font-normal text-black leading-4 mt-1">
                    David is going to school trip for 3 days and I need to pick
                    him up at 6pm
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Event 2 */}
          <div className="bg-white rounded-xl p-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-black text-right">
                Oct 10 12:00 ~ Oct 10 16:30
              </p>
              <div className="flex gap-3">
                <div className="w-[40px] h-[40px] bg-[#6CC31F] rounded-full flex items-center justify-center text-white font-medium text-sm">
                  B
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-black leading-[18px]">
                    Ballerina
                    <br />
                    Math tutoring
                  </h3>
                  <p className="text-xs font-normal text-black leading-4 mt-1">
                    Details of events Details of events Deta of events Details
                    of eventsDetails of .......
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Event 3 */}
          <div className="bg-white rounded-xl p-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-black text-right">
                Nov 30 8:00
              </p>
              <div className="flex gap-3">
                <div className="w-[40px] h-[40px] bg-[#F3BE08] rounded-full flex items-center justify-center text-white font-medium text-sm">
                  A
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-black leading-[18px]">
                    Ana
                    <br />
                    Actress club
                  </h3>
                  <p className="text-xs font-normal text-black leading-4 mt-1">
                    Details of events Details of events Deta of events Details
                    of eventsDetails of .......
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
