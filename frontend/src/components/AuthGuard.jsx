import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
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
          localStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }

        // For other errors, still redirect but log the error
        console.error("Auth check failed with status:", response.status);
        localStorage.removeItem("accessToken");
        navigate("/login");
        return;
      }

      const userData = await response.json();
      setUser(userData);

      console.log("AuthGuard - User data:", userData);
      console.log("AuthGuard - Children:", userData.children);
      console.log("AuthGuard - Children length:", userData.children?.length);

      //Route based on user state: only require at least one child
      const hasChildren =
        Array.isArray(userData.children) && userData.children.length > 0;

      console.log("AuthGuard - Has children:", hasChildren);
      console.log("AuthGuard - Current path:", location.pathname);

      if (!hasChildren) {
        // No children - redirect to family-setup
        console.log("AuthGuard - Redirecting to family-setup (no children)");
        navigate("/family-setup");
      } else {
        // Has children - redirect to dashboard if not already on a protected route
        const currentPath = location.pathname;
        const protectedRoutes = [
          "/dashboard",
          "/user-dashboard",
          "/account",
          "/settings",
          "/calendar",
          "/articles",
          "/family",
        ];
        const isOnProtectedRoute = protectedRoutes.some((route) =>
          currentPath.startsWith(route)
        );

        console.log("AuthGuard - Is on protected route:", isOnProtectedRoute);

        // Special case: If on family-setup but has children, redirect to dashboard
        if (currentPath === "/family-setup") {
          console.log(
            "AuthGuard - On family-setup but has children, redirecting to dashboard"
          );
          navigate("/dashboard");
        } else if (!isOnProtectedRoute) {
          console.log("AuthGuard - Redirecting to dashboard (has children)");
          navigate("/dashboard");
        } else {
          console.log("AuthGuard - Already on protected route, staying here");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("accessToken");
      navigate("/login");
    } finally {
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
