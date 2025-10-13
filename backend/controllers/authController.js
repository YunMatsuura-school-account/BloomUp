const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Dummy user
// const users = [
//   {
//     email: "vaibhav@example.com",
//     password: "123456",
//   },
// ];
// console.log(users);

const login = async (req, res) => {
  // const username = req.body.username;
  const { email, password } = req.body;

  // Here we will add more credentials later
  if (!email && !password) {
    return res.status(400).json({ message: "Email & Password Required" });
  }
  // Authenticate User with Password Credential
  // Match dummy user
  // Find user in the array
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // *****************************  Will Do After adding/Connecting Mongo DB in Project

  //   // JWT Token Authentication

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "2m", // Token expires in 30 minutes
  });

  res.json({ message: "Login successful", accessToken });
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
