const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    familyName: { type: String },
    country: { type: String, default: "Canada" },
    state: { type: String },
    children: [{ type: mongoose.Schema.Types.ObjectId }], // Add children field
    budget: { type: mongoose.Schema.Types.ObjectId },
    expenses: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { collection: "Users", timestamps: true } // Explicitly have to specify the collection name , Because by default it will be called "users" and in Our Database We have called "Users"
);

module.exports = mongoose.model("User", userSchema);
