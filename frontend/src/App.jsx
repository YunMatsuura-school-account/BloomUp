import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import DashboardLayout from "./layout/DashboardLayout";
import Login from "./pages/Login";
import FamilySetup from "./pages/FamilySetup";
import AddChild from "./pages/AddChild";
import AuthGuard from "./components/AuthGuard";

import Budget from "./components/Budget";
import BudgetSetup from "./components/BudgetSetup";
import AddManual from "./pages/AddExpense";
import UploadReceipt from "./pages/UploadReceipt";

import Account from "./pages/ChildProfileSummary/Account";
import ChildDashboard from "./pages/ChildProfileSummary/ChildDashboard";
import Settings from "./pages/ChildProfileSummary/Settings";
import UserDashboard from "./pages/ChildProfileSummary/UserDashboard";

import CalendarPage from "./pages/Calendar";
import Dashboard from "./components/Dashboard";

import Articles from './pages/Articles';
import ArticleCategory from './pages/ArticleCategory';
import ArticleSingle from './pages/ArticleSingle';
import './styles/articles.css';

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/budget" element={<Budget />} />
          <Route path="/dashboard/budget-setup" element={<BudgetSetup />} />
          <Route path="/dashboard/budget/add-manual" element={<AddManual />} />
          <Route
            path="/dashboard/budget/upload-receipt"
            element={<UploadReceipt />}
          />

          {/* Calendar */}
          <Route path="/calendar" element={<CalendarPage />} />

          {/* Articles Routes - ORDER MATTERS! */}
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/category/:category" element={<ArticleCategory />} /> {/* FIXED: Added :category */}
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