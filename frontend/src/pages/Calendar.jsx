// // frontend/src/pages/Calendar.jsx
//Old Code

// import React, { useRef, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import AddEventModal from "../components/AddEventModal";
// import UpcomingEvents from "../components/UpcomingEvents";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import ReminderModal from "../components/ReminderModal";
// import CustomReminderModal from "../components/CustomReminderModal";
// import { useChild } from "../contexts/ChildContext";
// import ChildAvatar from "../components/ChildAvatar";

// // Icons
// function BellIcon({ className = "w-5 h-5" }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="1.5"
//         d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z"
//       />
//     </svg>
//   );
// }

// function LocationIcon({ className = "w-4 h-4" }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//       />
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//       />
//     </svg>
//   );
// }

// function UserIcon({ className = "w-6 h-6" }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//       />
//     </svg>
//   );
// }

// function ChevronLeftIcon({ className = "w-5 h-5" }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         d="M15 19l-7-7 7-7"
//       />
//     </svg>
//   );
// }

// function ChevronRightIcon({ className = "w-5 h-5" }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         d="M9 5l7 7-7 7"
//       />
//     </svg>
//   );
// }

// // Vaccination Section Component
// function VaccinationSection({ selectedChild, userData }) {
//   const [vaccinations, setVaccinations] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchVaccinations = async () => {
//       if (!selectedChild?._id || !userData?.id) {
//         setVaccinations([]);
//         return;
//       }

//       try {
//         setLoading(true);
//         const base = import.meta.env.VITE_BACKEND_URL || "";
//         const vaccUrl = `${base}/api/users/${userData.id}/children/${selectedChild._id
//           }/vaccinations/recommendations${selectedChild.dateOfBirth
//             ? `?birthDate=${encodeURIComponent(selectedChild.dateOfBirth)}`
//             : ""
//           }`;
//         const vaccRes = await fetch(vaccUrl);
//         if (vaccRes.ok) {
//           const vaccData = await vaccRes.json();
//           // Show only upcoming (future) vaccinations
//           const today = new Date();
//           today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

//           const upcoming = (vaccData?.recommendations || [])
//             .filter((r) => {
//               if (!r?.recommendedDate) return false;
//               const vaccDate = new Date(r.recommendedDate);
//               vaccDate.setHours(0, 0, 0, 0);
//               // Only show vaccinations that are today or in the future
//               return vaccDate >= today;
//             })
//             .sort(
//               (a, b) =>
//                 new Date(a.recommendedDate) - new Date(b.recommendedDate)
//             );
//           setVaccinations(upcoming);
//         }
//       } catch (e) {
//         console.error("Error fetching vaccinations:", e);
//         setVaccinations([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVaccinations();
//   }, [selectedChild?._id, userData?.id, selectedChild?.dateOfBirth]);

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     const month = date.toLocaleString("en-US", { month: "short" });
//     const day = date.getDate();
//     const year = date.getFullYear();
//     return `Due on ${month} ${day}, ${year}.`;
//   };

//   return (
//     <div className="mt-6">
//       <div className="bg-white rounded-2xl border shadow-sm p-6">
//         <h2 className="text-xl font-bold text-gray-800 mb-6">
//           It's Vaccination Time!
//         </h2>

//         {loading ? (
//           <div className="text-center py-8">
//             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#238D88] mx-auto mb-3"></div>
//             <p className="text-sm text-gray-600">Loading vaccinations...</p>
//           </div>
//         ) : vaccinations.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-gray-600 mb-4">
//               No upcoming vaccinations scheduled
//             </p>
//             <a
//               href="https://www.google.com/maps/search/child+hospitals+near+me"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center justify-center rounded-lg bg-[#238D88] text-white font-medium px-6 py-3 hover:bg-[#1a6d68] transition-colors"
//             >
//               Find Child Hospitals
//             </a>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {vaccinations.map((vacc, index) => (
//               <div
//                 key={index}
//                 className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-start gap-4">
//                   <div className="flex-shrink-0">
//                     <ChildAvatar
//                       child={selectedChild}
//                       size="md"
//                       className="w-12 h-12"
//                     />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-base font-semibold text-gray-800 mb-1">
//                       {vacc.name || "Vaccination"}
//                     </h3>
//                     <p className="text-sm text-gray-600 mb-3">
//                       {formatDate(vacc.recommendedDate)}
//                     </p>
//                     <a
//                       href="https://www.google.com/maps/search/child+hospitals+near+me"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="inline-flex items-center justify-center rounded-lg bg-[#238D88] text-white font-medium px-4 py-2 text-sm hover:bg-[#1a6d68] transition-colors"
//                     >
//                       Book Clinic
//                     </a>
//                   </div>
//                   <div className="flex-shrink-0">
//                     <label className="relative inline-flex items-center cursor-pointer">
//                       <input type="checkbox" className="sr-only peer" />
//                       <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#238D88]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#238D88]"></div>
//                     </label>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function CalendarPage() {
//   const navigate = useNavigate();
//   const calendarRef = useRef(null);

//   // Calendar & Events State
//   const { selectedChild } = useChild(); // Get selected child from context
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingEvent, setEditingEvent] = useState(null);
//   const [currentView, setCurrentView] = useState("dayGridMonth");
//   const [userData, setUserData] = useState(null);
//   const [upcomingEvents, setUpcomingEvents] = useState([]);
//   const [childrenList, setChildrenList] = useState([]);
//   const [currentDate, setCurrentDate] = useState(new Date());

//   // Restock State
//   const [restockItems, setRestockItems] = useState([]);
//   const [loadingRestock, setLoadingRestock] = useState(false);
//   const [showRestockDateModal, setShowRestockDateModal] = useState(false);
//   const [selectedRestockItem, setSelectedRestockItem] = useState(null);
//   const [showRestockCustomModal, setShowRestockCustomModal] = useState(false);
//   const [customRestockDays, setCustomRestockDays] = useState("");
// const [restockCacheInfo, setRestockCacheInfo] = useState(null);
// const [refreshingRestock, setRefreshingRestock] = useState(false);
//   // Load user data
//   useEffect(() => {
//     const loadUserData = async () => {
//       try {
//         const token = localStorage.getItem("accessToken");
//         if (!token) {
//           navigate("/login");
//           return;
//         }

//         const res = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (res.ok) {
//           const userData = await res.json();
//           setUserData(userData);
//         }
//       } catch (error) {
//         console.error("Error loading user data:", error);
//       }
//     };

//     loadUserData();
//   }, [navigate]);

//   // Load upcoming events - filtered by selected child
//   useEffect(() => {
//     const loadUpcomingEvents = async () => {
//       try {
//         const token = localStorage.getItem("accessToken");
//         if (!token) return;

//         const now = new Date().toISOString();
//         const thirtyDaysLater = new Date();
//         thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
//         const endDate = thirtyDaysLater.toISOString();

//         // Add child filter if a child is selected
//         const params = new URLSearchParams();
//         params.set("start", now);
//         params.set("end", endDate);
//         if (selectedChild?._id) {
//           params.set("child", selectedChild._id);
//         }

//         const url = `${import.meta.env.VITE_BACKEND_URL
//           }/api/calendar?${params.toString()}`;
//         const resp = await fetch(url, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (resp.ok) {
//           const data = await resp.json();
//           const sortedEvents = (data.events || [])
//             .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
//             .slice(0, 5);
//           setUpcomingEvents(sortedEvents);
//         }
//       } catch (err) {
//         console.error("Error loading upcoming events:", err);
//       }
//     };

//     loadUpcomingEvents();
//   }, [modalOpen, selectedChild]);

//   // Load children for event cards
//   useEffect(() => {
//     const loadChildren = async () => {
//       try {
//         const token = localStorage.getItem("accessToken");
//         if (!token) {
//           console.log("No token found");
//           return;
//         }

//         const res = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/children`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (res.ok) {
//           const data = await res.json();
//           if (data.success && data.children) {
//             setChildrenList(data.children);
//           } else {
//             setChildrenList([]);
//           }
//         } else {
//           console.error("Failed to fetch children:", res.status);
//           setChildrenList([]);
//         }
//       } catch (error) {
//         console.error("Error loading children:", error);
//         setChildrenList([]);
//       }
//     };

//     loadChildren();
//   }, []);

//   // Fetch ALL restock items (no category filter)
//   useEffect(() => {
//     const fetchRestockItems = async () => {
//       try {
//         setLoadingRestock(true);
//         const token = localStorage.getItem("accessToken");
//         if (!token) return;

//         const response = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/budget/restock-items`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//       if (response.ok) {
//         const data = await response.json();
//         console.log("📦 Restock items:", data.items);
//         setRestockItems(data.items || []);
//       }
//     } catch (error) {
//       console.error("Error fetching restock items:", error);
//     } finally {
//       setLoadingRestock(false);
//     }
//   };

