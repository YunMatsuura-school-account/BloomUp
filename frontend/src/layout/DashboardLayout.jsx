import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar (responsive) */}
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      {/* Main content area */}
      <div
        style={{ flex: 1, backgroundColor: "#414049ff", minHeight: "100vh" }}
      >
        {/* Top bar */}
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
          <div className="text-sm opacity-80">Menu</div>
          <div className="w-8" />
        </div>

        <div className="p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
