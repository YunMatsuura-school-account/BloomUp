const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const login = async (req, res) => {
  // const username = req.body.username;
  const { email, password } = req.body;

  if (!email && !password) {
    return res.status(400).json({ message: "Email & Password Required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  console.log("JWT Secret exists:", !!process.env.ACCESS_TOKEN_SECRET);

  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET || "fallback_secret_key",
    { expiresIn: "20m" }
  );

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
  });
};

const signup = async (req, res) => {
  try {
    const { name, email, password, country, state, familyName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      country,
      state,
      familyName,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      familyName: user.familyName,
      country: user.country,
      state: user.state,
      imageUrl: user.imageUrl || null,
      children: user.children || [],
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signup, login, getCurrentUser, changePassword };
