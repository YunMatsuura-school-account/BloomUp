import React from "react";
import VaccinationDashboard from "./VaccinationDashboard";
import { useChild } from "../contexts/ChildContext";

const Dashboard = () => {
  const { selectedChild, user, loading } = useChild();

  // Debug logging
  console.log("Dashboard - selectedChild:", selectedChild);
  console.log("Dashboard - user:", user);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to your Dashboard
        </h1>
        <p className="text-gray-600">
          {user?.name ? `Hello ${user.name}!` : "Hello!"} Here's an overview of
          your family's health and activities.
        </p>
      </div>

      {/* Vaccination Recommendations - Only on Dashboard */}
      {selectedChild && (
        <VaccinationDashboard
          key={selectedChild._id} // Force re-render when child changes
          childId={selectedChild._id}
          userId={user?.id}
          childDateOfBirth={selectedChild.dateOfBirth}
        />
      )}

      {!selectedChild && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-center">
            No child selected. Please select a child from the sidebar to see
            vaccination recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