//   fetchRestockItems();
// }, []);
// const handleRefreshRestock = async () => {
//   try {
//     setRefreshingRestock(true);
//     const token = localStorage.getItem("accessToken");
//     if (!token) return;

//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/budget/restock-items?refresh=true`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//     if (response.ok) {
//       const data = await response.json();
//       setRestockItems(data.items || []);
//       setRestockCacheInfo({
//         cached: data.cached,
//         cacheAge: data.cacheAge,
//         nextRefresh: data.nextRefresh
//       });
//     }
//   } catch (error) {
//     console.error("Error refreshing restock items:", error);
//   } finally {
//     setRefreshingRestock(false);
//   }
// };
//   // Handle toggle reminder
//   const handleToggleReminder = async (item) => {
//     const newState = !item.reminderEnabled;

//     if (newState) {
//       console.log("Opening date modal for:", item.productName);
//       setSelectedRestockItem(item);
//       setShowRestockDateModal(true);
//     } else {
//       await disableRestockReminder(item);
//     }
//   };

//   const handleRestockCustomSave = async (customDays) => {
//     setCustomRestockDays(customDays);
//     setShowRestockCustomModal(false);
//     setShowRestockDateModal(true);
//   };

//   const handleRestockReminderSelect = async (alertType) => {
//     console.log(" Restock reminder selected:", alertType);

//     if (alertType === "Custom") {
//       setShowRestockDateModal(false);
//       setShowRestockCustomModal(true);
//     }
//   };

//   const handleRestockDateSave = async (alertType, selectedDate) => {
//     try {
//       if (alertType === "Custom") {
//         console.log(" Custom button clicked - opening CustomReminderModal");
//         setShowRestockDateModal(false);
//         setShowRestockCustomModal(true);
//         return;
//       }

//       const token = localStorage.getItem("accessToken");

//       if (!selectedDate) {
//         // alert("Please select a date");
//         return;
//       }

//       let customDaysValue = null;
//       if (customRestockDays) {
//         customDaysValue = parseFloat(customRestockDays);
//         console.log(" Using custom days:", customDaysValue);
//       }

//       console.log(" Saving restock reminder:", {
//         productName: selectedRestockItem.productName,
//         date: selectedDate,
//         alertType,
//         customDays: customDaysValue,
//       });

//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/budget/restock/toggle`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             productName: selectedRestockItem.productName,
//             enabled: true,
//             nextRestockDate: selectedDate.toISOString(),
//             alertType: customRestockDays ? "Custom" : alertType,
//             customDays: customDaysValue,
//           }),
//         }
//       );

//       const result = await response.json();

//       if (response.ok) {
//         setRestockItems((prevItems) =>
//           prevItems.map((i) =>
//             i.productName === selectedRestockItem.productName
//               ? {
//                 ...i,
//                 reminderEnabled: true,
//                 nextRestockDate: selectedDate.toISOString(),
//               }
//               : i
//           )
//         );

//         console.log(" Restock reminder saved successfully");

//         setShowRestockDateModal(false);
//         setShowRestockCustomModal(false);
//         setSelectedRestockItem(null);
//         setCustomRestockDays("");

//         const api = calendarRef.current?.getApi?.();
//         if (api) api.refetchEvents();
//       } else {
//         console.error("Failed to save reminder:", result);
//       }
//     } catch (error) {
//       console.error("Error saving restock reminder:", error);
//     }
//   };

//   const handleRestockCustomClick = () => {
//     setShowRestockDateModal(false);
//     setShowRestockCustomModal(true);
//   };

