console.log("Server is running");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const express = require("express");
const app = express();
<<<<<<< HEAD
=======
const cors = require("cors");

const budgetRoutes = require("./routes/budgetRoutes");
>>>>>>> origin/tejaswani-developer

require("dotenv").config();

app.use(express.json());
<<<<<<< HEAD

=======
app.use(cors());
>>>>>>> origin/tejaswani-developer
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

<<<<<<< HEAD
=======
// New budget route
app.use("/api/budget", budgetRoutes);

>>>>>>> origin/tejaswani-developer
const PORT = process.env.PORT || 8888; // Form env file

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// const posts = [
//   {
//     username: "Vaibhav",
//     title: "Post 1",
//   },
//   {
//     username: "God",
//     title: "Post 2",
//   },
// ];

//  Middleware: Verify JWT Token
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"
//   if (!token) return res.status(401).json({ message: "No token provided" });

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: "Invalid token" });
//     req.user = user; // attach user info
//     next();
//   });
// }

// //  Protected route (only accessible with valid token)
// app.get("/posts", authenticateToken, (req, res) => {
//   const userPosts = posts.filter((p) => p.username === req.user.name);
//   res.json(userPosts);
// });

// app.listen(PORT, () => {
//   // logger.info(`Server is running on port ${env.PORT}`);
//   console.log(`Server is running  ${PORT}`);
// });
