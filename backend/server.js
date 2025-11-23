require("dotenv").config();
console.log("Server is running");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const childProfileRoutes = require("./routes/childProfileRoutes");
const express = require("express");
const app = express();
const cors = require("cors");
const budgetRoutes = require("./routes/budgetRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const articleRoutes = require("./routes/articleRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

const childrenRoutes = require("./routes/childrenRoutes");

const userRoutes = require("./routes/userRoutes");

const mongoose = require("mongoose");

// const calendarRoutes = require("./routes/calendarRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
// COMMENTED OUT - STARTING FRESH
// const testVaccinationRoutes = require("./routes/testVaccinationRoutes");
const path = require("path");
const uploadImageRoutes = require("./routes/uploadImageRoutes");

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api/calendar", calendarRoutes);
app.use("/api", vaccinationRoutes);

// COMMENTED OUT - STARTING FRESH
// app.use("/api", testVaccinationRoutes);
app.use(
  "/static/user-images",
  express.static(path.join(__dirname, "uploads", "userImages"))
);

app.use(
  "/static/child-images",
  express.static(path.join(__dirname, "uploads", "childImages"))
);

app.use("/api", uploadImageRoutes);
app.use("/api/ai", aiRoutes);

// Connect MongoDB via mongoose
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => console.log("✅ Mongoose connected to MongoDB"))
  .catch((err) => console.error("❌ Mongoose connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/:userId/children", childProfileRoutes);
app.use("/api/articles", articleRoutes);

//For Reminders
app.use("/api/reminders", reminderRoutes);

//
//app.use("/api/calendar", childrenRoutes);

// New budget route
app.use("/api/budget", budgetRoutes);
app.use("/api/user", userRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/calendar", calendarRoutes);

// For Category
const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/categories", categoryRoutes);

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