//   const disableRestockReminder = async (item) => {
//     try {
//       const token = localStorage.getItem("accessToken");
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/budget/restock/toggle`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             productName: item.productName,
//             enabled: false,
//             nextRestockDate: item.nextRestockDate,
//           }),
//         }
//       );

//       if (response.ok) {
//         setRestockItems((prevItems) =>
//           prevItems.map((i) =>
//             i.productName === item.productName
//               ? { ...i, reminderEnabled: false }
//               : i
//           )
//         );

//         const api = calendarRef.current?.getApi?.();
//         if (api) api.refetchEvents();
//       } else {
//         const errorData = await response.json();
//         console.error("Failed to disable reminder:", errorData);
//       }
//     } catch (error) {
//       console.error("Error disabling reminder:", error);
//     }
//   };

//   // Calendar functions
//   async function fetchEventsForRange(info) {
//     const start = info.start.toISOString();
//     const end = info.end.toISOString();

//     try {
//       const token = localStorage.getItem("accessToken");
//       if (!token) return [];

//       // Fetch calendar events
//       const params = new URLSearchParams();
//       params.set("start", start);
//       params.set("end", end);
//       if (selectedChild?._id) {
//         params.set("child", selectedChild._id);
//       }

//       const url = `${import.meta.env.VITE_BACKEND_URL
//         }/api/calendar?${params.toString()}`;
//       const resp = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (resp.status === 401) {
//         localStorage.removeItem("accessToken");
//         window.location.href = "/login";
//         return [];
//       }

//       const data = await resp.json();
//       if (!resp.ok) throw new Error(data?.message || "Failed to load events");

//       // In the fetchEventsForRange function, update the event color:
//       let fcEvents = (data.events || []).map((ev) => {
//         // Use the event's color (which should be child-specific)
//         const eventColor = ev.color || '#F3BE08';

//         return {
//           id: ev._id,
//           title: ev.title,
//           start: ev.startDate,
//           end: ev.endDate || undefined,
//           backgroundColor: eventColor,
//           borderColor: eventColor,
//           textColor: '#FFFFFF', // White text for better contrast
//           extendedProps: { raw: ev },
//         };
//       });

//       // Also fetch vaccination events if a child is selected
//       if (selectedChild?._id && userData?.id && selectedChild?.dateOfBirth) {
//         try {
//           const base = import.meta.env.VITE_BACKEND_URL || "";
//           const vaccUrl = `${base}/api/users/${userData.id}/children/${selectedChild._id
//             }/vaccinations/recommendations${selectedChild.dateOfBirth
//               ? `?birthDate=${encodeURIComponent(selectedChild.dateOfBirth)}`
//               : ""
//             }`;
//           const vaccRes = await fetch(vaccUrl);
//           if (vaccRes.ok) {
//             const vaccData = await vaccRes.json();
//             const vaccinationEvents = (vaccData?.recommendations || [])
//               .filter((r) => {
//                 if (!r?.recommendedDate) return false;
//                 const vaccDate = new Date(r.recommendedDate);
//                 vaccDate.setHours(0, 0, 0, 0); // Normalize to start of day
//                 const startDate = new Date(start);
//                 startDate.setHours(0, 0, 0, 0);
//                 const endDate = new Date(end);
//                 endDate.setHours(23, 59, 59, 999); // Include entire end date
//                 // Only include vaccinations within the current calendar view range
//                 return vaccDate >= startDate && vaccDate <= endDate;
//               })
//               .map((r) => ({
//                 id: `vacc-${r.name}-${r.recommendedDate}`, // Unique ID for vaccination
//                 title: `${r.name} vaccination`,
//                 start: r.recommendedDate,
//                 backgroundColor: "#006F69", // Vaccination color
//                 extendedProps: {
//                   raw: {
//                     title: `${r.name} vaccination`,
//                     startDate: r.recommendedDate,
//                     type: "vaccination",
//                     color: "#006F69",
//                   },
//                 },
//               }));
//             fcEvents = [...fcEvents, ...vaccinationEvents];
//           }
//         } catch (vaccErr) {
//           console.error("Error fetching vaccination events:", vaccErr);
//           // Continue with calendar events even if vaccination fetch fails
//         }
//       }

//       return fcEvents;
//     } catch (err) {
//       console.error("Error loading events", err);
//       return [];
//     }
//   }

//   // Handle event click from UpcomingEvents
//   const handleEventClickFromUpcoming = (event) => {
//     setEditingEvent(event);
//     setModalOpen(true);
//   };

//   function handleDateSelect(selectInfo) {
//     setEditingEvent({
//       startDate: selectInfo.startStr,
//       endDate: selectInfo.endStr || null,
//     });
//     setModalOpen(true);
//   }

//   function handleEventClick(clickInfo) {
//     const raw = clickInfo.event.extendedProps.raw;
//     if (!raw) return;
//     setEditingEvent(raw);
//     setModalOpen(true);
//   }

//   function refreshCalendar() {
//     const api = calendarRef.current?.getApi?.();
//     if (api) api.refetchEvents();
//   }

//   // Refresh calendar when selected child changes
//   useEffect(() => {
//     const api = calendarRef.current?.getApi?.();
//     if (api) {
//       api.refetchEvents();
//     }
//   }, [selectedChild]);

//   function handleViewChange(view) {
//     const api = calendarRef.current.getApi();
//     api.changeView(view);
//     setCurrentView(view);
//   }

//   function handlePrevMonth() {
//     const api = calendarRef.current.getApi();
//     api.prev();
//     updateCurrentDate(api);
//   }

//   function handleNextMonth() {
//     const api = calendarRef.current.getApi();
//     api.next();
//     updateCurrentDate(api);
//   }

//   function handleToday() {
//     const api = calendarRef.current.getApi();
//     api.today();
//     updateCurrentDate(api);
//   }

//   function updateCurrentDate(api) {
//     const currentDate = api.getDate();
//     setCurrentDate(currentDate);
//   }

//   function formatDate(dateString) {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   }

//   function formatTime(dateString) {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   }

//   function getChildName(childId) {
//     const child = childrenList.find((c) => c._id === childId);
//     return child ? child.name : "Unknown Child";
//   }

//   function getMonthYearString() {
//     return currentDate.toLocaleDateString("en-US", {
//       month: "long",
//       year: "numeric",
//     });
//   }
//   // Category Icons function
//   const getCategoryIcon = (category) => {
//     const iconStyle = "w-8 h-8"; // Adjust size as needed

//     switch (category?.toLowerCase()) {
//       case 'consumable':
//         return (
//           <svg xmlns="http://www.w3.org/2000/svg" width="39" height="35" viewBox="0 0 39 35" fill="none" className={iconStyle}>
//             <ellipse cx="15.7694" cy="31.8241" rx="2.67568" ry="2.6757" fill="#238D88" stroke="#238D88" />
//             <ellipse cx="28.2577" cy="31.8241" rx="2.67568" ry="2.6757" fill="#238D88" stroke="#238D88" />
//             <path d="M1.5 1.5H5.43266L7.44368 10.1693M7.44368 10.1693C7.44368 10.1693 10.3485 23.6548 11.3317 24.618C12.3148 25.5813 13.298 25.5813 13.298 25.5813H30.995C30.995 25.5813 31.9781 25.5813 32.9613 24.618C33.9445 23.6548 36.894 12.0958 36.894 12.0958C36.894 12.0958 37.5278 10.1693 36.894 10.1693C36.2601 10.1693 7.44368 10.1693 7.44368 10.1693Z" stroke="#238D88" strokeWidth="3" strokeLinecap="round" />
//           </svg>
//         );

//       case 'medical':
//         return (
//           <svg xmlns="http://www.w3.org/2000/svg" width="37" height="34" viewBox="0 0 37 34" fill="none" className={iconStyle}>
//             <path d="M11.6901 8.27778C11.6901 8.27778 11.7136 7.39372 11.6901 4.88889C11.6667 2.38406 12.5507 1.5 15.079 1.5C17.6073 1.5 21.8568 1.5 21.8568 1.5C24.457 1.5122 25.2457 2.38406 25.2457 4.88889C25.2457 7.39372 25.2457 8.27778 25.2457 8.27778M11.6901 8.27778H6.60678C4.65817 8.27778 3.42122 9.97222 3.21789 11.6667L1.52345 28.6111C1.32011 30.3056 2.43845 32 4.91233 32H32.0234C34.4973 32 35.6157 30.3056 35.4123 28.6111L33.7179 11.6667C33.5146 9.97222 32.1251 8.27778 30.329 8.27778H25.2457M11.6901 8.27778H25.2457" stroke="#238D88" strokeWidth="3" />
//           </svg>
//         );

//       case 'education':
//         return (
//           <svg xmlns="http://www.w3.org/2000/svg" width="91" height="82" viewBox="0 0 91 82" fill="none" className={iconStyle}>
//             <rect x="3.25" y="3.25" width="84" height="75" rx="10" stroke="#232527" strokeWidth="6.5" strokeLinecap="round" />
//             <line x1="15.5" y1="32" x2="75" y2="32" stroke="#232527" strokeWidth="6.5" strokeLinecap="round" />
//           </svg>
//         );

//       case 'other':
//       default:
//         return (
//           <svg xmlns="http://www.w3.org/2000/svg" width="33" height="39" viewBox="0 0 33 39" fill="none" className={iconStyle}>
//             <mask id="path-1-outside-1_4234_11619" maskUnits="userSpaceOnUse" x="-0.994141" y="0" width="34" height="39" fill="black">
//               <rect fill="white" x="-0.994141" width="34" height="39" />
//               <path d="M16.1016 3.1123C16.2886 2.96026 16.5577 2.96285 16.7412 3.11914L29.0645 13.6133C29.4182 13.9148 29.2051 14.4931 28.7402 14.4932H27.0986V35.8408H22.0986V31.1074C22.0985 28.8984 20.3077 27.1074 18.0986 27.1074H15.0986C12.8896 27.1074 11.0988 28.8984 11.0986 31.1074V35.8408H5.09863V14.4932H3.50684C3.03614 14.4932 2.82615 13.9024 3.19141 13.6055L16.1016 3.1123Z" />
//             </mask>
//             <path d="M16.1016 3.1123L17.9937 5.44032L17.9938 5.4403L16.1016 3.1123ZM16.7412 3.11914L18.6862 0.835097L18.6862 0.835032L16.7412 3.11914ZM29.0645 13.6133L31.0106 11.3302L31.0095 11.3292L29.0645 13.6133ZM28.7402 14.4932V17.4932H28.7403L28.7402 14.4932ZM27.0986 14.4932V11.4932H24.0986V14.4932H27.0986ZM27.0986 35.8408V38.8408H30.0986V35.8408H27.0986ZM22.0986 35.8408H19.0986V38.8408H22.0986V35.8408ZM22.0986 31.1074H25.0986V31.1072L22.0986 31.1074ZM18.0986 27.1074V24.1074V27.1074ZM15.0986 27.1074V24.1074V27.1074ZM11.0986 31.1074L8.09863 31.1072V31.1074H11.0986ZM11.0986 35.8408V38.8408H14.0986V35.8408H11.0986ZM5.09863 35.8408H2.09863V38.8408H5.09863V35.8408ZM5.09863 14.4932H8.09863V11.4932H5.09863V14.4932ZM3.19141 13.6055L1.29923 11.2774L1.29919 11.2775L3.19141 13.6055ZM16.1016 3.1123L17.9938 5.4403C17.0627 6.19707 15.7181 6.18824 14.7963 5.40325L16.7412 3.11914L18.6862 0.835032C17.3972 -0.26253 15.5146 -0.276563 14.2094 0.784313L16.1016 3.1123ZM16.7412 3.11914L14.7962 5.40318L27.1194 15.8973L29.0645 13.6133L31.0095 11.3292L18.6862 0.835097L16.7412 3.11914ZM29.0645 13.6133L27.1183 15.8964C25.3487 14.388 26.4166 11.4932 28.7401 11.4932L28.7402 14.4932L28.7403 17.4932C31.9937 17.4931 33.4876 13.4417 31.0106 11.3302L29.0645 13.6133ZM28.7402 14.4932V11.4932H27.0986V14.4932V17.4932H28.7402V14.4932ZM27.0986 14.4932H24.0986V35.8408H27.0986H30.0986V14.4932H27.0986ZM27.0986 35.8408V32.8408H22.0986V35.8408V38.8408H27.0986V35.8408ZM22.0986 35.8408H25.0986V31.1074H22.0986H19.0986V35.8408H22.0986ZM22.0986 31.1074L25.0986 31.1072C25.0984 27.2417 21.9647 24.1074 18.0986 24.1074V27.1074V30.1074C18.6506 30.1074 19.0986 30.5551 19.0986 31.1076L22.0986 31.1074ZM18.0986 27.1074V24.1074H15.0986V27.1074V30.1074H18.0986V27.1074ZM15.0986 27.1074V24.1074C11.2325 24.1074 8.09891 27.2417 8.09863 31.1072L11.0986 31.1074L14.0986 31.1076C14.0987 30.5551 14.5467 30.1074 15.0986 30.1074V27.1074ZM11.0986 31.1074H8.09863V35.8408H11.0986H14.0986V31.1074H11.0986ZM11.0986 35.8408V32.8408H5.09863V35.8408V38.8408H11.0986V35.8408ZM5.09863 35.8408H8.09863V14.4932H5.09863H2.09863V35.8408H5.09863ZM5.09863 14.4932V11.4932H3.50684V14.4932V17.4932H5.09863V14.4932ZM3.50684 14.4932V11.4932C5.8579 11.4932 6.91179 14.4475 5.08362 15.9335L3.19141 13.6055L1.29919 11.2775C-1.2595 13.3572 0.214373 17.4932 3.50684 17.4932V14.4932ZM3.19141 13.6055L5.08358 15.9335L17.9937 5.44032L16.1016 3.1123L14.2094 0.784286L1.29923 11.2774L3.19141 13.6055Z" fill="#238D88" mask="url(#path-1-outside-1_4234_11619)" />
//           </svg>
//         );
//     }
//   };
//   return (
//     <div className="min-h-screen bg-[#EFEFEF] p-6">
//       {/* Welcome Section */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Hi, {userData?.name || "User"}
//         </h1>
//         <div className="flex items-center gap-2 mt-1">
//           <LocationIcon className="w-4 h-4 text-gray-500" />
//           <span className="text-gray-600 text-sm">
//             {userData?.country || "Your Location"}
//           </span>
//         </div>
//       </div>

//       {/* Calendar Controls Row */}
//       <div className="mb-6">
//         <div className="flex gap-4 mb-4">
//           <button
//             onClick={() => handleViewChange("dayGridMonth")}
//             className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${currentView === "dayGridMonth"
//               ? "bg-[#238D88] text-white border-[#238D88]"
//               : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//               }`}
//           >
//             Month
//           </button>
//           <button
//             onClick={() => handleViewChange("timeGridWeek")}
//             className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${currentView === "timeGridWeek"
//               ? "bg-[#238D88] text-white border-[#238D88]"
//               : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//               }`}
//           >
//             Week
//           </button>
//           <button
//             onClick={() => handleViewChange("timeGridDay")}
//             className={`flex-1 py-3 px-6 rounded-lg border transition-colors text-lg font-medium ${currentView === "timeGridDay"
//               ? "bg-[#238D88] text-white border-[#238D88]"
//               : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//               }`}
//           >
//             Day
//           </button>
//           <button
//             onClick={() => setModalOpen(true)}
//             className="flex-1 py-3 px-6 rounded-lg bg-[#F3BE08] text-gray-800 font-medium hover:bg-amber-500 transition-colors text-lg flex items-center justify-center gap-2"
//           >
//             Add Event +
//           </button>
//         </div>

//         {/* Month/Year Navigation */}
//         <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={handlePrevMonth}
//               className="p-2 rounded-full hover:bg-gray-100 transition-colors"
//             >
//               <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
//             </button>

//             <h2 className="text-xl font-semibold text-gray-800">
//               {getMonthYearString()}
//             </h2>

//             <button
//               onClick={handleNextMonth}
//               className="p-2 rounded-full hover:bg-gray-100 transition-colors"
//             >
//               <ChevronRightIcon className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>

//           <button
//             onClick={handleToday}
//             className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
//           >
//             Today
//           </button>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         {/* Calendar - Takes 2/3 on large screens */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
//             <FullCalendar
//               ref={calendarRef}
//               plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//               initialView="dayGridMonth"
//               headerToolbar={false}
//               selectable
//               select={handleDateSelect}
//               eventClick={handleEventClick}
//               events={fetchEventsForRange}
//               eventDisplay="block"
//               height="500px" // This sets the calendar height
//               // Add these props to remove time display
//               eventTimeFormat={{
//                 // Optional: if you want to control time format
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 hour12: true,
//               }}
//               // For month view, events typically don't show time by default
//               // But if they do, you can use eventContent to customize
//               eventContent={(eventInfo) => {
//                 return {
//                   html: `<div class="fc-event-title">${eventInfo.event.title}</div>`,
//                 };
//               }}
//             />
//           </div>
//         </div>

//         {/* Upcoming Events - Takes 1/3 on large screens with same height */}
//         <div>
//           <div className="bg-gray-100 rounded-lg shadow-sm border p-4 h-[532px]"> {/* Set fixed height to match calendar */}
//             <UpcomingEvents
//               selectedChild={selectedChild}
//               onEventClick={handleEventClickFromUpcoming}
//             />
//           </div>
//         </div>
//       </div>


// {/* Restock Items Section */}
// <div className="p-6">
//   <div className="mb-6 flex items-center justify-between">
//     <div>
//       <h3 className="text-lg font-semibold text-gray-800 mb-1">
//         Reminder for restocking items
//       </h3>
//        <p className="text-sm text-gray-500">
//         Enable the toggle to receive reminders for specific items.
//       </p>

//       {restockCacheInfo && restockCacheInfo.cached && (
//         <p className="text-xs text-gray-400 mt-1">
//           {/* Data cached {restockCacheInfo.cacheAge}h ago • Next refresh: {new Date(restockCacheInfo.nextRefresh).toLocaleTimeString()} */}
//         </p>
//       )}
//     </div>

//     {/* Optional: Add a manual refresh button */}
//     {/* <button
//       onClick={handleRefreshRestock}
//       disabled={refreshingRestock}
//       className="px-4 py-2 text-sm bg-[#238D88] text-white rounded-lg hover:bg-[#1a6d68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//     >
//       {refreshingRestock ? (
//         <>
//           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
//           </svg>
//           Refreshing...
//         </>
//       ) : (
//         <>
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//           </svg>
//         </>
//       )}
//     </button> */}
//   </div>


//         {loadingRestock ? (
//           <div className="text-center py-12 text-gray-500">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#238D88] mx-auto mb-4"></div>
//             <p className="text-sm">Loading restock items...</p>
//           </div>
//         ) : restockItems.length === 0 ? (

//           <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#F3BE08]">
//   <svg 
//     xmlns="http://www.w3.org/2000/svg" 
//     width="60" 
//     height="80" 
//     viewBox="0 0 100 100" 
//     fill="none"
//     className="mb-4" // Add margin bottom for spacing
//   >
//     <path d="M16 67V89.5C16 89.7761 16.2239 90 16.5 90H82.5C82.7761 90 83 89.7761 83 89.5V67" stroke="#232527" strokeWidth="6.5" strokeLinecap="square"/>
//     <path d="M39 90V67" stroke="#232527" strokeWidth="6.5" strokeLinecap="square"/>
//     <path d="M95.3962 38.8789L83.6662 12.5777C83.1902 11.5037 82.4563 10.5999 81.5472 9.96786C80.6381 9.33582 79.5897 9.00064 78.52 9H21.48C20.4103 9.00064 19.3619 9.33582 18.4528 9.96786C17.5437 10.5999 16.8098 11.5037 16.3338 12.5777L4.60379 38.8789C4.2033 39.7798 3.99653 40.7733 4.00004 41.7798V51.7072C3.99742 53.2134 4.46533 54.6731 5.32254 55.8329C6.58944 57.461 8.15413 58.7643 9.91027 59.6542C11.6664 60.5441 13.5729 60.9997 15.5 60.99C18.6446 60.9955 21.6933 59.7764 24.125 57.5412C26.5567 59.7777 29.6047 61 32.75 61C35.8953 61 38.9433 59.7777 41.375 57.5412C43.8067 59.7777 46.8547 61 50 61C53.1453 61 56.1933 59.7777 58.625 57.5412C61.0567 59.7777 64.1047 61 67.25 61C70.3953 61 73.4433 59.7777 75.875 57.5412C78.5894 60.0399 82.0623 61.2614 85.5634 60.9488C89.0645 60.6362 92.3212 58.814 94.6487 55.8651C95.5163 54.7098 95.9945 53.2497 96 51.7395V41.7798C96.0035 40.7733 95.7967 39.7798 95.3962 38.8789ZM84.5 54.5436C83.272 54.5404 82.0625 54.2081 80.9723 53.5746C79.882 52.941 78.9427 52.0245 78.2325 50.9014L75.875 47.2915L73.5462 50.9014C72.8225 52.0073 71.8767 52.9066 70.7853 53.5264C69.694 54.1462 68.4878 54.4692 67.2644 54.4692C66.0409 54.4692 64.8347 54.1462 63.7434 53.5264C62.652 52.9066 61.7062 52.0073 60.9825 50.9014L58.625 47.2915L56.2962 50.9014C55.5725 52.0073 54.6267 52.9066 53.5354 53.5264C52.444 54.1462 51.2378 54.4692 50.0144 54.4692C48.791 54.4692 47.5847 54.1462 46.4934 53.5264C45.402 52.9066 44.4562 52.0073 43.7325 50.9014L41.375 47.2915L39.0463 50.9014C38.3226 52.0073 37.3767 52.9066 36.2854 53.5264C35.194 54.1462 33.9878 54.4692 32.7644 54.4692C31.541 54.4692 30.3348 54.1462 29.2434 53.5264C28.152 52.9066 27.2062 52.0073 26.4825 50.9014L24.125 47.2915L21.7675 50.9014C21.0573 52.0245 20.118 52.941 19.0277 53.5746C17.9375 54.2081 16.728 54.5404 15.5 54.5436C14.4165 54.5584 13.3428 54.3129 12.351 53.8237C11.3592 53.3344 10.4723 52.6128 9.75004 51.7072V41.7798L21.48 15.4464H78.52L90.25 41.7476V51.6105C89.532 52.5288 88.648 53.2652 87.6566 53.7709C86.6652 54.2767 85.5891 54.54 84.5 54.5436Z" fill="#232527"/>
//   </svg>
//   <h2 className="text-[25px] font-semibold mb-3">
//     No items to restock yet!
//   </h2>
//   <div className="rounded-lg p-6 max-w-md">
//     <p className="text-gray-700 text-l text-center">
//       Add an expense or receipt to view restock items.
//     </p>
//   </div>
// </div>
//         ) : (
//           <div>
//             <div className="mb-6 flex items-center justify-between">
//     {/* <div>
//       <h3 className="text-lg font-semibold text-gray-800 mb-1">
//         Reminder for restocking items
//       </h3>
//       <p className="text-sm text-gray-500">
//         Enable the toggle to receive reminders for specific items.
//       </p>

//     </div> */}

//   </div>
//          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-[20px]">
//             {restockItems.map((item, index) => (
//               <div
//                 key={index}
//                 className={`border rounded-lg p-4 bg-white transition-all  h-[119px] ${item.reminderEnabled}`}
//               >
//                 <div className="flex items-start justify-between gap-3 mb-3">
//                   {/* UPDATED: Added icon container with circular background */}
//                   <div className="flex items-start gap-3 flex-1 min-w-0">
//                     {/* Category Icon with Circular Background */}
//                     <div className="flex-shrink-0">
//                       <div className="w-12 h-12 bg-[#238D88]/10 rounded-full flex items-center justify-center">
//                         {getCategoryIcon(item.category)}
//                       </div>
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-semibold text-gray-800 mb-1 text-sm leading-tight">
//                         {item.productName}
//                       </h4>
//                       <p className="text-xs text-gray-500">{item.category}</p>
//                       <div>
//                         <p className="text-xs text-gray-500">Last purchased: {item.lastPurchasedText}</p>
//                       </div>
//                     </div>
//                   </div>

//                   <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
//                     <input
//                       type="checkbox"
//                       checked={item.reminderEnabled}
//                       onChange={() => handleToggleReminder(item)}
//                       className="sr-only peer"
//                     />
//                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
//                   </label>
//                 </div>
//               </div>
//             ))}
//           </div>
//           </div>
//         )}
//       </div>

//       {/* Vaccination Section */}
//       <VaccinationSection selectedChild={selectedChild} userData={userData} />

//       {/* Add Event Modal */}
//       <AddEventModal
//         isOpen={modalOpen}
//         onClose={() => {
//           setModalOpen(false);
//           setEditingEvent(null);
//         }}
//         onSaved={() => {
//           setModalOpen(false);
//           setEditingEvent(null);
//           refreshCalendar();
//         }}
//         initialData={editingEvent}
//       />

//       {/* Restock Custom Reminder Modal */}
//       <CustomReminderModal
//         isOpen={showRestockCustomModal}
//         onClose={() => {
//           setShowRestockCustomModal(false);
//           setCustomRestockDays("");
//         }}
//         onSave={handleRestockCustomSave}
//         onDaysChange={setCustomRestockDays}
//       />

//       {/* Restock Date/Reminder Modal - Combined */}
//       <ReminderModal
//         isOpen={showRestockDateModal}
//         onClose={() => {
//           setShowRestockDateModal(false);
//           setSelectedRestockItem(null);
//           setCustomRestockDays("");
//         }}
//         onSelectAlert={handleRestockDateSave}
//         event={
//           selectedRestockItem
//             ? {
//               title: `Restock: ${selectedRestockItem.productName}`,
//               startDate: selectedRestockItem.nextRestockDate,
//             }
//             : null
//         }
//         customDaysPreview={customRestockDays}
//         existingReminder={null}
//         showDatePicker={true}
//         productName={selectedRestockItem?.productName || ""}
//       />
//     </div>
//   );
// }



//

// new code

//frontend/src/pages/Calendar.jsx
// frontend/src/pages/Calendar.jsx

import React, { useRef, useState, useEffect, useCallback } from "react";
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

// Icons (keep your existing icon components)
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

// Filter Icon for Mobile
function FilterIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      className={className}
    >
      <path
        d="M3.28125 6.125C3.28125 5.95095 3.35039 5.78403 3.47346 5.66096C3.59653 5.53789 3.76345 5.46875 3.9375 5.46875H17.0625C17.2365 5.46875 17.4035 5.53789 17.5265 5.66096C17.6496 5.78403 17.7188 5.95095 17.7188 6.125C17.7188 6.29905 17.6496 6.46597 17.5265 6.58904C17.4035 6.71211 17.2365 6.78125 17.0625 6.78125H3.9375C3.76345 6.78125 3.59653 6.71211 3.47346 6.58904C3.35039 6.46597 3.28125 6.29905 3.28125 6.125ZM5.46875 10.5C5.46875 10.3259 5.53789 10.159 5.66096 10.036C5.78403 9.91289 5.95095 9.84375 6.125 9.84375H14.875C15.049 9.84375 15.216 9.91289 15.339 10.036C15.4621 10.159 15.5312 10.3259 15.5312 10.5C15.5312 10.674 15.4621 10.841 15.339 10.964C15.216 11.0871 15.049 11.1562 14.875 11.1562H6.125C5.95095 11.1562 5.78403 11.0871 5.66096 10.964C5.53789 10.841 5.46875 10.674 5.46875 10.5ZM8.09375 14.875C8.09375 14.7009 8.16289 14.534 8.28596 14.411C8.40903 14.2879 8.57595 14.2187 8.75 14.2187H12.25C12.424 14.2187 12.591 14.2879 12.714 14.411C12.8371 14.534 12.9062 14.7009 12.9062 14.875C12.9062 15.049 12.8371 15.216 12.714 15.339C12.591 15.4621 12.424 15.5312 12.25 15.5312H8.75C8.57595 15.5312 8.40903 15.4621 8.28596 15.339C8.16289 15.216 8.09375 15.049 8.09375 14.875Z"
        fill="black"
      />
    </svg>
  );
}

