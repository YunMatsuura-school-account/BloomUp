// frontend/src/components/ArticleHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArticleSearchModal from "./ArticleSearchModal";
import NotificationPopup from "./NotificationPopup";
import bell_icon from "../icons/bell_icon.png";
import CircleUserRoundIcon from "../icons/CircleUserRoundIcon";
import { logout } from "../utils/auth";

/**
 * Header component matching Figma design
 * - Height: 95px
 * - Background: #F5F5F5
 * - Padding: 29px 59px
 * - Gap between icons: 25px
 * - Mobile: Hamburger (sidebar) + Shape icon (categories) + Bell + User
 */

const ArticleHeader = ({ categories, currentFilter, onFilterChange }) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const bellRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (showNotifications) {
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [showNotifications]);

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
    setShowMobileMenu(false);
    
    if (onFilterChange) {
      onFilterChange(category);
    }

    if (category === "Saved") {
      navigate("/articles", { state: { filter: "Saved" } });
    } else if (category === "All") {
      navigate("/articles", { state: { filter: "All" } });
    } else {
      navigate(`/articles/category/${category}`, { state: { category } });
    }
  };

  const goHome = () => {
    if (onFilterChange) {
      onFilterChange("All");
    }
    navigate("/articles", { state: { filter: "All" } });
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
  };

  const handleNotificationsViewed = (hasGreenItems) => {
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
    navigate("/settings", { state: { fromPath: location.pathname } });
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout(navigate);
  };

  const handleSidebarOpen = () => {
    // Use the same global function that other components use
    if (typeof window !== "undefined" && typeof window.__openSidebar === "function") {
      window.__openSidebar();
    }
  };

  const getCurrentCategoryDisplay = () => {
    if (currentFilter === "All" || !currentFilter) {
      return "Articles & Resources";
    }
    return currentFilter;
  };

  return (
    <>
      <header className="bg-[#F5F5F5] shadow-sm sticky top-0 z-40 border-b border-black">
        <div className="max-w-full mx-auto" style={{ padding: '29px 59px' }}>
          <div className="flex items-center justify-between" style={{ minHeight: '37px' }}>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8 flex-1 overflow-x-auto scrollbar-hide">
              <button
                onClick={goHome}
                className={`font-medium transition-colors whitespace-nowrap text-sm xl:text-base pb-1 border-b-2 ${
                  currentFilter === "All" || !currentFilter
                    ? "text-teal-600 font-semibold border-teal-600"
                    : "text-gray-900 hover:text-teal-600 border-transparent"
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
                      className={`transition-colors whitespace-nowrap text-sm xl:text-base pb-1 border-b-2 ${
                        currentFilter === category
                          ? "text-teal-600 font-semibold border-teal-600"
                          : "text-gray-700 hover:text-teal-600 border-transparent"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
              {categories && categories.includes("Saved") && (
                <button
                  onClick={() => handleCategoryClick("Saved")}
                  className={`transition-colors whitespace-nowrap text-sm xl:text-base pb-1 border-b-2 ${
                    currentFilter === "Saved"
                      ? "text-teal-600 font-semibold border-teal-600"
                      : "text-gray-700 hover:text-teal-600 border-transparent"
                  }`}
                >
                  Saved
                </button>
              )}
            </nav>

            {/* Mobile Header */}
            <div className="lg:hidden w-full">
              {/* Top Row: Icons */}
              <div className="flex items-center justify-between w-full">
                {/* Hamburger Menu */}
                <button
                  onClick={handleSidebarOpen}
                  className="p-1 hover:bg-gray-200/60 rounded-md transition-colors -ml-1"
                  aria-label="Open Menu"
                >
                  <svg className="w-6 h-6 text-[#232527]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Bell and User Icons */}
                <div className="flex items-center gap-3">
                  <button
                    ref={bellRef}
                    onClick={handleNotificationClick}
                    className="p-1 hover:bg-gray-200/50 rounded-full transition-colors relative"
                    aria-label="Notifications"
                  >
                    <img src={bell_icon} alt="Notifications" className="w-5 h-5" />
                    {hasUnreadNotifications && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 0 2px #F5F5F5' }}></span>
                    )}
                  </button>

                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={handleProfileClick}
                      className="p-1 hover:bg-gray-200/50 rounded-full transition-colors"
                      aria-label="Profile"
                    >
                      <CircleUserRoundIcon className="w-6 h-6" fill="#FFFFFF" />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                        <button onClick={handleParentProfile} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Parent Profile
                        </button>
                        <button onClick={handleSettings} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </button>
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Shape Icon + Category Title */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="flex items-center gap-2 hover:bg-gray-200/60 px-2 py-1 rounded-md transition-colors mt-2 -ml-2"
                aria-label="Open Categories"
              >
                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span className="font-medium text-sm text-black">{getCurrentCategoryDisplay()}</span>
              </button>
            </div>


            {/* Desktop Right Icons */}
            <div className="hidden lg:flex items-center ml-2" style={{ gap: '25px' }}>
              <button onClick={() => setSearchModalOpen(true)} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors" aria-label="Search">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button ref={bellRef} onClick={handleNotificationClick} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors relative" aria-label="Notifications">
                <img src={bell_icon} alt="Notifications" className="w-6 h-6" />
                {hasUnreadNotifications && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              <div className="relative" ref={profileRef}>
                <button onClick={handleProfileClick} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors" aria-label="Profile">
                  <CircleUserRoundIcon className="w-7 h-7" fill="#FFFFFF" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                    <button onClick={handleParentProfile} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Parent Profile
                    </button>
                    <button onClick={handleSettings} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Category Menu Popup */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMobileMenu(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md h-auto max-h-[90vh] relative shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-5 right-5 text-black hover:text-gray-600 transition-colors z-10" onClick={() => setShowMobileMenu(false)} aria-label="Close menu">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="px-8 pt-8 pb-5 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex-shrink-0" onClick={() => {
              setShowMobileMenu(false);
              goHome();
            }}>
              <h2 className="text-2xl font-bold text-black">Articles & Resources</h2>
            </div>

            <button onClick={() => { setShowMobileMenu(false); setSearchModalOpen(true); }} className="w-full px-8 py-5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-200 flex-shrink-0">
              <span className="font-semibold text-lg">Search</span>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="py-3 overflow-y-auto flex-1">
              {categories && categories.map((category) => (
                <button key={category} onClick={() => handleCategoryClick(category)} className={`w-full px-8 py-5 text-left hover:bg-gray-50 transition-colors text-lg ${currentFilter === category ? "bg-teal-50 text-teal-600 font-bold" : "text-gray-700 font-medium"}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ArticleSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
      <NotificationPopup isOpen={showNotifications} onClose={handleNotificationClose} anchorEl={bellRef.current} refreshTrigger={refreshTrigger} onNotificationsViewed={handleNotificationsViewed} />
    </>
  );
};

export default ArticleHeader;