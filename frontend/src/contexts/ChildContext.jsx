import React, { createContext, useContext, useState, useEffect } from "react";

const ChildContext = createContext();

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
            if (childrenData.length > 0) {
              setSelectedChild(childrenData[0]); // Select first child by default
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
