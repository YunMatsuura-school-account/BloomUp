const mongoose = require("mongoose");

// Simple Vaccination Template Schema for storing vaccination data
const vaccinationTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ageInMonths: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "routine" },
  isRequired: { type: Boolean, default: true },
  nextDoseAge: { type: Number, default: null },
  totalDoses: { type: Number, default: 1 },
  diseasesPrevented: { type: [String], default: [] },
  sideEffects: { type: [String], default: [] },
  notes: { type: String, default: "" },
  province: { type: String, default: "British Columbia" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Simple Vaccination Recommendation Schema for storing child-specific recommendations
const vaccinationRecommendationSchema = new mongoose.Schema({
  childId: { type: String, required: true },
  userId: { type: String, required: true },
  vaccinationName: { type: String, required: true },
  recommendedDate: { type: Date, required: true },
  ageInMonths: { type: Number, required: true },
  status: {
    type: String,
    enum: ["recommended", "scheduled", "completed", "missed"],
    default: "recommended",
  },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const VaccinationTemplate = mongoose.model(
  "VaccinationTemplate",
  vaccinationTemplateSchema,
  "VaccinationTemplates"
);
const VaccinationRecommendation = mongoose.model(
  "VaccinationRecommendation",
  vaccinationRecommendationSchema,
  "VaccinationRecommendations"
);

module.exports = {
  VaccinationTemplate,
  VaccinationRecommendation,
};
