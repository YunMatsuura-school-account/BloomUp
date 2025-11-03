import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ChildProvider } from "../contexts/ChildContext";

function DashboardLayout() {
  const [open, setOpen] = useState(false);

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
        <div className="flex-1 flex flex-col bg-[#414049] overflow-hidden">
          {/* Top bar moved into shared Header for consistency across pages (mobile) */}

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-0">
            <Outlet />
          </div>
        </div>
      </div>
    </ChildProvider>
  );
}

export default DashboardLayout;