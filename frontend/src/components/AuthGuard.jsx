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

      // Log user + children for debugging
      console.log("AuthGuard - User data:", userData);
      console.log("AuthGuard - Children:", userData.children);

      // Route based on user state: require at least one child to proceed
      const hasChildren = Array.isArray(userData.children) && userData.children.length > 0;
      const currentPath = location.pathname;

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
        ];

        const isOnProtectedRoute = protectedRoutes.some((route) => currentPath.startsWith(route));

        // Special-case: if the user is on /family-setup but has children, redirect to dashboard
        if (currentPath === "/family-setup") {
          navigate("/dashboard");
        } else if (!isOnProtectedRoute) {
          navigate("/dashboard");
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
