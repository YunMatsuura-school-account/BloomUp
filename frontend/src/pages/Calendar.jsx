// frontend/src/pages/Calendar.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddEventModal from "../components/AddEventModal";
import UpcomingEvents from "../components/UpcomingEvents";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ReminderModal from "../components/ReminderModal";
import CustomReminderModal from "../components/CustomReminderModal";
import { useChild } from "../contexts/ChildContext";
import ChildAvatar from "../components/ChildAvatar";

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

// Vaccination Section Component
function VaccinationSection({ selectedChild, userData }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVaccinations = async () => {
      if (!selectedChild?._id || !userData?.id) {
        setVaccinations([]);
        return;
      }

      try {
        setLoading(true);
        const base = import.meta.env.VITE_BACKEND_URL || "";
        const vaccUrl = `${base}/api/users/${userData.id}/children/${selectedChild._id
          }/vaccinations/recommendations${selectedChild.dateOfBirth
            ? `?birthDate=${encodeURIComponent(selectedChild.dateOfBirth)}`
            : ""
          }`;
        const vaccRes = await fetch(vaccUrl);
        if (vaccRes.ok) {
          const vaccData = await vaccRes.json();
          const upcoming = (vaccData?.recommendations || [])
            .filter((r) => r?.recommendedDate)
            .sort(
              (a, b) =>
                new Date(a.recommendedDate) - new Date(b.recommendedDate)
            )
            .slice(0, 2); // Show top 2 upcoming
          setVaccinations(upcoming);
        }
      } catch (e) {
        console.error("Error fetching vaccinations:", e);
        setVaccinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinations();
  }, [selectedChild?._id, userData?.id, selectedChild?.dateOfBirth]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    return `You got this dose ${month} ${day}.`;
  };

  return (
    <div className="mt-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          It's Vaccination Time!
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#238D88] mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Loading vaccinations...</p>
          </div>
        ) : vaccinations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              No upcoming vaccinations scheduled
            </p>
            <a
              href="https://www.google.com/maps/search/child+hospitals+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-[#238D88] text-white font-medium px-6 py-3 hover:bg-[#1a6d68] transition-colors"
            >
              Find Child Hospitals
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaccinations.map((vacc, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <ChildAvatar
                      child={selectedChild}
                      size="md"
                      className="w-12 h-12"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      {vacc.name || "Vaccination"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {formatDate(vacc.recommendedDate)}
                    </p>
                    <a
                      href="https://www.google.com/maps/search/child+hospitals+near+me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-[#238D88] text-white font-medium px-4 py-2 text-sm hover:bg-[#1a6d68] transition-colors"
                    >
                      Book Clinic
                    </a>
                  </div>
                  <div className="flex-shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#238D88]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#238D88]"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // Calendar & Events State
  const { selectedChild } = useChild(); // Get selected child from context
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [userData, setUserData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Restock State
  const [restockItems, setRestockItems] = useState([]);
  const [loadingRestock, setLoadingRestock] = useState(false);
  const [showRestockDateModal, setShowRestockDateModal] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState(null);
  const [showRestockCustomModal, setShowRestockCustomModal] = useState(false);
  const [customRestockDays, setCustomRestockDays] = useState("");

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const userData = await res.json();
          setUserData(userData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [navigate]);

  // Load upcoming events - filtered by selected child
  useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const now = new Date().toISOString();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        const endDate = thirtyDaysLater.toISOString();

        // Add child filter if a child is selected
        const params = new URLSearchParams();
        params.set("start", now);
        params.set("end", endDate);
        if (selectedChild?._id) {
          params.set("child", selectedChild._id);
        }

        const url = `${import.meta.env.VITE_BACKEND_URL
          }/api/calendar?${params.toString()}`;
        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (resp.ok) {
          const data = await resp.json();
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
  }, [modalOpen, selectedChild]);

  // Load children for event cards
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.log("No token found");
          return;
        }

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
          if (data.success && data.children) {
            setChildrenList(data.children);
          } else {
            setChildrenList([]);
          }
        } else {
          console.error("Failed to fetch children:", res.status);
          setChildrenList([]);
        }
      } catch (error) {
        console.error("Error loading children:", error);
        setChildrenList([]);
      }
    };

    loadChildren();
  }, []);

  // Fetch ALL restock items (no category filter)
  useEffect(() => {
    const fetchRestockItems = async () => {
      try {
        setLoadingRestock(true);
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/budget/restock-items`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(" Restock items:", data.items);
          setRestockItems(data.items || []);
        }
      } catch (error) {
        console.error("Error fetching restock items:", error);
      } finally {
        setLoadingRestock(false);
      }
    };

    fetchRestockItems();
  }, []);

  // Handle toggle reminder
  const handleToggleReminder = async (item) => {
    const newState = !item.reminderEnabled;

    if (newState) {
      console.log("Opening date modal for:", item.productName);
      setSelectedRestockItem(item);
      setShowRestockDateModal(true);
    } else {
      await disableRestockReminder(item);
    }
  };

  const handleRestockCustomSave = async (customDays) => {
    setCustomRestockDays(customDays);
    setShowRestockCustomModal(false);
    setShowRestockDateModal(true);
  };

  const handleRestockReminderSelect = async (alertType) => {
    console.log(" Restock reminder selected:", alertType);

    if (alertType === "Custom") {
      setShowRestockDateModal(false);
      setShowRestockCustomModal(true);
    }
  };

  const handleRestockDateSave = async (alertType, selectedDate) => {
    try {
      if (alertType === "Custom") {
        console.log(" Custom button clicked - opening CustomReminderModal");
        setShowRestockDateModal(false);
        setShowRestockCustomModal(true);
        return;
      }

      const token = localStorage.getItem("accessToken");

      if (!selectedDate) {
        alert("Please select a date");
        return;
      }

      let customDaysValue = null;
      if (customRestockDays) {
        customDaysValue = parseFloat(customRestockDays);
        console.log(" Using custom days:", customDaysValue);
      }

      console.log(" Saving restock reminder:", {
        productName: selectedRestockItem.productName,
        date: selectedDate,
        alertType,
        customDays: customDaysValue,
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/budget/restock/toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: selectedRestockItem.productName,
            enabled: true,
            nextRestockDate: selectedDate.toISOString(),
            alertType: customRestockDays ? "Custom" : alertType,
            customDays: customDaysValue,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setRestockItems((prevItems) =>
          prevItems.map((i) =>
            i.productName === selectedRestockItem.productName
              ? {
                ...i,
                reminderEnabled: true,
                nextRestockDate: selectedDate.toISOString(),
              }
              : i
          )
        );

        console.log(" Restock reminder saved successfully");

        setShowRestockDateModal(false);
        setShowRestockCustomModal(false);
        setSelectedRestockItem(null);
        setCustomRestockDays("");

        const api = calendarRef.current?.getApi?.();
        if (api) api.refetchEvents();
      } else {
        console.error("Failed to save reminder:", result);
      }
    } catch (error) {
      console.error("Error saving restock reminder:", error);
    }
  };

  const handleRestockCustomClick = () => {
    setShowRestockDateModal(false);
    setShowRestockCustomModal(true);
  };

  const disableRestockReminder = async (item) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/budget/restock/toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: item.productName,
            enabled: false,
            nextRestockDate: item.nextRestockDate,
          }),
        }
      );

      if (response.ok) {
        setRestockItems((prevItems) =>
          prevItems.map((i) =>
            i.productName === item.productName
              ? { ...i, reminderEnabled: false }
              : i
          )
        );

        const api = calendarRef.current?.getApi?.();
        if (api) api.refetchEvents();
      } else {
        const errorData = await response.json();
        console.error("Failed to disable reminder:", errorData);
      }
    } catch (error) {
      console.error("Error disabling reminder:", error);
    }
  };

  // Calendar functions
  async function fetchEventsForRange(info) {
    const start = info.start.toISOString();
    const end = info.end.toISOString();

    try {
      const params = new URLSearchParams();
      params.set("start", start);
      params.set("end", end);
      if (selectedChild?._id) {
        params.set("child", selectedChild._id);
      }

      const url = `${import.meta.env.VITE_BACKEND_URL
        }/api/calendar?${params.toString()}`;
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
        title: ev.title, // Only show title, no time
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

  // Handle event click from UpcomingEvents
  const handleEventClickFromUpcoming = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

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

  function refreshCalendar() {
    const api = calendarRef.current?.getApi?.();
    if (api) api.refetchEvents();
  }

  // Refresh calendar when selected child changes
  useEffect(() => {
    const api = calendarRef.current?.getApi?.();
    if (api) {
      api.refetchEvents();
    }
  }, [selectedChild]);

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
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Hi, {userData?.name || "User"}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <LocationIcon className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 text-sm">
            {userData?.country || "Your Location"}
          </span>
        </div>
      </div>

      {/* Calendar Controls Row */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleViewChange("dayGridMonth")}
            className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${currentView === "dayGridMonth"
              ? "bg-[#238D88] text-white border-[#238D88]"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange("timeGridWeek")}
            className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${currentView === "timeGridWeek"
              ? "bg-[#238D88] text-white border-[#238D88]"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange("timeGridDay")}
            className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${currentView === "timeGridDay"
              ? "bg-[#238D88] text-white border-[#238D88]"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
              // Add these props to remove time display
              eventTimeFormat={{ // Optional: if you want to control time format
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }}
              // For month view, events typically don't show time by default
              // But if they do, you can use eventContent to customize
              eventContent={(eventInfo) => {
                return {
                  html: `<div class="fc-event-title">${eventInfo.event.title}</div>`
                };
              }}
            />
          </div>
        </div>

        {/* Upcoming Events - Takes 1/3 on large screens */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
            <UpcomingEvents
              selectedChild={selectedChild}
              onEventClick={handleEventClickFromUpcoming}
            />
          </div>
        </div>
      </div>

      {/* Restock Items Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Reminder for restocking items
          </h3>
          <p className="text-sm text-gray-500">
            Enable the toggle to receive reminders for specific items.
          </p>
        </div>

        {loadingRestock ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#238D88] mx-auto mb-4"></div>
            <p className="text-sm">Loading restock items...</p>
          </div>
        ) : restockItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-3">
              No recurring purchases found in your history.
            </p>
            <div className="border-2 border-dashed border-[#F3BE08] bg-amber-50 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-gray-700 text-sm">
                Items you purchase regularly (at least twice) will appear here
                automatically!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restockItems.map((item, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${item.reminderEnabled}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm leading-tight">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={item.reminderEnabled}
                      onChange={() => handleToggleReminder(item)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                  </label>
                </div>

                <div className="text-xs text-gray-600 mb-3 space-y-1">
                  <div>
                    <span className="font-medium">Last purchased:</span>{" "}
                    {item.lastPurchasedText}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vaccination Section */}
      <VaccinationSection selectedChild={selectedChild} userData={userData} />

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSaved={() => {
          setModalOpen(false);
          setEditingEvent(null);
          refreshCalendar();
        }}
        initialData={editingEvent}
      />

      {/* Restock Custom Reminder Modal */}
      <CustomReminderModal
        isOpen={showRestockCustomModal}
        onClose={() => {
          setShowRestockCustomModal(false);
          setCustomRestockDays("");
        }}
        onSave={handleRestockCustomSave}
        onDaysChange={setCustomRestockDays}
      />

      {/* Restock Date/Reminder Modal - Combined */}
      <ReminderModal
        isOpen={showRestockDateModal}
        onClose={() => {
          setShowRestockDateModal(false);
          setSelectedRestockItem(null);
          setCustomRestockDays("");
        }}
        onSelectAlert={handleRestockDateSave}
        event={
          selectedRestockItem
            ? {
              title: `Restock: ${selectedRestockItem.productName}`,
              startDate: selectedRestockItem.nextRestockDate,
            }
            : null
        }
        customDaysPreview={customRestockDays}
        existingReminder={null}
        showDatePicker={true}
        productName={selectedRestockItem?.productName || ""}
      />
    </div>
  );
}