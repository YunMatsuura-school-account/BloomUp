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
  const [userId, setUserId] = useState(null);
  const [childInitials, setChildInitials] = useState([]);

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
        setUserId(me?.id);
        const name =
          me?.familyName && me.familyName.trim()
            ? me.familyName
            : me?.name || "BloomUp";
        setDisplayName(name);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!userId) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/children`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const children = await res.json();
        const initials = (Array.isArray(children) ? children : [])
          .slice(0, 3)
          .map((c) => (c?.name ? c.name.trim()[0]?.toUpperCase() : "?"));
        setChildInitials(initials);
      } catch {}
    })();
  }, [userId]);

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
        className={`fixed md:static z-50 left-0 top-0 h-full md:h-auto w-[300px] md:w-[300px] bg-white text-[#232527] transition-transform duration-300 md:transition-none shadow-md md:shadow-none ${
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
            {renderChips(childInitials)}
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

        {/* Side_Nav: centered items */}
        <nav className="px-4 mt-6">
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

        {/* Bottom Sign out */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-5">
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

function renderChips(initials) {
  const palette = ["#006F69", "#6CC31F", "#F3BE08"]; // from figma fills
  return (
    <div className="flex items-center gap-2.5">
      {Array.from({ length: 3 }).map((_, idx) => {
        const label = initials[idx] || "";
        return (
          <div
            key={idx}
            className="w-10 h-10 rounded-full grid place-items-center text-white text-[13px] font-semibold"
            style={{
              backgroundColor: label
                ? palette[idx % palette.length]
                : "#E5E7EB",
            }}
          >
            {label}
          </div>
        );
      })}
      {/* Chevron is rendered in parent */}
    </div>
  );
}
