import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content area */}
      <div style={{ flex: 1, backgroundColor: "#414049ff", padding: "20px" }}>
        <Outlet /> {/* Nested pages (Budget, Calendar, etc.) render here */}
      </div>
    </div>
  );
}

export default DashboardLayout;
