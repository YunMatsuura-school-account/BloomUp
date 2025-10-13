// import { useState, useEffect } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";

// export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import DashboardLayout from "./layout/DashboardLayout";
import Budget from "./components/Budget";
import Login from "./pages/Login";
// import Calendar from "./components/Calendar";
// import Articles from "./components/Articles";

function App() {
  return (
    <Router>
      <Routes>
        {/* Signup page */}
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* Dashboard layout with sidebar */}
        <Route path="/dashboard/*" element={<DashboardLayout />}>
          {/* Default dashboard welcome */}
          <Route index element={<h2>Welcome to your Dashboard 👋</h2>} />

          {/* Nested pages */}
          <Route path="budget" element={<Budget />} />
          {/* <Route path="calendar" element={<Calendar />} /> */}
          {/* <Route path="articles" element={<Articles />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
