import { useState } from "react";

export default function AddExpense() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8888/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, category, description }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Expense added!");
        setAmount("");
        setCategory("");
        setDescription("");
      } else {
        alert(data.message || "Error adding expense");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding expense");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Expense Manually</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Save Expense</button>
    </form>
  );
}
