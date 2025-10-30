import React, { useState, useEffect } from "react";

const VaccinationDashboard = ({ childId, userId, childDateOfBirth }) => {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [childAge, setChildAge] = useState(24); // Default to 24 months

  // Calculate age in months from date of birth
  const calculateAgeInMonths = (dateOfBirth) => {
    if (!dateOfBirth) return 24; // Default to 24 months
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const ageInMonths =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());
    return Math.max(0, ageInMonths);
  };

  // Calculate age and fetch vaccinations when child changes
  useEffect(() => {
    const fetchVaccinationsForChild = async () => {
      if (!childId || !userId) return;

      // Calculate age first
      const calculatedAge = childDateOfBirth
        ? calculateAgeInMonths(childDateOfBirth)
        : 24;

      setChildAge(calculatedAge);
      setLoading(true);
      setError(null);

      try {
        // Pass both age and birth date to get calculated dates
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/users/${userId}/children/${childId}/vaccinations/recommendations?childAge=${calculatedAge}&birthDate=${encodeURIComponent(
            childDateOfBirth
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch vaccinations");
        }

        const data = await response.json();
        setVaccinations(data.recommendations || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching vaccinations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinationsForChild();
  }, [childId, userId, childDateOfBirth]);

  // Separate function for manual refresh
  const fetchVaccinations = async () => {
    if (!childId || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/${userId}/children/${childId}/vaccinations/recommendations?childAge=${childAge}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch vaccinations");
      }

      const data = await response.json();
      setVaccinations(data.recommendations || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching vaccinations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Vaccination Recommendations
      </h3>

      {/* Age Display */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Child Age:</strong> {childAge} months (
          {Math.floor(childAge / 12)} years {childAge % 12} months)
        </p>
        <button
          onClick={fetchVaccinations}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm"
        >
          Refresh Recommendations
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading vaccinations...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Vaccination List */}
      {!loading && !error && (
        <div>
          {vaccinations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No upcoming vaccinations</p>
              <p className="text-sm">
                All vaccinations for this age have been completed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Found {vaccinations.length} upcoming vaccination(s) for{" "}
                {childAge}-month-old child
              </p>

              {vaccinations.map((vaccination) => (
                <div
                  key={vaccination._id}
                  className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
                    vaccination.status === "overdue"
                      ? "border-red-300 bg-red-50"
                      : vaccination.status === "due-soon"
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {vaccination.name}
                        </h3>
                        {vaccination.status === "overdue" && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⚠️ Overdue
                          </span>
                        )}
                        {vaccination.status === "due-soon" && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            📅 Due Soon
                          </span>
                        )}
                      </div>

                      {/* Recommended Date - Highlighted */}
                      {vaccination.formattedDate && (
                        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-semibold text-blue-900">
                            📅 Recommended Date: {vaccination.formattedDate}
                          </p>
                          {vaccination.daysUntilVaccination !== null && (
                            <p className="text-xs text-blue-700 mt-1">
                              {vaccination.daysUntilVaccination > 0
                                ? `In ${vaccination.daysUntilVaccination} days`
                                : `${Math.abs(
                                    vaccination.daysUntilVaccination
                                  )} days overdue`}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mt-1">
                        {vaccination.description}
                      </p>

                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <span>📍 Age: {vaccination.ageInMonths} months</span>
                        <span>💉 Total doses: {vaccination.totalDoses}</span>
                        {vaccination.nextDoseAge && (
                          <span>
                            ➡️ Next dose: {vaccination.nextDoseAge} months
                          </span>
                        )}
                      </div>

                      {/* Diseases Prevented */}
                      {vaccination.diseasesPrevented &&
                        vaccination.diseasesPrevented.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700">
                              Prevents:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {vaccination.diseasesPrevented.map(
                                (disease, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                                  >
                                    {disease}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vaccination.isRequired
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {vaccination.isRequired ? "Required" : "Optional"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VaccinationDashboard;
