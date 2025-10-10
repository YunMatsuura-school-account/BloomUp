import { useState, useEffect } from "react";

function Budget() {
  const [budget, setBudget] = useState({});
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    // Example fetch, you can replace with your backend API
    fetch("http://localhost:8888/api/budget")
      .then((res) => res.json())
      .then((data) => setBudget(data))
      .catch((err) => console.error("Error fetching budget:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:8888/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, amount }),
    })
      .then((res) => res.json())
      .then((data) => {
        setBudget(data.monthlyBudgets);
        alert(data.message);
      })
      .catch((err) => console.error("Error updating budget:", err));
  };

  return (
    <div>
      <h1>Monthly Budget</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Month (e.g. January)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">Save Budget</button>
      </form>

      <h2>All Budgets</h2>
      {Object.keys(budget).length === 0 ? (
        <p>No budgets yet.</p>
      ) : (
        <ul>
          {Object.entries(budget).map(([m, a]) => (
            <li key={m}>
              <strong>{m}:</strong> ${a}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Budget;
