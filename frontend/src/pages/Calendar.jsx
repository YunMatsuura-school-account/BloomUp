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
        const vaccUrl = `${base}/api/users/${userData.id}/children/${
          selectedChild._id
        }/vaccinations/recommendations${
          selectedChild.dateOfBirth
            ? `?birthDate=${encodeURIComponent(selectedChild.dateOfBirth)}`
            : ""
        }`;
        const vaccRes = await fetch(vaccUrl);
        if (vaccRes.ok) {
          const vaccData = await vaccRes.json();
          // Show only upcoming (future) vaccinations
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

          const upcoming = (vaccData?.recommendations || [])
            .filter((r) => {
              if (!r?.recommendedDate) return false;
              const vaccDate = new Date(r.recommendedDate);
              vaccDate.setHours(0, 0, 0, 0);
              // Only show vaccinations that are today or in the future
              return vaccDate >= today;
            })
            .sort(
              (a, b) =>
                new Date(a.recommendedDate) - new Date(b.recommendedDate)
            );
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
    const year = date.getFullYear();
    return `Due on ${month} ${day}, ${year}.`;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
const [restockCacheInfo, setRestockCacheInfo] = useState(null);
const [refreshingRestock, setRefreshingRestock] = useState(false);
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

        const url = `${
          import.meta.env.VITE_BACKEND_URL
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
        console.log("📦 Restock items:", data.items);
        setRestockItems(data.items || []);
        setRestockCacheInfo({
          cached: data.cached,
          cacheAge: data.cacheAge,
          nextRefresh: data.nextRefresh
        });
      }
    } catch (error) {
      console.error("Error fetching restock items:", error);
    } finally {
      setLoadingRestock(false);
    }
  };

  fetchRestockItems();
}, []);

// Keep your existing handleRefreshRestock function
const handleRefreshRestock = async () => {
  try {
    setRefreshingRestock(true);
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/budget/restock-items?refresh=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setRestockItems(data.items || []);
      setRestockCacheInfo({
        cached: data.cached,
        cacheAge: data.cacheAge,
        nextRefresh: data.nextRefresh
      });
    }
  } catch (error) {
    console.error("Error refreshing restock items:", error);
  } finally {
    setRefreshingRestock(false);
  }
};

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
      const token = localStorage.getItem("accessToken");
      if (!token) return [];

      // Fetch calendar events
      const params = new URLSearchParams();
      params.set("start", start);
      params.set("end", end);
      if (selectedChild?._id) {
        params.set("child", selectedChild._id);
      }

      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/calendar?${params.toString()}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
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

      let fcEvents = (data.events || []).map((ev) => ({
        id: ev._id,
        title: ev.title, // Only show title, no time
        start: ev.startDate,
        end: ev.endDate || undefined,
        backgroundColor: ev.color || undefined,
        extendedProps: { raw: ev },
      }));

      // Also fetch vaccination events if a child is selected
      if (selectedChild?._id && userData?.id && selectedChild?.dateOfBirth) {
        try {
          const base = import.meta.env.VITE_BACKEND_URL || "";
          const vaccUrl = `${base}/api/users/${userData.id}/children/${
            selectedChild._id
          }/vaccinations/recommendations${
            selectedChild.dateOfBirth
              ? `?birthDate=${encodeURIComponent(selectedChild.dateOfBirth)}`
              : ""
          }`;
          const vaccRes = await fetch(vaccUrl);
          if (vaccRes.ok) {
            const vaccData = await vaccRes.json();
            const vaccinationEvents = (vaccData?.recommendations || [])
              .filter((r) => {
                if (!r?.recommendedDate) return false;
                const vaccDate = new Date(r.recommendedDate);
                vaccDate.setHours(0, 0, 0, 0); // Normalize to start of day
                const startDate = new Date(start);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(end);
                endDate.setHours(23, 59, 59, 999); // Include entire end date
                // Only include vaccinations within the current calendar view range
                return vaccDate >= startDate && vaccDate <= endDate;
              })
              .map((r) => ({
                id: `vacc-${r.name}-${r.recommendedDate}`, // Unique ID for vaccination
                title: `${r.name} vaccination`,
                start: r.recommendedDate,
                backgroundColor: "#006F69", // Vaccination color
                extendedProps: {
                  raw: {
                    title: `${r.name} vaccination`,
                    startDate: r.recommendedDate,
                    type: "vaccination",
                    color: "#006F69",
                  },
                },
              }));
            fcEvents = [...fcEvents, ...vaccinationEvents];
          }
        } catch (vaccErr) {
          console.error("Error fetching vaccination events:", vaccErr);
          // Continue with calendar events even if vaccination fetch fails
        }
      }

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
// Category Icons function
const getCategoryIcon = (category) => {
  const iconStyle = "w-8 h-8"; // Adjust size as needed
  
  switch(category?.toLowerCase()) {
    case 'consumable':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="39" height="35" viewBox="0 0 39 35" fill="none" className={iconStyle}>
          <ellipse cx="15.7694" cy="31.8241" rx="2.67568" ry="2.6757" fill="#238D88" stroke="#238D88"/>
          <ellipse cx="28.2577" cy="31.8241" rx="2.67568" ry="2.6757" fill="#238D88" stroke="#238D88"/>
          <path d="M1.5 1.5H5.43266L7.44368 10.1693M7.44368 10.1693C7.44368 10.1693 10.3485 23.6548 11.3317 24.618C12.3148 25.5813 13.298 25.5813 13.298 25.5813H30.995C30.995 25.5813 31.9781 25.5813 32.9613 24.618C33.9445 23.6548 36.894 12.0958 36.894 12.0958C36.894 12.0958 37.5278 10.1693 36.894 10.1693C36.2601 10.1693 7.44368 10.1693 7.44368 10.1693Z" stroke="#238D88" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      );
    
    case 'medical':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="37" height="34" viewBox="0 0 37 34" fill="none" className={iconStyle}>
          <path d="M11.6901 8.27778C11.6901 8.27778 11.7136 7.39372 11.6901 4.88889C11.6667 2.38406 12.5507 1.5 15.079 1.5C17.6073 1.5 21.8568 1.5 21.8568 1.5C24.457 1.5122 25.2457 2.38406 25.2457 4.88889C25.2457 7.39372 25.2457 8.27778 25.2457 8.27778M11.6901 8.27778H6.60678C4.65817 8.27778 3.42122 9.97222 3.21789 11.6667L1.52345 28.6111C1.32011 30.3056 2.43845 32 4.91233 32H32.0234C34.4973 32 35.6157 30.3056 35.4123 28.6111L33.7179 11.6667C33.5146 9.97222 32.1251 8.27778 30.329 8.27778H25.2457M11.6901 8.27778H25.2457" stroke="#238D88" strokeWidth="3"/>
        </svg>
      );
    
    case 'education':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="91" height="82" viewBox="0 0 91 82" fill="none" className={iconStyle}>
          <rect x="3.25" y="3.25" width="84" height="75" rx="10" stroke="#232527" strokeWidth="6.5" strokeLinecap="round"/>
          <line x1="15.5" y1="32" x2="75" y2="32" stroke="#232527" strokeWidth="6.5" strokeLinecap="round"/>
        </svg>
      );
    
    case 'other':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="33" height="39" viewBox="0 0 33 39" fill="none" className={iconStyle}>
          <mask id="path-1-outside-1_4234_11619" maskUnits="userSpaceOnUse" x="-0.994141" y="0" width="34" height="39" fill="black">
            <rect fill="white" x="-0.994141" width="34" height="39"/>
            <path d="M16.1016 3.1123C16.2886 2.96026 16.5577 2.96285 16.7412 3.11914L29.0645 13.6133C29.4182 13.9148 29.2051 14.4931 28.7402 14.4932H27.0986V35.8408H22.0986V31.1074C22.0985 28.8984 20.3077 27.1074 18.0986 27.1074H15.0986C12.8896 27.1074 11.0988 28.8984 11.0986 31.1074V35.8408H5.09863V14.4932H3.50684C3.03614 14.4932 2.82615 13.9024 3.19141 13.6055L16.1016 3.1123Z"/>
          </mask>
          <path d="M16.1016 3.1123L17.9937 5.44032L17.9938 5.4403L16.1016 3.1123ZM16.7412 3.11914L18.6862 0.835097L18.6862 0.835032L16.7412 3.11914ZM29.0645 13.6133L31.0106 11.3302L31.0095 11.3292L29.0645 13.6133ZM28.7402 14.4932V17.4932H28.7403L28.7402 14.4932ZM27.0986 14.4932V11.4932H24.0986V14.4932H27.0986ZM27.0986 35.8408V38.8408H30.0986V35.8408H27.0986ZM22.0986 35.8408H19.0986V38.8408H22.0986V35.8408ZM22.0986 31.1074H25.0986V31.1072L22.0986 31.1074ZM18.0986 27.1074V24.1074V27.1074ZM15.0986 27.1074V24.1074V27.1074ZM11.0986 31.1074L8.09863 31.1072V31.1074H11.0986ZM11.0986 35.8408V38.8408H14.0986V35.8408H11.0986ZM5.09863 35.8408H2.09863V38.8408H5.09863V35.8408ZM5.09863 14.4932H8.09863V11.4932H5.09863V14.4932ZM3.19141 13.6055L1.29923 11.2774L1.29919 11.2775L3.19141 13.6055ZM16.1016 3.1123L17.9938 5.4403C17.0627 6.19707 15.7181 6.18824 14.7963 5.40325L16.7412 3.11914L18.6862 0.835032C17.3972 -0.26253 15.5146 -0.276563 14.2094 0.784313L16.1016 3.1123ZM16.7412 3.11914L14.7962 5.40318L27.1194 15.8973L29.0645 13.6133L31.0095 11.3292L18.6862 0.835097L16.7412 3.11914ZM29.0645 13.6133L27.1183 15.8964C25.3487 14.388 26.4166 11.4932 28.7401 11.4932L28.7402 14.4932L28.7403 17.4932C31.9937 17.4931 33.4876 13.4417 31.0106 11.3302L29.0645 13.6133ZM28.7402 14.4932V11.4932H27.0986V14.4932V17.4932H28.7402V14.4932ZM27.0986 14.4932H24.0986V35.8408H27.0986H30.0986V14.4932H27.0986ZM27.0986 35.8408V32.8408H22.0986V35.8408V38.8408H27.0986V35.8408ZM22.0986 35.8408H25.0986V31.1074H22.0986H19.0986V35.8408H22.0986ZM22.0986 31.1074L25.0986 31.1072C25.0984 27.2417 21.9647 24.1074 18.0986 24.1074V27.1074V30.1074C18.6506 30.1074 19.0986 30.5551 19.0986 31.1076L22.0986 31.1074ZM18.0986 27.1074V24.1074H15.0986V27.1074V30.1074H18.0986V27.1074ZM15.0986 27.1074V24.1074C11.2325 24.1074 8.09891 27.2417 8.09863 31.1072L11.0986 31.1074L14.0986 31.1076C14.0987 30.5551 14.5467 30.1074 15.0986 30.1074V27.1074ZM11.0986 31.1074H8.09863V35.8408H11.0986H14.0986V31.1074H11.0986ZM11.0986 35.8408V32.8408H5.09863V35.8408V38.8408H11.0986V35.8408ZM5.09863 35.8408H8.09863V14.4932H5.09863H2.09863V35.8408H5.09863ZM5.09863 14.4932V11.4932H3.50684V14.4932V17.4932H5.09863V14.4932ZM3.50684 14.4932V11.4932C5.8579 11.4932 6.91179 14.4475 5.08362 15.9335L3.19141 13.6055L1.29919 11.2775C-1.2595 13.3572 0.214373 17.4932 3.50684 17.4932V14.4932ZM3.19141 13.6055L5.08358 15.9335L17.9937 5.44032L16.1016 3.1123L14.2094 0.784286L1.29923 11.2774L3.19141 13.6055Z" fill="#238D88" mask="url(#path-1-outside-1_4234_11619)"/>
        </svg>
      );
  }
};
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
            className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${
              currentView === "dayGridMonth"
                ? "bg-[#238D88] text-white border-[#238D88]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange("timeGridWeek")}
            className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${
              currentView === "timeGridWeek"
                ? "bg-[#238D88] text-white border-[#238D88]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange("timeGridDay")}
            className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${
              currentView === "timeGridDay"
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
              eventTimeFormat={{
                // Optional: if you want to control time format
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }}
              // For month view, events typically don't show time by default
              // But if they do, you can use eventContent to customize
              eventContent={(eventInfo) => {
                return {
                  html: `<div class="fc-event-title">${eventInfo.event.title}</div>`,
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
<div className="p-6">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Reminder for restocking items
      </h3>
      <p className="text-sm text-gray-500">
        Enable the toggle to receive reminders for specific items.
      </p>
      {restockCacheInfo && restockCacheInfo.cached && (
        <p className="text-xs text-gray-400 mt-1">
          {/* Data cached {restockCacheInfo.cacheAge}h ago • Next refresh: {new Date(restockCacheInfo.nextRefresh).toLocaleTimeString()} */}
        </p>
      )}
    </div>
    
    {/* Optional: Add a manual refresh button */}
    <button
      onClick={handleRefreshRestock}
      disabled={refreshingRestock}
      className="px-4 py-2 text-sm bg-[#238D88] text-white rounded-lg hover:bg-[#1a6d68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {refreshingRestock ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Refreshing...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </>
      )}
    </button>
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
          className={`border rounded-lg p-4 bg-white transition-all ${item.reminderEnabled}`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            {/* UPDATED: Added icon container with circular background */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Category Icon with Circular Background */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#238D88]/10 rounded-full flex items-center justify-center">
                  {getCategoryIcon(item.category)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 mb-1 text-sm leading-tight">
                  {item.productName}
                </h4>
                <p className="text-xs text-gray-500">{item.category}</p>
                <div>
                  <p className="text-xs text-gray-500">Last purchased: {item.lastPurchasedText}</p>
                </div>
              </div>
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
