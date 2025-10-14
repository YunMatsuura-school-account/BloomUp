const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res) => {
  // const username = req.body.username;
  const { email, password } = req.body;

  // Here we will add more credentials later
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

  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "2m" }
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
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }

  // Add new USer
  // Later Have to connect with Databaser Mongo DB.
};

module.exports = { signup, login };
