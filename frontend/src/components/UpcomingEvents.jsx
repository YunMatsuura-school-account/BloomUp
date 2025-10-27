import React from "react";

const UpcomingEvents = ({ selectedChild }) => {
  // Dummy events data
  const events = [
    {
      id: 1,
      date: "Tue Sep 30",
      time: "10:00",
      title: "Lorem ipsum dolor sit amet.",
      description:
        "Details of events Details of events Deta of events Details of eventsDetails of .......",
      icon: "📅",
    },
    {
      id: 2,
      date: "Tue Sep 30",
      time: "10:00",
      title: "Lorem ipsum dolor sit amet.",
      description:
        "Details of events Details of events Deta of events Details of eventsDetails of .......",
      icon: "🏫",
    },
    {
      id: 3,
      date: "Tue Sep 30",
      time: "10:00",
      title: "Lorem ipsum dolor sit amet.",
      description:
        "Details of events Details of events Deta of events Details of eventsDetails of .......",
      icon: "🎨",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-white">Upcoming Events</h2>

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="bg-[#D9D9D9] rounded-xl p-4">
            <div className="flex flex-col gap-1">
              {/* Date & Time Row */}
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-black tracking-[2.14%] leading-5">
                  {event.date}
                </p>
                <p className="text-xs font-medium text-black leading-4">
                  {event.time}
                </p>
              </div>

              {/* Icon, Title & Description Row */}
              <div className="flex gap-3">
                {/* Icon */}
                <div className="w-[40px] h-[40px] bg-[#5A5A5A] rounded-full flex items-center justify-center text-lg flex-shrink-0">
                  {event.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-black tracking-[2.14%] leading-4 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-[10px] font-normal text-black leading-3">
                    {event.description}
                  </p>
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
