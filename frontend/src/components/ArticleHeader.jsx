// frontend/src/components/ArticleHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArticleSearchModal from "./articleSearchModal";
import NotificationPopup from "./NotificationPopup";
import bell_icon from "../icons/bell_icon.png";
import CircleUserRoundIcon from "../icons/CircleUserRoundIcon";
import { logout } from "../utils/auth";

const ArticleHeader = ({ categories, currentFilter, onFilterChange }) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const bellRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh when notification popup opens
  useEffect(() => {
    if (showNotifications) {
      console.log("🔔 Notification popup opened, triggering refresh...");
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [showNotifications]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = (category) => {
    // Update filter if handler exists
    if (onFilterChange) {
      onFilterChange(category);
    }

    // Navigate based on category
    if (category === "Saved") {
      navigate("/articles", { state: { filter: "Saved" } });
    } else {
      navigate(`/articles/category/${category}`, { state: { category } });
    }
  };

  const goHome = () => {
    // Go to /articles with "All" filter
    if (onFilterChange) {
      onFilterChange("All");
    }
    navigate("/articles", { state: { filter: "All" } });
  };

  const handleNotificationClick = () => {
    console.log("🔔 Notification bell clicked");
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClose = () => {
    console.log("🔔 Notification popup closed");
    setShowNotifications(false);
  };

  const handleNotificationsViewed = (hasGreenItems) => {
    console.log(
      "👀 Notification status update - has green items:",
      hasGreenItems
    );
    // Update red dot based on whether green items exist
    setHasUnreadNotifications(hasGreenItems);
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleParentProfile = () => {
    setShowProfileMenu(false);
    navigate("/user-dashboard");
  };

  const handleSettings = () => {
    setShowProfileMenu(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout(navigate);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={goHome}
                className={`font-medium transition-colors ${
                  currentFilter === "All" || !currentFilter
                    ? "text-teal-600 font-semibold"
                    : "text-gray-900 hover:text-teal-600"
                }`}
              >
                Articles & Resources
              </button>
              {categories &&
                categories
                  .filter((cat) => cat !== "Saved")
                  .map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`text-gray-700 hover:text-teal-600 transition-colors ${
                        currentFilter === category
                          ? "text-teal-600 font-semibold"
                          : ""
                      }`}
                    >
                      {category}
                    </button>
                  ))}
              {categories && categories.includes("Saved") && (
                <button
                  onClick={() => handleCategoryClick("Saved")}
                  className={`text-gray-700 hover:text-teal-600 transition-colors ${
                    currentFilter === "Saved"
                      ? "text-teal-600 font-semibold"
                      : ""
                  }`}
                >
                  Saved
                </button>
              )}
            </nav>

            {/* Right side icons */}
            <div className="flex items-center gap-4">
              {/* Search Icon */}
              <button
                onClick={() => setSearchModalOpen(true)}
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

              {/* Notification Bell Icon with Red Dot */}
              <button
                ref={bellRef}
                onClick={handleNotificationClick}
                className="p-2 text-gray-600 hover:text-teal-600 transition-colors relative"
                aria-label="Notifications"
              >
                <img src={bell_icon} alt="Notifications" className="w-6 h-6" />
                {/* Red Dot Indicator - Shows when there are ANY green items */}
                {hasUnreadNotifications && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Profile Icon with Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={handleProfileClick}
                  className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
                  aria-label="Profile"
                >
                  <CircleUserRoundIcon className="w-7 h-7" fill="#FFFFFF" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={handleParentProfile}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <svg
                        className="w-5 h-5"
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
                      Parent Profile
                    </button>
                    <button
                      onClick={handleSettings}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Modal */}
        <ArticleSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
        />
      </header>

      {/* Notification Popup */}
      <NotificationPopup
        isOpen={showNotifications}
        onClose={handleNotificationClose}
        anchorEl={bellRef.current}
        refreshTrigger={refreshTrigger}
        onNotificationsViewed={handleNotificationsViewed}
      />
    </>
  );
};

export default ArticleHeader;
