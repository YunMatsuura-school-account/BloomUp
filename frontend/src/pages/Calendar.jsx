// // // // // frontend/src/Pages/Calendar.jsx

import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddEventModal from "../components/AddEventModal";
import Header from "../components/Header";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";


// Icons
function BellIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z"
      />
    </svg>
  );
}

function LocationIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function UserIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [userData, setUserData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load user data and children
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [navigate]);

  // Load upcoming events
  useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const now = new Date().toISOString();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        const endDate = thirtyDaysLater.toISOString();

        const url = `${import.meta.env.VITE_BACKEND_URL}/api/calendar?start=${encodeURIComponent(now)}&end=${encodeURIComponent(endDate)}`;
        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (resp.ok) {
          const data = await resp.json();
          // Sort by start date and take next 5 events
          const sortedEvents = (data.events || [])
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 5);
          setUpcomingEvents(sortedEvents);
        }
      } catch (err) {
        console.error('Error loading upcoming events:', err);
      }
    };

    loadUpcomingEvents();
  }, [modalOpen]); // Reload when modal closes

  // Load children for event cards
  // useEffect(() => {
  //     const loadChildren = async () => {
  //         try {
  //             const token = localStorage.getItem('accessToken');
  //             if (!token) return;

  //             const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/children`, {
  //                 headers: {
  //                     Authorization: `Bearer ${token}`,
  //                     'Content-Type': 'application/json'
  //                 },
  //             });

  //             if (res.ok) {
  //                 const data = await res.json();
  //                 setChildrenList(data.children || []);
  //             }
  //         } catch (error) {
  //             console.error('Error loading children:', error);
  //         }
  //     };

  //     loadChildren();
  // }, []);

  // In your useEffect for loading children, replace with this:

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('No token found');
          return;
        }

        console.log('Fetching children from API...');

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/children`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        console.log('Children API response status:', res.status);

        if (res.ok) {
          const data = await res.json();
          console.log('Children data received:', data);

          if (data.success && data.children) {
            setChildrenList(data.children);
          } else {
            console.log('No children found or API error');
            setChildrenList([]);
          }
        } else {
          console.error('Failed to fetch children:', res.status);
          setChildrenList([]);
        }
      } catch (error) {
        console.error('Error loading children:', error);
        setChildrenList([]);
      }
    };

    loadChildren();
  }, []);
  // Calendar functions
  async function fetchEventsForRange(info) {
    const start = info.start.toISOString();
    const end = info.end.toISOString();

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/calendar?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
      });

      if (resp.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return [];
      }

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Failed to load events');

      const fcEvents = (data.events || []).map(ev => ({
        id: ev._id,
        title: ev.title,
        start: ev.startDate,
        end: ev.endDate || undefined,
        backgroundColor: ev.color || undefined,
        extendedProps: { raw: ev },
      }));
      return fcEvents;
    } catch (err) {
      console.error('Error loading events', err);
      return [];
    }
  }


  // Load upcoming events
  useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const now = new Date().toISOString();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        const endDate = thirtyDaysLater.toISOString();

        const url = `${import.meta.env.VITE_BACKEND_URL
          }/api/calendar?start=${encodeURIComponent(
            now
          )}&end=${encodeURIComponent(endDate)}`;
        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (resp.ok) {
          const data = await resp.json();
          // Sort by start date and take next 5 events
          const sortedEvents = (data.events || [])
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 5);
          setUpcomingEvents(sortedEvents);
        }
      } catch (err) {
        console.error("Error loading upcoming events:", err);
      }
    };

    loadUpcomingEvents();
  }, [modalOpen]); // Reload when modal closes

  // Load children for event cards
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/children`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setChildrenList(data.children || []);
        }
      } catch (error) {
        console.error("Error loading children:", error);
      }
    };

    loadChildren();
  }, []);

  // Calendar functions
  async function fetchEventsForRange(info) {
    const start = info.start.toISOString();
    const end = info.end.toISOString();

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL
        }/api/calendar?start=${encodeURIComponent(
          start
        )}&end=${encodeURIComponent(end)}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (resp.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return [];
      }

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Failed to load events");

      const fcEvents = (data.events || []).map((ev) => ({
        id: ev._id,
        title: ev.title,
        start: ev.startDate,
        end: ev.endDate || undefined,
        backgroundColor: ev.color || undefined,
        extendedProps: { raw: ev },
      }));
      return fcEvents;
    } catch (err) {
      console.error("Error loading events", err);
      return [];
    }
  }

  function handleDateSelect(selectInfo) {
    setEditingEvent({
      startDate: selectInfo.startStr,
      endDate: selectInfo.endStr || null,
    });
    setModalOpen(true);
  }

  function handleEventClick(clickInfo) {
    const raw = clickInfo.event.extendedProps.raw;
    if (!raw) return;
    setEditingEvent(raw);
    setModalOpen(true);
  }

  function onSaved() {
    const api = calendarRef.current?.getApi?.();
    if (api) api.refetchEvents();
  }

  function handleViewChange(view) {
    const api = calendarRef.current.getApi();
    api.changeView(view);
    setCurrentView(view);
  }

  function handlePrevMonth() {
    const api = calendarRef.current.getApi();
    api.prev();
    updateCurrentDate(api);
  }

  function handleNextMonth() {
    const api = calendarRef.current.getApi();
    api.next();
    updateCurrentDate(api);
  }

  function handleToday() {
    const api = calendarRef.current.getApi();
    api.today();
    updateCurrentDate(api);
  }

  function updateCurrentDate(api) {
    const currentDate = api.getDate();
    setCurrentDate(currentDate);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getChildName(childId) {
    const child = childrenList.find((c) => c._id === childId);
    return child ? child.name : "Unknown Child";
  }

  function getMonthYearString() {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Top Bar with Bell and Profile Icons */}
            <div className="flex justify-between items-center mb-6">
                <div></div> {/* Empty div for spacing */}
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <BellIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <UserIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Hi, {userData?.name || 'User'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <LocationIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 text-sm">
                        {userData?.country || 'Your Location'}
                    </span>
                </div>
            </div>

            {/* Calendar Controls Row */}
            <div className="mb-6">
                {/* View Buttons and Add Event Button - Full Width Row */}
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => handleViewChange('dayGridMonth')}
                        className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${currentView === 'dayGridMonth'
                                ? 'bg-[#238D88] text-white border-[#238D88]'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => handleViewChange('timeGridWeek')}
                        className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${currentView === 'timeGridWeek'
                                ? 'bg-[#238D88] text-white border-[#238D88]'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => handleViewChange('timeGridDay')}
                        className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${currentView === 'timeGridDay'
                                ? 'bg-[#238D88] text-white border-[#238D88]'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Day
                    </button>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex-1 py-3 px-6 rounded-lg bg-[#F3BE08] text-gray-800 font-medium hover:bg-amber-500 transition-colors text-lg flex items-center justify-center gap-2"
                    >
                        Add Event +
                    </button>
                </div>

                {/* Month/Year Navigation */}
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>

                        <h2 className="text-xl font-semibold text-gray-800">
                            {getMonthYearString()}
                        </h2>

                        <button
                            onClick={handleNextMonth}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <button
                        onClick={handleToday}
                        className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Calendar - Takes 2/3 on large screens */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={false}
                            selectable
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            events={fetchEventsForRange}
                            eventDisplay="block"
                            height="500px"
                        />
                    </div>
                </div>

                {/* Upcoming Events - Takes 1/3 on large screens */}
                <div>
                    <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>

                        {upcomingEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-3">No upcoming events yet!</p>
                                <div className="border-2 border-dashed border-[#F3BE08] bg-amber-50 rounded-lg p-4">
                                    <p className="text-gray-700 text-sm">
                                        Start by adding events to see here.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {upcomingEvents.map((event, index) => (
                                    <div
                                        key={event._id}
                                        className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                                        style={{ borderLeft: `4px solid ${event.color || '#006F69'}` }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-800">{event.title}</h4>
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: event.color || '#006F69' }}
                                            ></div>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-2">
                                            <div>
                                                {formatDate(event.startDate)}
                                                {event.endDate && ` - ${formatDate(event.endDate)}`}
                                            </div>
                                            <div className="text-xs">
                                                {formatTime(event.startDate)}
                                                {event.endDate && ` - ${formatTime(event.endDate)}`}
                                            </div>
                                        </div>

                                        {event.notes && (
                                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                                                {event.notes}
                                            </p>
                                        )}

                                        <div className="text-xs text-gray-500">
                                            {event.children && event.children.length > 0 ? (
                                                event.children.map(childId => (
                                                    <span key={childId} className="mr-2">
                                                        {getChildName(childId)}
                                                    </span>
                                                ))
                                            ) : (
                                                <span>All Children</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* What You Can Restock Section - Full Width */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">What You Can Restock</h3>
                <div className="border-2 border-dashed border-[#F3BE08] bg-amber-50 rounded-lg p-12 text-center">
                    <p className="text-gray-600 text-lg">Restocking functionality coming soon</p>
                </div>
            </div>

            {/* Add Event Modal */}
            <AddEventModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingEvent(null);
                }}
                onSaved={() => {
                    setModalOpen(false);
                    onSaved();
                }}
                initialData={editingEvent}
            />
        </div>
    );
}

