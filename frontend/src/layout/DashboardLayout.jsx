import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ChildProvider } from "../contexts/ChildContext";

function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isArticlesPage = location.pathname.startsWith("/articles");

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
        <div className="flex-shrink-0">
          <Sidebar isOpen={open} onClose={() => setOpen(false)} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-[#EFEFEF] overflow-hidden">
          {/* Dashboard Header (skip on Article pages, which render their own) */}
          {!isArticlesPage && <Header />}

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-0" style={{ minHeight: 0 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </ChildProvider>
  );
}

export default DashboardLayout;
