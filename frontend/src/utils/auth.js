/**
 * Authentication utilities
 * Handles logout, token management, and prevents unauthorized access
 */

/**
 * Clears all authentication data and prevents back navigation
 * @param {Function} navigate - React Router navigate function
 */
export const logout = (navigate) => {
  // Clear all auth-related localStorage items
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");

  // Clear any other potential auth data
  localStorage.removeItem("user");
  localStorage.removeItem("userData");

  // Clear sessionStorage as well
  sessionStorage.clear();

  // If navigate function is provided, use React Router navigation
  if (navigate) {
    // Replace current history entry to prevent back navigation
    window.history.replaceState(null, "", "/login");
    navigate("/login", { replace: true });
  } else {
    // Use window.location.replace for hard redirect (doesn't add to history)
    // This prevents back button from going to previous page
    window.history.replaceState(null, "", "/login");
    window.location.replace("/login");
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  return !!token;
};

/**
 * Get the auth token
 * @returns {string|null} The access token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

/**
 * Validate token with backend
 * @returns {Promise<boolean>} True if token is valid
 */
export const validateToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      return false;
    }

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};
