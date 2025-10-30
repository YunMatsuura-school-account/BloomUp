import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddExpense() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Consumable");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = "http://localhost:8888/api/budget";
  const getToken = () => localStorage.getItem("accessToken");

  const categories = ["Medical", "Education", "Consumable", "Clothes", "Entertainment", "Transport", "Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      alert("You must be logged in.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/add-manual`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          category, 
          description,
          merchantName: description,
          date,
          quantity: parseInt(quantity)
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Expense added successfully!");
        navigate("/dashboard/budget");
      } else {
        alert(data.message || "Error adding expense");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop Blur Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" 
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={() => navigate("/dashboard/budget")} 
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-5 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold m-0">Add Expense</h2>
              <button
                onClick={() => navigate("/dashboard/budget")}
                className="bg-transparent border-none text-2xl cursor-pointer p-1 text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  maxLength="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  Max. 30 words
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/budget")}
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-teal-500 text-white border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}