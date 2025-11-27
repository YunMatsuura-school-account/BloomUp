//frontend/src/layout/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ChildProvider } from "../contexts/ChildContext";

function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const isArticlesPage = path.startsWith("/articles");
  const isAddChildPage = path === "/add-child";
  const isSettingsPage = path === "/settings";
  const isChildDashboardPage = path.startsWith("/child-dashboard");

  // Expose global hook for Header hamburger (mobile)
  // so Header can open the Sidebar from pages rendered inside the layout
  useEffect(() => {
    window.__openSidebar = () => setOpen(true);
    return () => {
      if (window.__openSidebar) delete window.__openSidebar;
    };
  }, []);

  return (
    <ChildProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (responsive) */}
        <div className="flex-shrink-0 w-0 md:w-auto">
          <Sidebar isOpen={open} onClose={() => setOpen(false)} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-[#EFEFEF] overflow-hidden">
          {/* Dashboard Header (skip on Article pages, Add Child, Settings, Child Dashboard) */}
          {!isArticlesPage &&
            !isAddChildPage &&
            !isSettingsPage &&
            !isChildDashboardPage && <Header />}

          {/* Scrollable content area */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-0"
            style={{ minHeight: 0 }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </ChildProvider>
  );
}

export default DashboardLayout;

