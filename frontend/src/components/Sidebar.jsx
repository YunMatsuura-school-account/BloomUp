import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  DashboardIcon,
  BudgetIcon,
  CalendarIcon,
  ArticlesIcon,
  FamilyIcon,
  BloomUpLogo,
} from "../icons";
import { useChild } from "../contexts/ChildContext";
import { logout } from "../utils/auth";
import ChildAvatar from "./ChildAvatar";

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
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(headerTitle || "BloomUp");
  const { children, selectedChild, selectChild } = useChild();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    if (onLogout) {
      onLogout();
    }
    logout(navigate);
  };

  // Debug logging
  console.log("Sidebar - children:", children);
  console.log("Sidebar - selectedChild:", selectedChild);

  useEffect(() => {
    setDisplayName((prev) => headerTitle || prev);
  }, [headerTitle]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        !event.target.closest(".children-dropdown-container")
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [showDropdown]);

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
        className={`fixed md:relative z-50 left-0 top-0 h-full md:h-screen w-[300px] md:w-[300px] bg-white text-[#232527] transition-transform duration-300 md:transition-none shadow-md md:shadow-none flex flex-col no-scrollbar ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand + chips */}
        <div className="pt-5">
          {/* Logo row */}
          <div className="px-6 select-none">
            <img
              src={BloomUpLogo}
              alt="BloomUp logo"
              draggable={false}
              className="select-none"
              style={{ width: "161.96px", height: "31.75px" }}
            />
          </div>

          {/* Chips row: compact */}
          <div className="px-6 mt-5 flex items-center gap-2.5 relative children-dropdown-container">
            {renderChips(
              children,
              selectedChild,
              selectChild,
              showDropdown,
              setShowDropdown
            )}
            {children.length > 4 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="ml-1 text-[#232527] hover:text-[#238D88] transition-colors cursor-pointer"
                title={`Show all children (${children.length} total)`}
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
                  className={
                    showDropdown
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Side_Nav: centered items - scrollable */}
        <nav className="px-4 mt-6 flex-1 overflow-y-auto no-scrollbar">
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
        <div className="flex-shrink-0 px-6 py-5 border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 justify-start rounded-[12px] px-0 text-[#636363] hover:text-[#238D88] transition-colors"
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
          </button>
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

function renderChips(
  children,
  selectedChild,
  selectChild,
  showDropdown,
  setShowDropdown
) {
  const totalChildren = children.length;
  const visibleChildren = children.slice(0, 4);
  const hiddenChildren = children.slice(4);
  const isAllSelected = !selectedChild;

  return (
    <>
      <div className="flex items-center gap-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectChild(null);
            setShowDropdown(false);
          }}
          aria-pressed={isAllSelected}
          className={`w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-[15px] font-semibold transition-all hover:scale-105 ${
            isAllSelected ? "ring-2 ring-[#238D88]/50 ring-offset-2" : ""
          }`}
          style={{ backgroundColor: "#006F69" }}
          title="Show all children"
        >
          All
        </button>

        {visibleChildren.map((child) => {
          const isSelected = selectedChild?._id === child._id;

          return (
            <button
              key={child._id}
              onClick={(e) => {
                e.stopPropagation();
                console.log("Chip clicked - child:", child);
                selectChild(child);
                setShowDropdown(false);
              }}
              className={`rounded-full transition-all hover:scale-105 ${
                isSelected
                  ? "ring-2 ring-[#238D88]/50 ring-offset-2"
                  : ""
              } w-[55px] h-[55px]`}
              title={child.name}
            >
              <ChildAvatar child={child} width={55} height={55} />
            </button>
          );
        })}
      </div>

      {/* Dropdown menu for additional children */}
      {hiddenChildren.length > 0 && showDropdown && (
        <div className="absolute top-14 left-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
              All Children ({totalChildren})
            </div>
            {children.map((child) => {
              const isSelected = selectedChild?._id === child._id;

              return (
                <button
                  key={child._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Dropdown clicked - child:", child);
                    selectChild(child);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                    isSelected ? "bg-[#238D88] text-white" : ""
                  }`}
                >
                  <ChildAvatar child={child} width={32} height={32} />
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {child.name}
                  </span>
                  {isSelected && (
                    <svg
                      className="ml-auto w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
