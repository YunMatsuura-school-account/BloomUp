import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (responsive) */}
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        {/* Top bar for mobile */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-[#2a2930] text-white">
          <button
            aria-label="Open Menu"
            className="p-2 rounded-md hover:bg-white/10"
            onClick={() => setOpen(true)}
          >
            {/* Hamburger */}
            <span className="block w-6 h-0.5 bg-white mb-1"></span>
            <span className="block w-6 h-0.5 bg-white mb-1"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
          
          <div className="w-8" />
        </div>

        {/* Page content - no extra padding, let each page control its own layout */}
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;