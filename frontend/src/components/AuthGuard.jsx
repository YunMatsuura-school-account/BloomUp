import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

      // Route based on user state
      if (!userData.familyName) {
        navigate("/family-setup");
      } else if (userData.children.length === 0) {
        navigate("/family-setup");
      } else {
        navigate("/dashboard");
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
