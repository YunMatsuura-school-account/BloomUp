const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const dbName = "BloomUp";
const collectionName = "ChildProfiles";

mongoose
  .connect(uri, { dbName: dbName })
  .then(() => console.log("Connected to MongoDB via Mongoose"))
  .catch((err) => console.error("Mongo error:", err));

// Schema
const childProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vaccinations: { type: Array, required: false },
  medicalHistory: { type: String, required: false },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: false }, // age in years, computed from dateOfBirth
  gender: { type: String, required: false },
  userId: { type: String, required: true },
  imageUrl: { type: String, required: false },
  avatarIndex: { type: Number, required: false }, // Index of selected avatar (0-7)
  avatarName: { type: String, required: false }, // Name of selected avatar
  backgroundColor: { type: String, required: false }, // Background color for avatar
});

//　(model name, schema, collection name)
const ChildProfile = mongoose.model(
  "ChildProfile",
  childProfileSchema,
  "ChildProfiles"
);

// Utilities
function calculateAgeYears(dob) {
  if (!dob) return undefined;
  const birth = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    years -= 1;
  }
  return years < 0 ? undefined : years;
}

//CRUD
async function getAllChildrenByUser(userId) {
  return await ChildProfile.find({ userId: String(userId) });
}

async function getChildByIdForUser(userId, childId) {
  return await ChildProfile.findOne({
    _id: childId, // String is OK. new ObjectId(childId) is wrong.
    userId: String(userId),
  });
}

async function createChildForUser(userId, profileData) {
  const age = calculateAgeYears(profileData.dateOfBirth);
  const document = await ChildProfile.create({
    ...profileData,
    age,
    userId: String(userId),
  });
  return document._id;
}

async function updateChildForUser(userId, childId, updatedData) {
  const update = { ...updatedData, userId: String(userId) };
  if (Object.prototype.hasOwnProperty.call(updatedData, "dateOfBirth")) {
    update.age = calculateAgeYears(updatedData.dateOfBirth);
  }
  const document = await ChildProfile.findOneAndUpdate(
    { _id: childId, userId: String(userId) },
    update,
    { new: true } // return updated value
  );
  return !!document; // return true or false
}

async function deleteChildForUser(userId, childId) {
  const document = await ChildProfile.findOneAndDelete({
    _id: childId,
    userId: String(userId),
  });
  return !!document;
}

module.exports = {
  mongoose,
  ChildProfile,
  getAllChildrenByUser,
  getChildByIdForUser,
  createChildForUser,
  updateChildForUser,
  deleteChildForUser,
};
