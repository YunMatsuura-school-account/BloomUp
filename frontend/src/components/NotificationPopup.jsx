// frontend/src/components/NotificationPopup.jsx
// COMPLETE FINAL VERSION - Past events at bottom + Better error messages + Mark as viewed on click
import React, { useState, useEffect, useRef } from 'react';
import ReminderModal from './ReminderModal';
import CustomReminderModal from './CustomReminderModal';
import ChildAvatar from './ChildAvatar';

// Helper functions for localStorage
const VIEWED_ITEMS_KEY = 'bloom_viewed_notifications';

const loadViewedItems = () => {
  try {
    const saved = localStorage.getItem(VIEWED_ITEMS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return new Set(parsed);
    }
  } catch (err) {
    console.error('Error loading viewed items:', err);
  }
  return new Set();
};

const saveViewedItems = (viewedSet) => {
  try {
    const array = Array.from(viewedSet);
    localStorage.setItem(VIEWED_ITEMS_KEY, JSON.stringify(array));
  } catch (err) {
    console.error('Error saving viewed items:', err);
  }
};




const NotificationPopup = ({ isOpen, onClose, anchorEl, refreshTrigger, onNotificationsViewed }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllReminders, setShowAllReminders] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDaysPreview, setCustomDaysPreview] = useState('');
  const [viewedItems, setViewedItems] = useState(() => loadViewedItems());
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const popupRef = useRef(null);

  const [childrenList, setChildrenList] = useState([]);

  // Add this useEffect to load children
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.children && userData.children.length > 0) {
            const detailedChildren = await Promise.all(
              userData.children.map(async (childId) => {
                try {
                  const childRes = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/users/${userData.id}/children/${childId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  if (childRes.ok) {
                    const childData = await childRes.json();
                    return childData.child || childData;
                  }
                  return null;
                } catch (error) {
                  console.error(`Error fetching child ${childId}:`, error);
                  return null;
                }
              })
            );
            const validChildren = detailedChildren.filter(child => child !== null);
            setChildrenList(validChildren);
          }
        }
      } catch (error) {
        console.error("Error loading children:", error);
      }
    };

    if (isOpen) {
      loadChildren();
    }
  }, [isOpen]);




  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.reminder-modal') || event.target.closest('.custom-reminder-modal')) {
        return;
      }

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

  // Initial data fetch on component mount
  useEffect(() => {
    if (!hasInitialLoad) {
      console.log(' Initial data fetch on mount...');
      fetchUpcomingEvents();
      fetchReminders();
      setHasInitialLoad(true);
    }
  }, [hasInitialLoad]);

  // Fetch when popup opens
  useEffect(() => {
    if (isOpen) {
      console.log(' Popup opened, refreshing data...');
      fetchUpcomingEvents();
      fetchReminders();
    }
  }, [isOpen, refreshTrigger]);

  // Check and notify parent whenever data changes
  useEffect(() => {
    const hasGreenItems = checkHasUnreadItems();
    console.log('Has green items:', hasGreenItems);

    if (onNotificationsViewed) {
      onNotificationsViewed(hasGreenItems);
    }
  }, [viewedItems, upcomingEvents, reminders]);

  useEffect(() => {
    saveViewedItems(viewedItems);
  }, [viewedItems]);

  const checkHasUnreadItems = () => {
    const hasUnreadEvents = upcomingEvents.some(event =>
      !viewedItems.has(`event-${event._id}`)
    );

    const hasUnreadReminders = reminders.some(reminder =>
      !viewedItems.has(`reminder-${reminder._id}`)
    );

    return hasUnreadEvents || hasUnreadReminders;
  };

  const isNewItem = (type, id) => {
    return !viewedItems.has(`${type}-${id}`);
  };

  const markItemAsViewed = (type, id) => {
    console.log(`Marking ${type}-${id} as viewed`);
    const newViewedItems = new Set(viewedItems);
    newViewedItems.add(`${type}-${id}`);
    setViewedItems(newViewedItems);
  };

  // Check if event has passed
  const isEventPassed = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const now = new Date().toISOString();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const endDate = thirtyDaysLater.toISOString();

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/calendar?start=${encodeURIComponent(now)}&end=${encodeURIComponent(endDate)}`;

      console.log('Fetching upcoming events...');

      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        const currentTime = new Date();

        // Sort events: future events first (with alert first), then past events
        const sortedEvents = (data.events || []).sort((a, b) => {
          const aDate = new Date(a.startDate);
          const bDate = new Date(b.startDate);
          const aIsPast = aDate < currentTime;
          const bIsPast = bDate < currentTime;

          // Past events go to bottom
          if (aIsPast && !bIsPast) return 1;
          if (!aIsPast && bIsPast) return -1;

          // For future events, prioritize those with alerts
          if (!aIsPast && !bIsPast) {
            const aHasAlert = a.alert && a.alert !== 'At time of event';
            const bHasAlert = b.alert && b.alert !== 'At time of event';

            if (aHasAlert && !bHasAlert) return -1;
            if (!aHasAlert && bHasAlert) return 1;
          }

          // Sort by date (ascending for future, descending for past)
          if (aIsPast && bIsPast) {
            return bDate - aDate; // Most recent past event first
          }
          return aDate - bDate; // Nearest future event first
        });

        setUpcomingEvents(sortedEvents);
        console.log(' Loaded', sortedEvents.length, 'events');
      } else {
        console.error('Failed to fetch events:', resp.status);
      }
    } catch (err) {
      console.error('Error loading upcoming events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      console.log('Fetching ALL reminders...');

      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reminders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        const allReminders = data.reminders || [];

        console.log('Received reminders from API:', allReminders.length);

        if (allReminders.length > 0) {
          console.log(' First reminder sample:', {
            eventTitle: allReminders[0].eventTitle,
            eventDate: allReminders[0].eventDate,
            alert: allReminders[0].alert
          });
        }

        const remindersWithTrigger = allReminders.map(reminder => ({
          ...reminder,
          triggerTime: calculateReminderTime(reminder),
          eventDateTime: new Date(reminder.eventDate).getTime()
        }));

        const now = new Date().getTime();
        console.log('Current timestamp:', now, '(' + new Date(now).toISOString() + ')');

        //  IMPORTANT: Show ALL reminders including past ones for debugging
        const validReminders = remindersWithTrigger.filter(reminder => {
          const isFuture = reminder.eventDateTime >= now;
          const daysDiff = Math.floor((reminder.eventDateTime - now) / (1000 * 60 * 60 * 24));


          // For debugging, let's include reminders from the past 7 days too
          const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
          const isRecent = reminder.eventDateTime >= sevenDaysAgo;

          if (!isFuture && isRecent) {

            return true;
          }

          return isFuture;
        });

        console.log(`\n Valid reminders after filtering: ${validReminders.length}`);

        const sortedReminders = validReminders.sort((a, b) => {
          const timeUntilA = Math.abs(a.eventDateTime - now);
          const timeUntilB = Math.abs(b.eventDateTime - now);
          return timeUntilA - timeUntilB;
        });

        console.log(' Setting reminders state with', sortedReminders.length, 'items');

        if (sortedReminders.length > 0) {

          sortedReminders.forEach((r, idx) => {
            console.log(`   ${idx + 1}. ${r.eventTitle} - ${new Date(r.eventDate).toISOString()}`);
          });
        }

        setReminders(sortedReminders);
        console.log(' Loaded', sortedReminders.length, 'reminders');
      } else {
        console.error('Failed to fetch reminders:', resp.status);
      }
    } catch (err) {
      console.error(' Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  };
  const calculateReminderTime = (reminder) => {
    const eventDate = new Date(reminder.eventDate);

    if (reminder.customAlert && reminder.customDays !== null) {
      const daysInMs = reminder.customDays * 24 * 60 * 60 * 1000;
      return eventDate.getTime() - daysInMs;
    }

    const alertMap = {
      'None': 0,
      '1 day before': 1,
      '2 Weeks before': 14,
      '3 Weeks before': 21
    };

    const days = alertMap[reminder.alert] || 0;
    const daysInMs = days * 24 * 60 * 60 * 1000;
    return eventDate.getTime() - daysInMs;
  };

  const formatRelativeTime = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffMs = eventDate - now;
    const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      // Past events
      if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }
    } else {
      // Future events
      if (diffMinutes < 1) {
        return 'starting now';
      } else if (diffMinutes < 60) {
        return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
      } else if (diffHours < 24) {
        return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      } else {
        return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      }
    }
  };

  const formatEventDateTime = (startDate, endDate) => {
    const start = new Date(startDate);

    const formatDateTime = (date) => {
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = String(date.getDate()).padStart(2, '0');
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${month} ${day} ${hours}:${minutes}`;
    };

    if (endDate) {
      const end = new Date(endDate);
      return `${formatDateTime(start)} ~ ${formatDateTime(end)}`;
    }

    return formatDateTime(start);
  };

  const formatAlertDisplay = (reminder) => {
    if (reminder.customAlert && reminder.customDays !== null) {
      const days = reminder.customDays;

      if (days < 0.001) {
        const seconds = Math.round(days * 24 * 60 * 60);
        return `${seconds} second${seconds > 1 ? 's' : ''} before`;
      }

      if (Math.abs(days - 0.0035) < 0.0001) return '5 minutes before';
      if (Math.abs(days - 0.0104) < 0.0001) return '15 minutes before';
      if (Math.abs(days - 0.0417) < 0.001) return '1 hour before';

      if (days < 1) {
        const totalMinutes = Math.round(days * 24 * 60);
        if (totalMinutes < 60) {
          return `${totalMinutes} minute${totalMinutes > 1 ? 's' : ''} before`;
        }
        const hours = Math.round(days * 24);
        return `${hours} hour${hours > 1 ? 's' : ''} before`;
      }

      const displayDays = Math.round(days);
      return `${displayDays} day${displayDays > 1 ? 's' : ''} before`;
    }

    return reminder.alert;
  };

  // UPDATED: Click handlers mark as viewed AND open reminder modal
  const handleEventClick = (event) => {
    console.log(' Event clicked:', event.title, 'ID:', event._id);
    markItemAsViewed('event', event._id);

    // Check if event has passed
    if (isEventPassed(event.startDate)) {
      alert('This event has already passed. You cannot set a reminder for past events.');
      return;
    }

    setSelectedEvent(event);
    setCustomDaysPreview('');

    const existingReminder = reminders.find(r => r.eventId === event._id);

    if (existingReminder) {
      if (existingReminder.customAlert) {
        setCustomDaysPreview(existingReminder.customDays.toString());
      }
    }

    setShowReminderModal(true);
  };

  const handleReminderClick = (reminder) => {
    console.log(' Reminder clicked:', reminder.eventTitle, 'ID:', reminder._id);
    markItemAsViewed('reminder', reminder._id);

    const event = upcomingEvents.find(e => e._id === reminder.eventId);
    if (event) {
      handleEventClick(event);
    }
  };

  const handleReminderSelect = async (alertType) => {
    console.log(' Reminder alert selected:', alertType);

    if (alertType === 'Custom') {
      setShowReminderModal(false);
      setShowCustomModal(true);
    } else {
      const success = await saveReminder(selectedEvent, alertType);
      if (success) {
        setShowReminderModal(false);
        setSelectedEvent(null);

        console.log(' Refreshing data after save...');
        await Promise.all([fetchReminders(), fetchUpcomingEvents()]);
      }
    }
  };

  const handleCustomReminderSave = async (customDays) => {
    const success = await saveReminder(selectedEvent, 'Custom', customDays);
    if (success) {
      setShowCustomModal(false);
      setShowReminderModal(false);
      setSelectedEvent(null);

      console.log(' Refreshing data after custom save...');
      await Promise.all([fetchReminders(), fetchUpcomingEvents()]);
    }
  };

  const handleReminderModalClose = () => {
    setShowReminderModal(false);
    setSelectedEvent(null);
  };

  const handleCustomModalClose = () => {
    setShowCustomModal(false);
    setCustomDaysPreview('');
  };

  const handleCustomDaysChange = (days) => {
    setCustomDaysPreview(days);
  };

  const saveReminder = async (event, alertType, customDays = null) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error(' No authentication token found');
        alert('Please log in to save reminders');
        return false;
      }

      if (!event || !event._id) {
        console.error(' Invalid event data:', event);
        alert('Unable to save reminder: Invalid event');
        return false;
      }

      // Check if event has passed
      if (isEventPassed(event.startDate)) {
        alert('This event has already passed. You cannot set a reminder for past events.');
        return false;
      }

      const reminderData = {
        eventId: event._id,
        eventTitle: event.title,
        eventDate: event.startDate,
        alert: alertType,
        customAlert: alertType === 'Custom',
        customDays: customDays
      };



      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reminders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData)
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error('Server error:', data);

        // Better error messages
        if (resp.status === 400) {
          alert('Unable to save reminder. Please check your settings and try again.');
        } else if (resp.status === 401) {
          alert('Your session has expired. Please log in again.');
        } else {
          alert('This event has already passed or the reminder could not be saved.');
        }
        return false;
      }

      console.log('Reminder saved successfully:', data);
      return true;

    } catch (err) {
      console.error(' Error saving reminder:', err);
      alert('Unable to save reminder. Please try again later.');
      return false;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reminders/mark-all-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (resp.ok) {
        console.log(' Marked all reminders as read');

        const newViewedItems = new Set(viewedItems);
        upcomingEvents.forEach(event => {
          newViewedItems.add(`event-${event._id}`);
        });
        reminders.forEach(reminder => {
          newViewedItems.add(`reminder-${reminder._id}`);
        });
        setViewedItems(newViewedItems);

        await fetchReminders();
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const displayedEvents = showAllEvents ? upcomingEvents : upcomingEvents.slice(0, 5);
  const displayedReminders = showAllReminders ? reminders : reminders.slice(0, 5);

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={popupRef}
        className="absolute top-16 right-6 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-4 px-6 text-base font-medium transition-colors ${activeTab === 'upcoming'
              ? 'text-black border-b-2 border-[#238D88]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 py-4 px-6 text-base font-medium transition-colors ${activeTab === 'reminders'
              ? 'text-black border-b-2 border-[#238D88]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Reminders
          </button>
        </div>

        {/* Mark all as read */}
        <div className="px-6 py-3 border-b border-gray-100 flex justify-end">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-[#238D88] hover:text-[#1a6b67] font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Mark all as read
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : activeTab === 'upcoming' ? (
            <div className="p-4">
              {displayedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No upcoming events
                </div>
              ) : (
                <div className="space-y-3">

                  {displayedEvents.map((event) => {
                    const isNew = isNewItem('event', event._id);
                    const isPast = isEventPassed(event.startDate);

                    // Get the first child from the event (if any)
                    const eventChildId = event.children && event.children.length > 0 ? event.children[0] : null;
                    const eventChild = childrenList.find(child => child._id === eventChildId);

                    return (
                      <div
                        key={event._id}
                        onClick={() => handleEventClick(event)}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isNew
                          ? 'bg-[#E8F5F4] hover:bg-[#D4EDEB]'
                          : 'hover:bg-gray-50'
                          } ${isPast ? 'opacity-60' : ''}`}
                      >
                        {/* UPDATED: Show child avatar if available, otherwise fallback to colored circle */}
                        {eventChild ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <ChildAvatar child={eventChild} width={40} height={40} />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: event.color || '#F3BE08' }}
                          >
                            <span className="text-white font-medium text-sm">
                              {(event.type || event.title || 'E').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-black text-sm mb-1">
                            {event.title}
                            {isPast && <span className="ml-2 text-xs text-gray-500">(Past)</span>}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {formatEventDateTime(event.startDate, event.endDate)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {upcomingEvents.length > 5 && (
                <button
                  onClick={() => setShowAllEvents(!showAllEvents)}
                  className="w-full mt-4 py-3 bg-[#238D88] text-white rounded-lg font-medium hover:bg-[#1a6b67] transition-colors"
                >
                  {showAllEvents ? 'Show Less' : 'Show all'}
                </button>
              )}
            </div>
          ) : (
            <div className="p-4">
              {reminders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <div className="font-medium">No reminders set</div>
                  <div className="text-xs mt-1">Click on an event to set a reminder</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedReminders.map((reminder) => {
                    const relatedEvent = upcomingEvents.find(e => e._id === reminder.eventId);
                    const eventColor = relatedEvent?.color || '#F3BE08';
                    const isNew = isNewItem('reminder', reminder._id);

                    return (
                      <div
                        key={reminder._id}
                        onClick={() => handleReminderClick(reminder)}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${isNew
                          ? 'bg-[#E8F5F4] hover:bg-[#D4EDEB]'
                          : 'hover:bg-gray-50'
                          }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: eventColor }}
                        >
                          <span className="text-white font-medium text-sm">
                            {(reminder.eventTitle || 'R').charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-black text-sm mb-1">
                            {reminder.eventTitle}
                          </h4>
                          <p className="text-xs text-gray-600 font-medium">
                            {formatRelativeTime(reminder.eventDate)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {reminders.length > 5 && (
                <button
                  onClick={() => setShowAllReminders(!showAllReminders)}
                  className="w-full mt-4 py-3 bg-[#238D88] text-white rounded-lg font-medium hover:bg-[#1a6b67] transition-colors"
                >
                  {showAllReminders ? 'Show Less' : 'Show all'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showReminderModal && (
        <ReminderModal
          isOpen={showReminderModal}
          onClose={handleReminderModalClose}
          onSelectAlert={handleReminderSelect}
          event={selectedEvent}
          customDaysPreview={customDaysPreview}
          existingReminder={reminders.find(r => r.eventId === selectedEvent?._id)}
        />
      )}

      {showCustomModal && (
        <CustomReminderModal
          isOpen={showCustomModal}
          onClose={handleCustomModalClose}
          onSave={handleCustomReminderSave}
          onDaysChange={handleCustomDaysChange}
        />
      )}
    </>
  );
};

export default NotificationPopup;