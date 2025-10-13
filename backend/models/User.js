const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "Users", timestamps: true } // Explicitly have to specify the collection name , Because by default it will be called "users" and in Our Database We have called "Users"
);

module.exports = mongoose.model("User", userSchema);
