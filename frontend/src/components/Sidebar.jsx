import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  DashboardIcon,
  BudgetIcon,
  CalendarIcon,
  ArticlesIcon,
  FamilyIcon,
  LogoBloomUpGreen,
} from "../icons";
import { useChild } from "../contexts/ChildContext";

/**
 * Reusable Sidebar component aligned to Figma specs (compact scale)
 * - Rail width: 300px (was 376px)
 * - Nav item width: 270px, padding: 20px 16px, gap ~14px
 * - Item text: 16px, semi-bold
 * - Icons: outline, ~24-26px, stroke currentColor
 * - Bottom sign out: padding 20px 24px, Inter 16, #636363
 */
export default function Sidebar({
  isOpen = false,
  onClose = () => {},
  items = [],
  headerTitle,
  onLogout,
  logoutLabel = "Sign out",
}) {
  const [displayName, setDisplayName] = useState(headerTitle || "BloomUp");
  const { children, selectedChild, selectChild } = useChild();

  // Debug logging
  console.log("Sidebar - children:", children);
  console.log("Sidebar - selectedChild:", selectedChild);

  useEffect(() => {
    setDisplayName((prev) => headerTitle || prev);
  }, [headerTitle]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) return;
        const me = await res.json();
        const name =
          me?.familyName && me.familyName.trim()
            ? me.familyName
            : me?.name || "BloomUp";
        setDisplayName(name);
      } catch {}
    })();
  }, []);

  const navItems = items.length
    ? items
    : [
        {
          label: navLabelWithIcon("Dashboard", <DashboardIcon size={24} />),
          to: "/dashboard",
          end: true,
        },
        {
          label: navLabelWithIcon(
            "Budget Management",
            <BudgetIcon size={26} />
          ),
          to: "/dashboard/budget",
        },
        {
          label: navLabelWithIcon("Calendar", <CalendarIcon size={24} />),
          to: "/calendar",
        },
        {
          label: navLabelWithIcon(
            "Articles & Resources",
            <ArticlesIcon size={26} />
          ),
          to: "/articles",
        },
        {
          label: navLabelWithIcon("Your Family", <FamilyIcon size={26} />),
          to: "/account",
        },
      ];

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed md:relative z-50 left-0 top-0 h-full md:h-screen w-[300px] md:w-[300px] bg-white text-[#232527] transition-transform duration-300 md:transition-none shadow-md md:shadow-none flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand + chips */}
        <div className="pt-5">
          {/* Logo row */}
          <div className="px-6 select-none">
            <LogoBloomUpGreen width={110} height={54} />
          </div>

          {/* Chips row: compact */}
          <div className="px-6 mt-5 flex items-center gap-2.5">
            {renderChips(children, selectedChild, selectChild)}
            <svg
              className="ml-1 text-[#232527]"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {/* Side_Nav: centered items - scrollable */}
        <nav className="px-4 mt-6 flex-1 overflow-y-auto">
          <ul className="flex flex-col items-center gap-2">
            {navItems.map((item) => (
              <li
                key={typeof item.label === "string" ? item.label : item.to}
                className="w-[270px]"
              >
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-[14px] px-4 py-5 rounded-[12px] text-[16px] font-semibold ${
                      isActive
                        ? "bg-[#238D88] text-white"
                        : "bg-white text-[#232527] hover:bg-[#F5F5F5]"
                    }`
                  }
                  onClick={onClose}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Sign out - sticky to bottom */}
        <div className="flex-shrink-0 px-6 py-5 border-t border-gray-200">
          <Link
            to="/login"
            className="w-full flex items-center gap-3 justify-start rounded-[12px] px-0 text-[#636363]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span className="text-[16px] font-medium">{logoutLabel}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

function navLabelWithIcon(text, icon) {
  return (
    <>
      <span className="inline-flex items-center justify-center w-[24px] h-[24px] text-current">
        {icon}
      </span>
      <span>{text}</span>
    </>
  );
}

function renderChips(children, selectedChild, selectChild) {
  const palette = ["#006F69", "#6CC31F", "#F3BE08"]; // from figma fills

  // Generate initials with smart duplicate handling
  const getInitials = (children) => {
    const initialsMap = {};

    // Count occurrences of each initial
    children.slice(0, 3).forEach((child) => {
      const initial = child?.name ? child.name.trim()[0]?.toUpperCase() : "?";
      if (!initialsMap[initial]) {
        initialsMap[initial] = [];
      }
      initialsMap[initial].push(child._id);
    });

    // Generate display text with numbers for duplicates
    const displayMap = {};
    children.slice(0, 3).forEach((child) => {
      const initial = child?.name ? child.name.trim()[0]?.toUpperCase() : "?";
      const duplicates = initialsMap[initial];

      if (duplicates.length > 1) {
        // Add number suffix for duplicates
        const position = duplicates.indexOf(child._id) + 1;
        displayMap[child._id] = `${initial}${position}`;
      } else {
        // Just use initial if no duplicates
        displayMap[child._id] = initial;
      }
    });

    return displayMap;
  };

  const initialsDisplay = getInitials(children);

  return (
    <div className="flex items-center gap-2.5">
      {children.slice(0, 3).map((child, idx) => {
        const isSelected = selectedChild?._id === child._id;
        const displayText = initialsDisplay[child._id] || "?";

        return (
          <button
            key={child._id}
            onClick={() => {
              console.log("Chip clicked - child:", child);
              selectChild(child);
            }}
            className={`w-10 h-10 rounded-full grid place-items-center text-white text-[11px] font-semibold transition-all hover:scale-105 ${
              isSelected
                ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                : ""
            }`}
            style={{
              backgroundColor: palette[idx % palette.length],
            }}
            title={child.name}
          >
            {displayText}
          </button>
        );
      })}
      {/* Chevron is rendered in parent */}
    </div>
  );
}
