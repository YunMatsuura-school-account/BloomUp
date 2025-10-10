import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

// function App() {
//   // Signup form state
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Form Data Submitted:", formData);
//     alert(
//       `Name: ${formData.name}\nEmail: ${formData.email}\nPassword: ${formData.password}`
//     );
//   };

//   // Budget state
//   const [budgetMonth, setBudgetMonth] = useState("");
//   const [budgetAmount, setBudgetAmount] = useState("");
//   const [budgets, setBudgets] = useState({});

//   // Fetch budgets from backend
//   useEffect(() => {
//     fetch("http://localhost:8888/api/budget")
//       .then((res) => res.json())
//       .then((data) => setBudgets(data))
//       .catch((err) => console.error(err));
//   }, []);

//   // Add or update budget
//   const handleBudgetSubmit = async (e) => {
//     e.preventDefault();
//     if (!budgetMonth || !budgetAmount) return;

//     try {
//       const res = await fetch("http://localhost:8888/api/budget", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ month: budgetMonth, amount: budgetAmount }),
//       });
//       const data = await res.json();
//       setBudgets(data.monthlyBudgets);
//       setBudgetMonth("");
//       setBudgetAmount("");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>

//       <h1>Vite + React</h1>

//       {/* Signup Form */}
//       <div
//         style={{
//           maxWidth: "400px",
//           margin: "20px auto",
//           padding: "20px",
//           border: "1px solid #ccc",
//           borderRadius: "8px",
//         }}
//       >
//         <h2>Signup Form</h2>
//         <form onSubmit={handleSubmit}>
//           <div style={{ marginBottom: "10px" }}>
//             <label>Name:</label>
//             <br />
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div style={{ marginBottom: "10px" }}>
//             <label>Email:</label>
//             <br />
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div style={{ marginBottom: "10px" }}>
//             <label>Password:</label>
//             <br />
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <button type="submit">Submit</button>
//         </form>
//       </div>

//       {/* Budget Form */}
//       <div
//         style={{
//           maxWidth: "400px",
//           margin: "20px auto",
//           padding: "20px",
//           border: "1px solid #ccc",
//           borderRadius: "8px",
//         }}
//       >
//         <h2>Budget Tracker</h2>
//         <form onSubmit={handleBudgetSubmit}>
//           <div style={{ marginBottom: "10px" }}>
//             <label>Month:</label>
//             <br />
//             <input
//               type="text"
//               value={budgetMonth}
//               onChange={(e) => setBudgetMonth(e.target.value)}
//               placeholder="e.g., October"
//               required
//             />
//           </div>

//           <div style={{ marginBottom: "10px" }}>
//             <label>Amount:</label>
//             <br />
//             <input
//               type="number"
//               value={budgetAmount}
//               onChange={(e) => setBudgetAmount(e.target.value)}
//               placeholder="e.g., 1888"
//               required
//             />
//           </div>

//           <button type="submit">Add / Update Budget</button>
//         </form>

//         <div style={{ marginTop: "20px" }}>
//           <h3>Current Budgets</h3>
//           {Object.keys(budgets).length === 0 && <p>No budgets set yet.</p>}
//           {Object.keys(budgets).map((month) => (
//             <p key={month}>
//               {month}: ${budgets[month]}
//             </p>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// }

// export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import DashboardLayout from "./layout/DashboardLayout";
import Budget from "./components/Budget";
// import Calendar from "./components/Calendar";
// import Articles from "./components/Articles";

function App() {
  return (
    <Router>
      <Routes>
        {/* Signup page */}
        <Route path="/" element={<Signup />} />

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
