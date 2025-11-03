import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DashboardLayout from "./layout/DashboardLayout";
import AuthGuard from "./components/AuthGuard";
import { logout } from "./utils/auth";

import Dashboard from "./components/Dashboard";
import Budget from "./components/Budget";
import BudgetSetup from "./components/BudgetSetup";
import AddManual from "./pages/AddExpense";
import UploadReceipt from "./pages/UploadReceipt";
import ReviewReceipt from "./pages/ReviewReceipt";

import CalendarPage from "./pages/Calendar";
import Articles from "./pages/Articles";
import ArticleCategory from "./pages/ArticleCategory";
import ArticleSingle from "./pages/ArticleSingle";
import "./styles/articles.css";

import FamilySetup from "./pages/FamilySetup";
import AddChild from "./pages/AddChild";

import Account from "./pages/ChildProfileSummary/Account";
import ChildDashboard from "./pages/ChildProfileSummary/ChildDashboard";
import Settings from "./pages/ChildProfileSummary/Settings";
import UserDashboard from "./pages/ChildProfileSummary/UserDashboard";

function BudgetSetupWrapper() {
  const navigate = useNavigate();
  return <BudgetSetup onClose={() => navigate("/dashboard/budget")} />;
}

function App() {
  // Global fetch interceptor to attach token and handle 401/403
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      try {
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("authToken");
        const headers = new Headers(init?.headers || {});
        if (token && !headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        const response = await originalFetch(input, {
          ...init,
          headers,
          credentials: init?.credentials || "include",
        });
        if (response.status === 401 || response.status === 403) {
          // Use logout utility for consistent cleanup
          if (!window.location.pathname.startsWith("/login")) {
            logout(null); // Pass null since we're doing hard redirect
          }
        }
        return response;
      } catch (err) {
        // On network errors, just rethrow
        throw err;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/budget" element={<Budget />} />
          <Route
            path="/dashboard/budget-setup"
            element={<BudgetSetupWrapper />}
          />
          <Route path="/dashboard/budget/add-manual" element={<AddManual />} />
          <Route
            path="/dashboard/budget/upload-receipt"
            element={<UploadReceipt />}
          />
          <Route
            path="/dashboard/budget/review-receipt"
            element={<ReviewReceipt />}
          />

          <Route path="/calendar" element={<CalendarPage />} />

          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/category" element={<ArticleCategory />} />
          <Route path="/articles/:id" element={<ArticleSingle />} />

          <Route path="/family" element={<FamilySetup />} />

          {/* Child Profile Summary */}
          <Route path="/account" element={<Account />} />
          <Route
            path="/child-dashboard/:childId"
            element={<ChildDashboard />}
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
