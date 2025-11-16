import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bell_icon from "../icons/bell_icon.png";
import CircleUserRoundIcon from "../icons/CircleUserRoundIcon";
import UpcomingEvents from "./UpcomingEvents";

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
  const [showBellOverlay, setShowBellOverlay] = useState(false);

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

  return (
    <>
      <header
        className="w-full bg-[#F5F5F5] flex items-center justify-end"
        style={{
          height: "95px",
          padding: "29px 59px",
        }}
      >
        <div className="flex items-center gap-[25px]">
          {/* Bell Icon */}
          <button
            onClick={() => setShowBellOverlay(true)}
            className="p-2 rounded-full hover:bg-gray-200/50 transition-colors"
            aria-label="Notifications"
          >
            <img src={bell_icon} alt="Notifications" className="w-6 h-6" />
          </button>

          {/* User Icon - Circle User Round */}
          <button
            onClick={() => navigate("/user-dashboard")}
            className="p-0 rounded-full hover:bg-gray-200/50 transition-colors flex items-center justify-center"
            aria-label="User Profile"
          >
            <CircleUserRoundIcon className="w-7 h-7" fill="#FFFFFF" />
          </button>
        </div>
      </header>

      {/* Notification Overlay */}
      {showBellOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBellOverlay(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Upcoming Events</h3>
              <button
                onClick={() => setShowBellOverlay(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <UpcomingEvents selectedChild={null} />
          </div>
        </div>
      )}
    </>
  );
}
