const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  const username = req.body.username;

  // Here we will add more credentials later
  // Authenticate User with Password Credential
  // *****************************  Will Do After adding/Connecting Mongo DB in Project

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  //   // JWT Token Authentication

  const user = { name: username };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30m", // Token expires in 30 minutes
  });

  res.json({ accessToken });
};
