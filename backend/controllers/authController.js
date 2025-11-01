const jwt = require("jsonwebtoken");
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

  // Check password match
  if (user.password !== password) {
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

    const newUser = new User({
      name,
      email,
      password,
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
      children: user.children || [],
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signup, login, getCurrentUser };