// View Filter Popup Component
function ViewFilterPopup({ isOpen, onClose, currentView, onViewChange, anchorEl }) {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) &&
        anchorEl && !anchorEl.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, anchorEl]);

  const views = [
    {
      key: 'dayGridMonth',
      label: 'Month'
    },
    {
      key: 'timeGridWeek',
      label: 'Week'
    },
    {
      key: 'timeGridDay',
      label: 'Day'
    }
  ];

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="absolute top-full right-0 mt-2 w-48 p-6 bg-white rounded-[5px] shadow-xl border border-gray-200 z-50"
    >
      <div className="flex flex-col justify-start items-start gap-2.5 overflow-hidden">
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
          {views.map((view, index) => (
            <div key={view.key} className="w-full">
              <button
                onClick={() => {
                  onViewChange(view.key);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded transition-colors ${currentView === view.key ? 'bg-[#238D88] text-white' : 'text-black hover:bg-gray-50'
                  }`}
              >
                <div className={`text-xs font-semibold items-center font-dm-sans leading-6 tracking-tight ${currentView === view.key ? 'text-white' : 'text-black'
                  }`}>
                  {view.label}
                </div>
              </button>

              {/* Divider - Show only between items */}
              {index < views.length - 1 && (
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
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
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const upcoming = (vaccData?.recommendations || [])
            .filter((r) => {
              if (!r?.recommendedDate) return false;
              const vaccDate = new Date(r.recommendedDate);
              vaccDate.setHours(0, 0, 0, 0);
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
  const filterButtonRef = useRef(null);

  // Calendar & Events State
  const { selectedChild } = useChild();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [userData, setUserData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Restock State
  const [restockItems, setRestockItems] = useState([]);
  const [loadingRestock, setLoadingRestock] = useState(false);
  const [showRestockDateModal, setShowRestockDateModal] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState(null);
  const [showRestockCustomModal, setShowRestockCustomModal] = useState(false);
  const [customRestockDays, setCustomRestockDays] = useState("");
  const [restockCacheInfo, setRestockCacheInfo] = useState(null);
  const [refreshingRestock, setRefreshingRestock] = useState(false);

  const [refreshUpcomingEvents, setRefreshUpcomingEvents] = useState(0);

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
  const loadUpcomingEvents = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const now = new Date().toISOString();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const endDate = thirtyDaysLater.toISOString();

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

  useEffect(() => {
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
        }
      } catch (error) {
        console.error("Error fetching restock items:", error);
      } finally {
        setLoadingRestock(false);
      }
    };

    fetchRestockItems();
  }, []);

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

  const handleRestockDateSave = async (alertType, selectedDateTime) => {
    try {
      if (alertType === "Custom") {
        console.log(" Custom button clicked - opening CustomReminderModal");
        setShowRestockDateModal(false);
        setShowRestockCustomModal(true);
        return;
      }

      const token = localStorage.getItem("accessToken");

      if (!selectedDateTime) {
        return;
      }

      let customDaysValue = null;
      if (customRestockDays) {
        customDaysValue = parseFloat(customRestockDays);
        console.log(" Using custom days:", customDaysValue);
      }

      console.log(" Saving restock reminder:", {
        productName: selectedRestockItem.productName,
        date: selectedDateTime,
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
            nextRestockDate: selectedDateTime.toISOString(),
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
                nextRestockDate: selectedDateTime.toISOString(),
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
  const fetchEventsForRange = useCallback(async (info) => {
    const start = info.start.toISOString();
    const end = info.end.toISOString();

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return [];

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

      // Use child's background color for events
      const childColor = selectedChild?.backgroundColor;
      let fcEvents = (data.events || []).map((ev) => {
        const eventColor = childColor || ev.color || '#F3BE08';
        return {
          id: ev._id,
          title: ev.title,
          start: ev.startDate,
          end: ev.endDate || undefined,
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: '#FFFFFF',
          extendedProps: { raw: ev },
        };
      });

      if (selectedChild?._id && userData?.id && selectedChild?.dateOfBirth) {
        try {
          const base = import.meta.env.VITE_BACKEND_URL || "";
          const vaccUrl = `${base}/api/users/${userData.id}/children/${selectedChild._id
            }/vaccinations/recommendations${selectedChild.dateOfBirth
              ? `?birthDate=${encodeURIComponent(selectedChild.dateOfBirth)}`
              : ""
            }`;
          const vaccRes = await fetch(vaccUrl);
          if (vaccRes.ok) {
            const vaccData = await vaccRes.json();
            // Use child's background color for vaccination events too
            const vaccColor = childColor || "#006F69";
            const vaccinationEvents = (vaccData?.recommendations || [])
              .filter((r) => {
                if (!r?.recommendedDate) return false;
                const vaccDate = new Date(r.recommendedDate);
                vaccDate.setHours(0, 0, 0, 0);
                const startDate = new Date(start);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(end);
                endDate.setHours(23, 59, 59, 999);
                return vaccDate >= startDate && vaccDate <= endDate;
              })
              .map((r) => ({
                id: `vacc-${r.name}-${r.recommendedDate}`,
                title: `${r.name} vaccination`,
                start: r.recommendedDate,
                backgroundColor: vaccColor,
                borderColor: vaccColor,
                extendedProps: {
                  raw: {
                    title: `${r.name} vaccination`,
                    startDate: r.recommendedDate,
                    type: "vaccination",
                    color: vaccColor,
                  },
                },
              }));
            fcEvents = [...fcEvents, ...vaccinationEvents];
          }
        } catch (vaccErr) {
          console.error("Error fetching vaccination events:", vaccErr);
        }
      }

      return fcEvents;
    } catch (err) {
      console.error("Error loading events", err);
      return [];
    }
  }, [selectedChild, userData]);

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
    loadUpcomingEvents();
    setRefreshUpcomingEvents(prev => prev + 1);
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
    setShowFilterPopup(false);
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

    // Focus on today's date
    setTimeout(() => {
      const todayElement = document.querySelector('.fc-day-today');
      if (todayElement) {
        todayElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });

        // Add visual highlight
        todayElement.classList.add('ring-2', 'ring-[#238D88]', 'ring-opacity-50');
        setTimeout(() => {
          todayElement.classList.remove('ring-2', 'ring-[#238D88]', 'ring-opacity-50');
        }, 2000);
      }
    }, 100);
  }

  function updateCurrentDate(api) {
    const currentDate = api.getDate();
    setCurrentDate(currentDate);
  }

  function getMonthYearString() {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  function handleToday() {
    const api = calendarRef.current.getApi();
    api.today();
    updateCurrentDate(api);

    // Focus on today's date with highlight animation
    setTimeout(() => {
      const todayElement = document.querySelector('.fc-day-today');
      if (todayElement) {
        todayElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });

        // Add visual highlight animation
        todayElement.classList.add('ring-2', 'ring-[#238D88]', 'ring-opacity-50', 'today-highlight');
        setTimeout(() => {
          todayElement.classList.remove('ring-2', 'ring-[#238D88]', 'ring-opacity-50', 'today-highlight');
        }, 3000); // Highlight for 3 seconds
      }
    }, 100);
  }



  // Category Icons function
  const getCategoryIcon = (category) => {
    const iconStyle = "w-8 h-8";
    switch (category?.toLowerCase()) {
      case 'consumable':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="39" height="35" viewBox="0 0 39 35" fill="none" className={iconStyle}>
            <ellipse cx="15.7694" cy="31.8241" rx="2.67568" ry="2.6757" fill="#238D88" stroke="#238D88" />
            <ellipse cx="28.2577" cy="31.8241" rx="2.67568" ry="2.6757" fill="#238D88" stroke="#238D88" />
            <path d="M1.5 1.5H5.43266L7.44368 10.1693M7.44368 10.1693C7.44368 10.1693 10.3485 23.6548 11.3317 24.618C12.3148 25.5813 13.298 25.5813 13.298 25.5813H30.995C30.995 25.5813 31.9781 25.5813 32.9613 24.618C33.9445 23.6548 36.894 12.0958 36.894 12.0958C36.894 12.0958 37.5278 10.1693 36.894 10.1693C36.2601 10.1693 7.44368 10.1693 7.44368 10.1693Z" stroke="#238D88" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'medical':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="37" height="34" viewBox="0 0 37 34" fill="none" className={iconStyle}>
            <path d="M11.6901 8.27778C11.6901 8.27778 11.7136 7.39372 11.6901 4.88889C11.6667 2.38406 12.5507 1.5 15.079 1.5C17.6073 1.5 21.8568 1.5 21.8568 1.5C24.457 1.5122 25.2457 2.38406 25.2457 4.88889C25.2457 7.39372 25.2457 8.27778 25.2457 8.27778M11.6901 8.27778H6.60678C4.65817 8.27778 3.42122 9.97222 3.21789 11.6667L1.52345 28.6111C1.32011 30.3056 2.43845 32 4.91233 32H32.0234C34.4973 32 35.6157 30.3056 35.4123 28.6111L33.7179 11.6667C33.5146 9.97222 32.1251 8.27778 30.329 8.27778H25.2457M11.6901 8.27778H25.2457" stroke="#238D88" strokeWidth="3" />
          </svg>
        );
      case 'education':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="91" height="82" viewBox="0 0 91 82" fill="none" className={iconStyle}>
            <rect x="3.25" y="3.25" width="84" height="75" rx="10" stroke="#232527" strokeWidth="6.5" strokeLinecap="round" />
            <line x1="15.5" y1="32" x2="75" y2="32" stroke="#232527" strokeWidth="6.5" strokeLinecap="round" />
          </svg>
        );
      case 'other':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="33" height="39" viewBox="0 0 33 39" fill="none" className={iconStyle}>
            <mask id="path-1-outside-1_4234_11619" maskUnits="userSpaceOnUse" x="-0.994141" y="0" width="34" height="39" fill="black">
              <rect fill="white" x="-0.994141" width="34" height="39" />
              <path d="M16.1016 3.1123C16.2886 2.96026 16.5577 2.96285 16.7412 3.11914L29.0645 13.6133C29.4182 13.9148 29.2051 14.4931 28.7402 14.4932H27.0986V35.8408H22.0986V31.1074C22.0985 28.8984 20.3077 27.1074 18.0986 27.1074H15.0986C12.8896 27.1074 11.0988 28.8984 11.0986 31.1074V35.8408H5.09863V14.4932H3.50684C3.03614 14.4932 2.82615 13.9024 3.19141 13.6055L16.1016 3.1123Z" />
            </mask>
            <path d="M16.1016 3.1123L17.9937 5.44032L17.9938 5.4403L16.1016 3.1123ZM16.7412 3.11914L18.6862 0.835097L18.6862 0.835032L16.7412 3.11914ZM29.0645 13.6133L31.0106 11.3302L31.0095 11.3292L29.0645 13.6133ZM28.7402 14.4932V17.4932H28.7403L28.7402 14.4932ZM27.0986 14.4932V11.4932H24.0986V14.4932H27.0986ZM27.0986 35.8408V38.8408H30.0986V35.8408H27.0986ZM22.0986 35.8408H19.0986V38.8408H22.0986V35.8408ZM22.0986 31.1074H25.0986V31.1072L22.0986 31.1074ZM18.0986 27.1074V24.1074V27.1074ZM15.0986 27.1074V24.1074V27.1074ZM11.0986 31.1074L8.09863 31.1072V31.1074H11.0986ZM11.0986 35.8408V38.8408H14.0986V35.8408H11.0986ZM5.09863 35.8408H2.09863V38.8408H5.09863V35.8408ZM5.09863 14.4932H8.09863V11.4932H5.09863V14.4932ZM3.19141 13.6055L1.29923 11.2774L1.29919 11.2775L3.19141 13.6055ZM16.1016 3.1123L17.9938 5.4403C17.0627 6.19707 15.7181 6.18824 14.7963 5.40325L16.7412 3.11914L18.6862 0.835032C17.3972 -0.26253 15.5146 -0.276563 14.2094 0.784313L16.1016 3.1123ZM16.7412 3.11914L14.7962 5.40318L27.1194 15.8973L29.0645 13.6133L31.0095 11.3292L18.6862 0.835097L16.7412 3.11914ZM29.0645 13.6133L27.1183 15.8964C25.3487 14.388 26.4166 11.4932 28.7401 11.4932L28.7402 14.4932L28.7403 17.4932C31.9937 17.4931 33.4876 13.4417 31.0106 11.3302L29.0645 13.6133ZM28.7402 14.4932V11.4932H27.0986V14.4932V17.4932H28.7402V14.4932ZM27.0986 14.4932H24.0986V35.8408H27.0986H30.0986V14.4932H27.0986ZM27.0986 35.8408V32.8408H22.0986V35.8408V38.8408H27.0986V35.8408ZM22.0986 35.8408H25.0986V31.1074H22.0986H19.0986V35.8408H22.0986ZM22.0986 31.1074L25.0986 31.1072C25.0984 27.2417 21.9647 24.1074 18.0986 24.1074V27.1074V30.1074C18.6506 30.1074 19.0986 30.5551 19.0986 31.1076L22.0986 31.1074ZM18.0986 27.1074V24.1074H15.0986V27.1074V30.1074H18.0986V27.1074ZM15.0986 27.1074V24.1074C11.2325 24.1074 8.09891 27.2417 8.09863 31.1072L11.0986 31.1074L14.0986 31.1076C14.0987 30.5551 14.5467 30.1074 15.0986 30.1074V27.1074ZM11.0986 31.1074H8.09863V35.8408H11.0986H14.0986V31.1074H11.0986ZM11.0986 35.8408V32.8408H5.09863V35.8408V38.8408H11.0986V35.8408ZM5.09863 35.8408H8.09863V14.4932H5.09863H2.09863V35.8408H5.09863ZM5.09863 14.4932V11.4932H3.50684V14.4932V17.4932H5.09863V14.4932ZM3.50684 14.4932V11.4932C5.8579 11.4932 6.91179 14.4475 5.08362 15.9335L3.19141 13.6055L1.29919 11.2775C-1.2595 13.3572 0.214373 17.4932 3.50684 17.4932V14.4932ZM3.19141 13.6055L5.08358 15.9335L17.9937 5.44032L16.1016 3.1123L14.2094 0.784286L1.29923 11.2774L3.19141 13.6055Z" fill="#238D88" mask="url(#path-1-outside-1_4234_11619)" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEFEF] p-4 lg:p-6">
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

      {/* Calendar Controls Row - UPDATED MOBILE LAYOUT */}
      <div className="mb-6">
        {/* Desktop Layout */}
        <div className="hidden xl:block">
          <div className="w-full flex justify-between items-center gap-4 mb-4">
            {/* View Buttons Container - LEFT SIDE */}
            <div className="flex-1 max-w-[860px] bg-white rounded-[5px] overflow-hidden border border-gray-200">
              <div className="flex justify-start items-stretch">
                {/* Month Button */}
                <div className={`flex-1 ${currentView === "dayGridMonth" ? "bg-[#238D88]" : ""}`}>
                  <button
                    onClick={() => handleViewChange("dayGridMonth")}
                    className={`w-full h-10 flex justify-center items-center text-sm font-dm-sans leading-5 transition-colors ${currentView === "dayGridMonth"
                      ? "text-white font-extrabold"
                      : "text-black font-medium hover:bg-gray-50"
                      }`}
                  >
                    Month
                  </button>
                </div>

                {/* Divider */}
                <div className="w-px bg-gray-300"></div>

                {/* Week Button */}
                <div className={`flex-1 ${currentView === "timeGridWeek" ? "bg-[#238D88]" : ""}`}>
                  <button
                    onClick={() => handleViewChange("timeGridWeek")}
                    className={`w-full h-10 flex justify-center items-center text-sm font-dm-sans leading-5 transition-colors ${currentView === "timeGridWeek"
                      ? "text-white font-extrabold"
                      : "text-black font-medium hover:bg-gray-50"
                      }`}
                  >
                    Week
                  </button>
                </div>

                {/* Divider */}
                <div className="w-px bg-gray-300"></div>

                {/* Day Button */}
                <div className={`flex-1 ${currentView === "timeGridDay" ? "bg-[#238D88]" : ""}`}>
                  <button
                    onClick={() => handleViewChange("timeGridDay")}
                    className={`w-full h-10 flex justify-center items-center text-sm font-dm-sans leading-5 transition-colors ${currentView === "timeGridDay"
                      ? "text-white font-extrabold"
                      : "text-black font-medium hover:bg-gray-50"
                      }`}
                  >
                    Day
                  </button>
                </div>
              </div>
            </div>

            {/* Add Event Button - RIGHT SIDE */}
            <div className="w-96 h-14 px-32 py-3.5 bg-[#F3BE08] rounded-[10px] flex justify-center items-center gap-2.5 overflow-hidden">
              <button
                onClick={() => setModalOpen(true)}
                className="justify-center text-[#232527] text-xl font-dm-sans font-semibold leading-7 flex items-center gap-2"
              >
                Add Event +
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="xl:hidden">
          {/* First Row: Add Event Button */}
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-2.5 bg-[#F3BE08] rounded-[5px] inline-flex justify-center items-center gap-[5px] hover:bg-[#E0AB07] transition-colors"
            >
              <div className="text-center justify-center text-black text-xs font-semibold font-dm-sans leading-6 tracking-tight">
                Add Event +
              </div>
            </button>
          </div>

          {/* Second Row: Filter Only */}
          {/* <div className="flex justify-end items-center"> */}
          {/* Filter Button for Mobile */}
          {/* <div className="relative" ref={filterButtonRef}>
              <button
                onClick={() => setShowFilterPopup(!showFilterPopup)}
                className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                title="Filter Calendar"
              >
                <FilterIcon className="w-4 h-4 text-gray-700" />
              </button> */}

          {/* Filter Popup */}
          {/* <ViewFilterPopup
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                currentView={currentView}
                onViewChange={handleViewChange}
                anchorEl={filterButtonRef.current}
              />
            </div>
          </div> */}


        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Calendar - Takes 2/3 on large screens */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.2)] p-0 overflow-hidden flex-1 flex flex-col h-full">
            {/* Calendar Header - UPDATED: Removed green background from navigation */}
            <div className="flex justify-between items-center p-2 border-b border-[rgba(218,220,224,0.6)] bg-white">
              {/* Left: Month & Year Right and left Navigation */}
              <div className="flex items-center gap-3.5 px-1 lg:px-4">
                <button
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  onClick={handlePrevMonth}
                  title="Previous Month"
                >
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path d="M12 2L5 10L12 18" stroke="#000000" strokeWidth="2" />
                  </svg>
                </button>
                <div className="flex gap-2.5 items-center">
                  <h2 className="text-base font-semibold text-black">
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                </div>

                <button
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  onClick={handleNextMonth}
                  title="Next Month"
                >
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path d="M6 2L13 10L6 18" stroke="#000000" strokeWidth="2" />
                  </svg>
                </button>
              </div>


              {/* Today Button - Desktop Only */}
              <div className="hidden xl:block">
                <button
                  className="p-2 hover:bg-gray-100 rounded transition-colors ml-2"
                  onClick={handleToday}
                  title="Go to Today"
                >
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


              {/* Right: Filter Icon for Mobile - UPDATED: Now functional */}
              <div className="xl:hidden flex items-center">
                <div className="relative" ref={filterButtonRef}>
                  <button
                    onClick={() => setShowFilterPopup(!showFilterPopup)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                    title="Filter Calendar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 21 21"
                      fill="none"
                      className="w-4 h-4 text-black"
                    >
                      <path
                        d="M3.28125 6.125C3.28125 5.95095 3.35039 5.78403 3.47346 5.66096C3.59653 5.53789 3.76345 5.46875 3.9375 5.46875H17.0625C17.2365 5.46875 17.4035 5.53789 17.5265 5.66096C17.6496 5.78403 17.7188 5.95095 17.7188 6.125C17.7188 6.29905 17.6496 6.46597 17.5265 6.58904C17.4035 6.71211 17.2365 6.78125 17.0625 6.78125H3.9375C3.76345 6.78125 3.59653 6.71211 3.47346 6.58904C3.35039 6.46597 3.28125 6.29905 3.28125 6.125ZM5.46875 10.5C5.46875 10.3259 5.53789 10.159 5.66096 10.036C5.78403 9.91289 5.95095 9.84375 6.125 9.84375H14.875C15.049 9.84375 15.216 9.91289 15.339 10.036C15.4621 10.159 15.5312 10.3259 15.5312 10.5C15.5312 10.674 15.4621 10.841 15.339 10.964C15.216 11.0871 15.049 11.1562 14.875 11.1562H6.125C5.95095 11.1562 5.78403 11.0871 5.66096 10.964C5.53789 10.841 5.46875 10.674 5.46875 10.5ZM8.09375 14.875C8.09375 14.7009 8.16289 14.534 8.28596 14.411C8.40903 14.2879 8.57595 14.2187 8.75 14.2187H12.25C12.424 14.2187 12.591 14.2879 12.714 14.411C12.8371 14.534 12.9062 14.7009 12.9062 14.875C12.9062 15.049 12.8371 15.216 12.714 15.339C12.591 15.4621 12.424 15.5312 12.25 15.5312H8.75C8.57595 15.5312 8.40903 15.4621 8.28596 15.339C8.16289 15.216 8.09375 15.049 8.09375 14.875Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>

                  {/* Filter Popup */}
                  <ViewFilterPopup
                    isOpen={showFilterPopup}
                    onClose={() => setShowFilterPopup(false)}
                    currentView={currentView}
                    onViewChange={handleViewChange}
                    anchorEl={filterButtonRef.current}
                  />
                </div>
              </div>
            </div>

            {/* FullCalendar - FIXED: Added proper height constraints */}
            <div className="flex-1 min-h-0">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                headerToolbar={false}
                selectable
                select={handleDateSelect}
                eventClick={handleEventClick}
                events={fetchEventsForRange}
                eventDisplay="block"
                height="100%" // Changed back to 100% for proper filling
                contentHeight="auto"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }}

                firstDay={1}

                views={{
                  dayGridMonth: {
                    // Leading zeros only in month view
                    dayCellContent: (args) => {
                      const day = args.date.getDate();
                      const formattedDay = day < 10 ? `0${day}` : day;
                      return { html: formattedDay };
                    }
                  },
                  timeGridWeek: {
                    dayHeaderFormat: {
                      weekday: 'short',
                      omitCommas: true
                    },
                    // date below day header in week view
                    dayHeaderContent: (args) => {
                      const date = args.date;
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNumber = date.getDate();
                      const month = date.toLocaleDateString('en-US', { month: 'short' });

                      return {
                        html: `
                          <div class="fc-day-header-content">
                            <div class="fc-day-name">${dayName}</div>
                            <div class="fc-day-date"> ${dayNumber}</div>
                          </div>
                        `
                      };
                    }
                  },
                  timeGridDay: {
                    dayHeaderFormat: {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }
                  }
                }}

                className="calendar-green-headers"
                eventContent={(eventInfo) => {
                  return {
                    html: `<div class="fc-event-title">${eventInfo.event.title}</div>`,
                  };
                }}

                // View configuration
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                slotDuration="01:00:00"
                slotLabelInterval="01:00"
                dayMaxEvents={3}
                weekNumbers={false}
                nowIndicator={true}

                // Handle view changes
                viewDidMount={(viewInfo) => {
                  setCurrentView(viewInfo.view.type);
                }}
              />
            </div>
          </div>
        </div>

        {/* Upcoming Events - Takes 1/3 on large screens - Removed extra space on mobile */}
        <div className="xl:col-span-1">
          <div className="h-full flex flex-col">
            <UpcomingEvents
              selectedChild={selectedChild}
              onEventClick={handleEventClickFromUpcoming}
              onAddEvent={() => setModalOpen(true)}
              refreshTrigger={refreshUpcomingEvents}
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
          </div>
        </div>

        {loadingRestock ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#238D88] mx-auto mb-4"></div>
            <p className="text-sm">Loading restock items...</p>
          </div>
        ) : restockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#F3BE08]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              className="mb-4"
            >
              <path d="M16 67V89.5C16 89.7761 16.2239 90 16.5 90H82.5C82.7761 90 83 89.7761 83 89.5V67" stroke="#232527" strokeWidth="6.5" strokeLinecap="square" />
              <path d="M39 90V67" stroke="#232527" strokeWidth="6.5" strokeLinecap="square" />
              <path d="M95.3962 38.8789L83.6662 12.5777C83.1902 11.5037 82.4563 10.5999 81.5472 9.96786C80.6381 9.33582 79.5897 9.00064 78.52 9H21.48C20.4103 9.00064 19.3619 9.33582 18.4528 9.96786C17.5437 10.5999 16.8098 11.5037 16.3338 12.5777L4.60379 38.8789C4.2033 39.7798 3.99653 40.7733 4.00004 41.7798V51.7072C3.99742 53.2134 4.46533 54.6731 5.32254 55.8329C6.58944 57.461 8.15413 58.7643 9.91027 59.6542C11.6664 60.5441 13.5729 60.9997 15.5 60.99C18.6446 60.9955 21.6933 59.7764 24.125 57.5412C26.5567 59.7777 29.6047 61 32.75 61C35.8953 61 38.9433 59.7777 41.375 57.5412C43.8067 59.7777 46.8547 61 50 61C53.1453 61 56.1933 59.7777 58.625 57.5412C61.0567 59.7777 64.1047 61 67.25 61C70.3953 61 73.4433 59.7777 75.875 57.5412C78.5894 60.0399 82.0623 61.2614 85.5634 60.9488C89.0645 60.6362 92.3212 58.814 94.6487 55.8651C95.5163 54.7098 95.9945 53.2497 96 51.7395V41.7798C96.0035 40.7733 95.7967 39.7798 95.3962 38.8789ZM84.5 54.5436C83.272 54.5404 82.0625 54.2081 80.9723 53.5746C79.882 52.941 78.9427 52.0245 78.2325 50.9014L75.875 47.2915L73.5462 50.9014C72.8225 52.0073 71.8767 52.9066 70.7853 53.5264C69.694 54.1462 68.4878 54.4692 67.2644 54.4692C66.0409 54.4692 64.8347 54.1462 63.7434 53.5264C62.652 52.9066 61.7062 52.0073 60.9825 50.9014L58.625 47.2915L56.2962 50.9014C55.5725 52.0073 54.6267 52.9066 53.5354 53.5264C52.444 54.1462 51.2378 54.4692 50.0144 54.4692C48.791 54.4692 47.5847 54.1462 46.4934 53.5264C45.402 52.9066 44.4562 52.0073 43.7325 50.9014L41.375 47.2915L39.0463 50.9014C38.3226 52.0073 37.3767 52.9066 36.2854 53.5264C35.194 54.1462 33.9878 54.4692 32.7644 54.4692C31.541 54.4692 30.3348 54.1462 29.2434 53.5264C28.152 52.9066 27.2062 52.0073 26.4825 50.9014L24.125 47.2915L21.7675 50.9014C21.0573 52.0245 20.118 52.941 19.0277 53.5746C17.9375 54.2081 16.728 54.5404 15.5 54.5436C14.4165 54.5584 13.3428 54.3129 12.351 53.8237C11.3592 53.3344 10.4723 52.6128 9.75004 51.7072V41.7798L21.48 15.4464H78.52L90.25 41.7476V51.6105C89.532 52.5288 88.648 53.2652 87.6566 53.7709C86.6652 54.2767 85.5891 54.54 84.5 54.5436Z" fill="#232527" />
            </svg>
            <h2 className="text-[25px] font-semibold mb-3">
              No items to restock yet!
            </h2>
            <div className="rounded-lg p-6 max-w-md">
              <p className="text-gray-700 text-l text-center">
                Add an expense or receipt to view restock items.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
              {restockItems.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 bg-white transition-all h-[119px] ${item.reminderEnabled}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
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
        onSave={setCustomRestockDays}
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
    </div >
  );
}