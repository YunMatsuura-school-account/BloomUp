// import { useState, useEffect } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";

// export default App;
import { BrowserRouter as Router, Routes, Route , useNavigate} from "react-router-dom";
import Signup from "./pages/Signup";
import DashboardLayout from "./layout/DashboardLayout";
// import Budget from "./components/Budget";
import Login from "./pages/Login";
import FamilySetup from "./pages/FamilySetup";
import AddChild from "./pages/AddChild";
import AuthGuard from "./components/AuthGuard";


import Budget from "./components/Budget";
import BudgetSetup from "./components/BudgetSetup";
import AddManual from "./pages/AddExpense";      
import UploadReceipt from "./pages/UploadReceipt"; 
import ReviewReceipt from "./pages/ReviewReceipt";

import Account from "./pages/ChildProfileSummary/Account";
import ChildDashboard from "./pages/ChildProfileSummary/ChildDashboard";
import Settings from "./pages/ChildProfileSummary/Settings";
import UserDashboard from "./pages/ChildProfileSummary/UserDashboard";

function BudgetSetupWrapper() {
  const navigate = useNavigate();
  return <BudgetSetup onClose={() => navigate("/dashboard/budget")} />;
}
// import Calendar from "./components/Calendar";
// import Articles from "./components/Articles";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth pages */}
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Onboarding route (direct) */}
        <Route
          path="/family-setup"
          element={
            <AuthGuard>
              <FamilySetup />
            </AuthGuard>
          }
        />
        <Route
          path="/add-child"
          element={
            <AuthGuard>
              <AddChild />
            </AuthGuard>
          }
        />

        {/* App layout with independent top-level routes */}
        <Route
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route
            path="/dashboard"
            element={<h2>Welcome to your Dashboard 👋</h2>}
          />
     <Route path="/dashboard/budget" element={<Budget />} />
         <Route path="/dashboard/budget-setup" element={<BudgetSetupWrapper />} />

          <Route path="/dashboard/budget/add-manual" element={<AddManual />} />
          <Route path="/dashboard/budget/upload-receipt" element={<UploadReceipt />} />
            <Route path="/dashboard/budget/review-receipt" element={<ReviewReceipt />} />

          <Route
            path="/calendar"
            element={<div style={{ color: "white" }}>Calendar coming soon</div>}
          />
          <Route
            path="/articles"
            element={
              <div style={{ color: "white" }}>
                Articles & Resources coming soon
              </div>
            }
          />
          <Route path="/family" element={<FamilySetup />} />

          {/* Child Profile Summary */}
          <Route path="/account" element={<Account />} />
          <Route path="/child-dashboard/:childId" element={<ChildDashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
