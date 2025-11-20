import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bell_icon from "../icons/bell_icon.png";
import CircleUserRoundIcon from "../icons/CircleUserRoundIcon";
import NotificationPopup from "./NotificationPopup";
// Legacy import kept for reference of previous implementation
// import UpcomingEvents from "./UpcomingEvents";
import { logout } from "../utils/auth";

/**
 * Header component matching Figma design
 * - Height: 95px
 * - Background: #F5F5F5
 * - Padding: 29px 59px
 * - Right-aligned with bell and user icons
 * - Gap between icons: 25px
 */
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showBellOverlay, setShowBellOverlay] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const bellRef = useRef(null);

  // Pages that should have white background on mobile
  const whiteBgPages = ["/account", "/user-dashboard", "/settings"];
  const shouldUseWhiteBg = whiteBgPages.includes(location.pathname);
  // Pages that should have #EFEFEF background on desktop
  const isAccountPage = location.pathname === "/account";

  // Close overlay on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowBellOverlay(false);
    };
    if (showBellOverlay) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [showBellOverlay]);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu]);

  useEffect(() => {
    if (showNotifications) {
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [showNotifications]);

  const handleNotificationClick = () => {
    setShowNotifications((v) => !v);
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
  };

  const handleNotificationsViewed = (hasGreenItems) => {
    setHasUnreadNotifications(hasGreenItems);
  };

  return (
    <>
      <header
        className={`w-full flex items-center justify-between md:justify-end ${
          shouldUseWhiteBg 
            ? `bg-[#FFFFFF] ${isAccountPage ? "md:bg-[#EFEFEF]" : "md:bg-[#efefef]"}`
            : "bg-[#efefef]"
        } ${isAccountPage ? "px-6 py-4 md:px-[59px] md:py-[29px]" : ""}`}
        style={{
          height: "95px",
          ...(isAccountPage ? {} : { padding: "29px 59px" }),
        }}
      >
        <div className={`w-full flex items-center justify-between md:justify-end ${isAccountPage ? "md:max-w-[1234px] md:mx-auto" : ""}`}>
          {/* Mobile hamburger (opens sidebar via global hook set in layout) */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-200/60"
            aria-label="Open Menu"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                typeof window.__openSidebar === "function"
              ) {
                window.__openSidebar();
              }
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="block w-6 h-0.5 bg-[#232527]"></span>
              <span className="block w-6 h-0.5 bg-[#232527]"></span>
              <span className="block w-6 h-0.5 bg-[#232527]"></span>
            </div>
          </button>

          <div className="flex items-center gap-[20px]">
            {/* Bell Icon */}
            <button
              ref={bellRef}
              onClick={handleNotificationClick}
              className="p-1.5 rounded-full hover:bg-gray-200/50 transition-colors relative"
              aria-label="Notifications"
            >
              <img src={bell_icon} alt="Notifications" className="w-7 h-7" />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* User Icon - Circle User Round */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="p-1.5 rounded-full hover:bg-gray-200/50 transition-colors flex items-center justify-center"
                aria-label="User Profile Menu"
              >
                <CircleUserRoundIcon className="w-7 h-7" fill="#FFFFFF" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/user-dashboard");
                    }}
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
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/settings");
                    }}
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
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout(navigate);
                    }}
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
      </header>

      <NotificationPopup
        isOpen={showNotifications}
        onClose={handleNotificationClose}
        anchorEl={bellRef.current}
        refreshTrigger={refreshTrigger}
        onNotificationsViewed={handleNotificationsViewed}
      />

      {/**
       * Legacy bell overlay (kept commented for reference – previously used UpcomingEvents modal)
       * This block was replaced by NotificationPopup to align with Articles header design.
       * If needed in future, restore by uncommenting and re-adding UpcomingEvents import.
       */}
      {false &&
        // <>
        //   {showBellOverlay && (
        //     <div
        //       className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        //       onClick={() => setShowBellOverlay(false)}
        //     >
        //       <div
        //         className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        //         onClick={(e) => e.stopPropagation()}
        //       >
        //         <div className="flex justify-between items-center mb-4">
        //           <h3 className="text-xl font-semibold">Upcoming Events</h3>
        //           <button
        //             onClick={() => setShowBellOverlay(false)}
        //             className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        //           >
        //             ×
        //           </button>
        //         </div>
        //         {/* <UpcomingEvents selectedChild={null} /> */}
        //       </div>
        //     </div>
        //   )}
        // </>
        null}
    </>
  );
}
