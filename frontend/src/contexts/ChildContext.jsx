import React, { createContext, useContext, useState, useEffect } from "react";

const ChildContext = createContext();

// Helper to get saved child ID from localStorage
const getSavedChildId = () => {
  try {
    return localStorage.getItem("selectedChildId");
  } catch {
    return null;
  }
};

// Helper to save child ID to localStorage
const saveChildId = (childId) => {
  try {
    if (childId) {
      localStorage.setItem("selectedChildId", childId);
    } else {
      localStorage.removeItem("selectedChildId");
    }
  } catch {
    // Ignore localStorage errors
  }
};

export const useChild = () => {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error("useChild must be used within a ChildProvider");
  }
  return context;
};

export const ChildProvider = ({ children: reactChildren }) => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // Get user info
        const userRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);

          // Get children
          const childrenRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/${
              userData.id
            }/children`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (childrenRes.ok) {
            const childrenData = await childrenRes.json();
            setChildren(childrenData);
            
            // Try to restore previously selected child from localStorage
            const savedChildId = getSavedChildId();
            if (savedChildId && childrenData.length > 0) {
              const savedChild = childrenData.find(c => c._id === savedChildId);
              if (savedChild) {
                setSelectedChild(savedChild);
              } else {
                // Saved child not found, select first child
                setSelectedChild(childrenData[0]);
                saveChildId(childrenData[0]._id);
              }
            } else if (childrenData.length > 0) {
              // No saved child, select first child by default
              setSelectedChild(childrenData[0]);
              saveChildId(childrenData[0]._id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const selectChild = (child) => {
    console.log("ChildContext - selectChild called with:", child);
    setSelectedChild(child);
    // Save to localStorage so it persists across page navigation
    saveChildId(child?._id || null);
    console.log("ChildContext - selectedChild updated");
  };

  const value = {
    selectedChild,
    children,
    user,
    loading,
    selectChild,
  };

  return (
    <ChildContext.Provider value={value}>{reactChildren}</ChildContext.Provider>
  );
};
