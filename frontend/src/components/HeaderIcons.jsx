// frontend/src/components/HeaderIcons.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderIcons = ({ showSearch = false, onSearchClick }) => {
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    // Add your notification logic here
    // You can navigate to notifications page or open a dropdown
    console.log('Notification clicked');
    // navigate('/notifications');
  };

  const handleProfileClick = () => {
    // Navigate to profile page or open profile dropdown
    navigate('/profile');
  };

  return (
    <div className="flex items-center gap-4">
      {/* Search Icon - Optional */}
      {showSearch && (
        <button
          onClick={onSearchClick}
          className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
          aria-label="Search"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      )}

      {/* Notification Bell Icon */}
      <button
        onClick={handleNotificationClick}
        className="p-2 text-gray-600 hover:text-teal-600 transition-colors relative"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/* Optional: Add notification badge for unread notifications */}
        {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
      </button>

      {/* Profile Icon */}
      <button
        onClick={handleProfileClick}
        className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
        aria-label="Profile"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>
    </div>
  );
};

export default HeaderIcons;