// frontend/components/AuthGuard.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../utils/auth";

const AuthGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const checkInProgress = useRef(false);

  // Check auth on mount and on every route change
  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  // Prevent back navigation to protected routes after logout
  useEffect(() => {
    const handlePopState = (event) => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // If no token, prevent accessing protected routes via back button
        const protectedRoutes = [
          "/dashboard",
          "/user-dashboard",
          "/account",
          "/settings",
          "/calendar",
          "/articles",
          "/family",
          "/child-dashboard",
        ];

        const currentPath = window.location.pathname;
        const isProtectedRoute = protectedRoutes.some((route) =>
          currentPath.startsWith(route)
        );

        if (isProtectedRoute) {
          // Replace current history entry with login
          window.history.replaceState(null, "", "/login");
          navigate("/login", { replace: true });
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const checkAuth = async () => {
    // Prevent multiple simultaneous auth checks
    if (checkInProgress.current) {
      return;
    }

    checkInProgress.current = true;
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        // Use replace to prevent back navigation
        navigate("/login", { replace: true });
        checkInProgress.current = false;
        setLoading(false);
        return;
      }

      // Fetch user data from /api/auth/me
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 401 || response.status === 403) {
          console.log("Token expired or invalid, redirecting to login");
          // Use logout utility for proper cleanup
          logout(navigate);
          checkInProgress.current = false;
          setLoading(false);
          return;
        }

        // For other errors, still redirect but log the error
        console.error("Auth check failed with status:", response.status);
        logout(navigate);
        checkInProgress.current = false;
        setLoading(false);
        return;
      }

      const userData = await response.json();
      setUser(userData);

      // Log user + children for debugging
      console.log("AuthGuard - User data:", userData);
      console.log("AuthGuard - Children:", userData.children);

      // Route based on user state: require at least one child to proceed
      const hasChildren =
        Array.isArray(userData.children) && userData.children.length > 0;
      const currentPath = location.pathname;

      // Routes that are always allowed (for adding children during onboarding or later)
      const alwaysAllowedRoutes = ["/add-child", "/family-setup"];
      const isOnAlwaysAllowedRoute = alwaysAllowedRoutes.some((route) =>
        currentPath.startsWith(route)
      );

      // If user is on an always-allowed route, let them proceed
      if (isOnAlwaysAllowedRoute) {
        checkInProgress.current = false;
        setLoading(false);
        return;
      }

      if (!hasChildren) {
        console.log("AuthGuard - Redirecting to family-setup (no children)");
        navigate("/family-setup");
      } else {
        // If user already on a protected route, keep them there; otherwise go to dashboard
        const protectedRoutes = [
          "/dashboard",
          "/user-dashboard",
          "/account",
          "/settings",
          "/calendar",
          "/articles",
          "/family",
          "/add-child", // Allow add-child for users with children too
        ];

        const isOnProtectedRoute = protectedRoutes.some((route) =>
          currentPath.startsWith(route)
        );

        // Special-case: if the user is on /family-setup but has children, redirect to dashboard
        if (currentPath === "/family-setup") {
          navigate("/dashboard");
        } else if (!isOnProtectedRoute) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout(navigate);
    } finally {
      checkInProgress.current = false;
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return children;
};

export default AuthGuard;
