// backend/controllers/vaccinationController.js
// Vaccination recommendation logic

const { VaccinationTemplate } = require("../models/vaccination");

// Helper function to calculate vaccination date based on birth date and age in months
const calculateVaccinationDate = (birthDate, ageInMonths) => {
  const date = new Date(birthDate);
  date.setMonth(date.getMonth() + ageInMonths);
  return date;
};

// Helper function to format date as readable string
const formatDate = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

// Helper function to calculate days until vaccination
const daysUntil = (vaccinationDate) => {
  const today = new Date();
  const diffTime = vaccinationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get vaccination recommendations for a child with calculated dates
// GET /api/users/:userId/children/:childId/vaccinations/recommendations
exports.getVaccinationRecommendations = async (req, res) => {
  try {
    const { childId, userId } = req.params;
    const { childAge, birthDate } = req.query; // Age in months and birth date

    console.log(
      `Getting recommendations for child ${childId}, age: ${childAge} months, birthDate: ${birthDate}`
    );

    // Get all vaccination templates from MongoDB
    const allVaccinations = await VaccinationTemplate.find({}).lean();
    console.log(`Found ${allVaccinations.length} vaccination templates`);

    // Filter vaccinations that are appropriate for the child's age
    const childAgeInMonths = parseInt(childAge) || 24; // Default to 24 months (2 years)

    const upcomingVaccinations = allVaccinations.filter((vaccination) => {
      // Include vaccinations that are due AFTER the child's current age (upcoming)
      return vaccination.ageInMonths > childAgeInMonths;
    });

    console.log(`Found ${upcomingVaccinations.length} upcoming vaccinations`);

    // Calculate actual dates for each vaccination if birth date is provided
    const recommendationsWithDates = upcomingVaccinations.map((vaccination) => {
      let recommendedDate = null;
      let formattedDate = null;
      let daysUntilVaccination = null;
      let status = "upcoming";

      if (birthDate) {
        recommendedDate = calculateVaccinationDate(
          birthDate,
          vaccination.ageInMonths
        );
        formattedDate = formatDate(recommendedDate);
        daysUntilVaccination = daysUntil(recommendedDate);

        // Determine status based on days until vaccination
        if (daysUntilVaccination < 0) {
          status = "overdue";
        } else if (daysUntilVaccination <= 30) {
          status = "due-soon";
        } else {
          status = "upcoming";
        }
      }

      return {
        ...vaccination,
        recommendedDate: recommendedDate ? recommendedDate.toISOString() : null,
        formattedDate,
        daysUntilVaccination,
        status,
      };
    });

    // Sort by recommended date (earliest first)
    recommendationsWithDates.sort((a, b) => {
      if (!a.recommendedDate) return 1;
      if (!b.recommendedDate) return -1;
      return new Date(a.recommendedDate) - new Date(b.recommendedDate);
    });

    // Get the next upcoming vaccination (earliest one)
    const nextVaccination = recommendationsWithDates.find(
      (v) => v.status === "upcoming" || v.status === "due-soon"
    );

    // Return the recommendations
    res.json({
      success: true,
      childId,
      childAge: childAgeInMonths,
      birthDate: birthDate || null,
      totalVaccinations: allVaccinations.length,
      upcomingCount: recommendationsWithDates.length,
      nextVaccination: nextVaccination || null,
      recommendations: recommendationsWithDates,
    });
  } catch (error) {
    console.error("Error getting vaccination recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get vaccination recommendations",
      error: error.message,
    });
  }
};
