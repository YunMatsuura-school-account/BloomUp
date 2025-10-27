import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ChildProvider } from "../contexts/ChildContext";

function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <ChildProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (responsive) */}
        <div className="flex-shrink-0">
          <Sidebar isOpen={open} onClose={() => setOpen(false)} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-[#414049ff] overflow-hidden">
          {/* Top bar */}
          <div className="md:hidden flex items-center justify-between px-4 h-14 bg-[#2a2930] text-white flex-shrink-0">
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

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-5">
            <Outlet />
          </div>
        </div>
      </div>
    </ChildProvider>
  );
}

export default DashboardLayout;
