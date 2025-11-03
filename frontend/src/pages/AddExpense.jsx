import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddExpense() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const navigate = useNavigate();
  const API_URL = "http://localhost:8888/api/budget";
  const getToken = () => localStorage.getItem("accessToken");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const response = await fetch(
        `${API_URL}/overview?month=${currentMonth}&year=${currentYear}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Budget overview:", data);
        
        if (data.categories && data.categories.length > 0) {
          const categoryNames = data.categories.map(cat => cat.name);
          setCategories(categoryNames);
          setCategory(categoryNames[0]); // Set first as default
          console.log("Categories loaded:", categoryNames);
        } else {
          console.warn("No categories in budget");
        }
      } else if (response.status === 404) {
        console.warn("No budget found for current month");
        alert("Please set up your budget first!");
        navigate("/dashboard/budget-setup");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      alert("You must be logged in.");
      navigate("/login");
      return;
    }

    if (!category) {
      alert("Please select a category");
      return;
    }

    setLoading(true);

    const payload = {
      amount: parseFloat(amount), 
      category, 
      description,
      date,
      quantity: parseInt(quantity)
    };

    console.log("Submitting expense:", payload);

    try {
      const res = await fetch(`${API_URL}/add-manual`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        alert("Expense added successfully!");
        navigate("/dashboard/budget");
      } else {
        console.error("Error:", data);
        alert(data.message || "Error adding expense");
      }
    } catch (err) {
      console.error("Request error:", err);
      alert("Error adding expense: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" 
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        />
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <p className="text-gray-600 font-sans">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" 
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={() => navigate("/dashboard/budget")} 
      />
      
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-[901px] max-h-[90vh] overflow-y-auto">
          {/* Mobile: 24px padding, Desktop: 48px vertical, 218px horizontal */}
          <div className="flex flex-col items-center w-full px-6 py-8 md:px-[218px] md:py-12">
            
            {/* Header */}
            <div className="flex justify-between items-center w-full mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 font-sans">Add Expense</h2>
              <button
                onClick={() => navigate("/dashboard/budget")}
                className="bg-transparent border-none text-2xl cursor-pointer p-1 text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6 md:space-y-8">
              {/* Date Field */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-sans"
                />
              </div>

              {/* Category Field */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-sans"
                >
                  {categories.length === 0 ? (
                    <option value="">No categories available</option>
                  ) : (
                    <>
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Amount Field */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-sans">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-numbers"
                  />
                </div>
              </div>

              {/* Quantity Field */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-sans"
                />
              </div>

              {/* Description Field */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                  Description
                </label>
                <textarea
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  maxLength="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-sans"
                />
                <div className="text-right text-xs text-gray-400 mt-1 font-sans">
                  {description.length}/100 characters
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 md:pt-8 w-full">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/budget")}
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || categories.length === 0}
                  className="flex-1 py-3 px-6 bg-[#238D88] text-white border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-[#1a6d69] disabled:cursor-not-allowed disabled:bg-gray-400 font-sans"
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