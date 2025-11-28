// frontend/src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bell_icon from "../icons/bell_icon.png";
import CircleUserRoundIcon from "../icons/CircleUserRoundIcon";
import NotificationPopup from "./NotificationPopup";
import { logout } from "../utils/auth";

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
  const isChildDashboardPage = location.pathname.startsWith("/child-dashboard");
  const shouldUseWhiteBg =
    whiteBgPages.includes(location.pathname) || isChildDashboardPage;
  const isAccountPage = location.pathname === "/account";
  const shouldUseAccountPadding = isAccountPage || isChildDashboardPage;

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
        className={`w-full flex items-center justify-between md:justify-end px-6 py-4 md:px-[59px] md:py-[29px] ${
          shouldUseWhiteBg
            ? `bg-[#FFFFFF] ${
                isAccountPage ? "md:bg-[#EFEFEF]" : "md:bg-[#efefef]"
              }`
            : "bg-[#efefef]"
        }`}
        style={{
          height: "auto",
          minHeight: "70px",
        }}
      >
        <div className="w-full flex items-center justify-between md:justify-end">
          {/* Mobile hamburger */}
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
              {hasUnreadNotifications ? (
                <>
                  {/* Bell with notification circle cutout */}
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 21 23"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.58995 20.8379C8.77321 21.1553 9.03679 21.4188 9.35419 21.6021C9.67158 21.7853 10.0316 21.8818 10.3981 21.8818C10.7646 21.8818 11.1246 21.7853 11.442 21.6021C11.7594 21.4188 12.023 21.1553 12.2063 20.8379M12.3984 1.33016C11.4562 1.01266 10.4519 0.924007 9.46865 1.07154C8.48539 1.21908 7.55137 1.59856 6.74384 2.1786C5.9363 2.75865 5.27845 3.5226 4.82467 4.40727C4.37089 5.29195 4.13423 6.27194 4.13426 7.26621C4.13426 11.9631 2.66121 13.4841 1.27376 14.9154C1.1376 15.0651 1.04785 15.2511 1.01544 15.4508C0.983025 15.6505 1.00934 15.8553 1.09118 16.0403C1.17302 16.2254 1.30687 16.3826 1.47643 16.493C1.646 16.6033 1.84398 16.6621 2.0463 16.662H18.7499C18.9523 16.6621 19.1502 16.6033 19.3198 16.493C19.4894 16.3826 19.6232 16.2254 19.7051 16.0403C19.7869 15.8553 19.8132 15.6505 19.7808 15.4508C19.7484 15.2511 19.6586 15.0651 19.5225 14.9154C19.3076 14.6942 19.1038 14.4625 18.9117 14.2212"
                      stroke="#232527"
                      strokeWidth="2.00443"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="absolute top-2 right-1.5 w-3 h-3 bg-[#FFB882] border-2 border-black rounded-full animate-pulse"></span>
                </>
              ) : (
                <img src={bell_icon} alt="Notifications" className="w-7 h-7" />
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
                      navigate("/settings", {
                        state: { fromPath: location.pathname },
                      });
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
    </>
  );
}
