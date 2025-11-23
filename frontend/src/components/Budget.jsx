import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import BudgetSetup from "./BudgetSetup";
import UploadReceipt from "../pages/UploadReceipt";

const defaultCategoryColors = {
  'Education': '#0073E7',
  'Medical': '#0CC68E',
  'Consumable': '#F3BE08',
  'Food': '#E95900',
  'Clothes': '#EC4899',
  'Entertainment': '#8B5CF6',
  'Transport': '#3B82F6',
  'Other': '#B76EF6'
};

// Extended color palette for dynamic categories
const colorPalette = [
  '#a8dfe9ff', '#c8dd97ff', '#aa9664ff', '#F97316', 
  '#EC4899', '#8B5CF6', '#3B82F6', '#6B7280',
  '#EF4444', '#F59E0B', '#84CC16', '#06B6D4',
  '#8B5CF6', '#D946EF', '#F43F5E', '#14B8A6',
  '#0EA5E9', '#6366F1', '#A855F7', '#EC4899'
];

function getCategoryColor(categoryName, index) {
  // Check if it's a predefined category
  if (defaultCategoryColors[categoryName]) {
    return defaultCategoryColors[categoryName];
  }

  // Generate a consistent color based on category name hash
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use absolute value to ensure positive index
  const colorIndex = Math.abs(hash) % colorPalette.length;
  return colorPalette[colorIndex];
}

function BudgetAllocationBar({ overview }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Calculate percentages and prepare data with dynamic colors
  const allocationData = overview.categories
    .map((cat, index) => {
      const percentage =
        overview.total > 0 ? (cat.allocated / overview.total) * 100 : 0;

      return {
        name: cat.name,
        allocated: cat.allocated,
        percentage: percentage,
        color: getCategoryColor(cat.name, index),
      };
    })
    .filter((cat) => cat.allocated > 0); // Only show categories with budget

  if (allocationData.length === 0) {
    return null; // Don't render if no allocations
  }

  return (
    <div className="mb-6 bg-white rounded-lg p-5 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[15px] md:text-[25px] font-semibold text-gray-800 font-sans">
          Budget Allocation
        </h3>
        <div className="text-[12px] md:text-[16px] text-gray-600 font-sans flex flex-col gap-1">
          Total Allocated <span className="font-medium text-[12px] md:text-[32px] font-numbers">${overview.total}</span>
        </div>
      </div>

      {/* Allocation Bar */}
      <div className="relative w-full h-10 bg-gray-100 rounded-[50px] overflow-hidden flex">
        {allocationData.map((cat, index) => (
          <div
            key={cat.name}
            className="relative h-full transition-all duration-200 cursor-pointer hover:opacity-80"
            style={{
              width: `${cat.percentage}%`,
              backgroundColor: cat.color,
            }}
            onMouseEnter={() => setHoveredCategory(cat.name)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {/* Tooltip on hover */}
            {hoveredCategory === cat.name && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
                <div className="font-semibold">{cat.name}</div>
                <div className="font-numbers">
                  ${cat.allocated.toFixed(2)} ({cat.percentage.toFixed(1)}%)
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
        {allocationData.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
            onMouseEnter={() => setHoveredCategory(cat.name)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-xs text-gray-700 font-sans">
              {cat.name}:{" "}
              <span className="font-semibold font-numbers">
                ${cat.allocated.toFixed(0)}
              </span>
              <span className="text-gray-500 ml-1">
                ({cat.percentage.toFixed(0)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const getUserId = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload.userId || payload._id;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

function EditExpenseModal({ expense, onClose, onSave }) {
  const [formData, setFormData] = useState({
    amount: expense.amount || 0,
    category: expense.category || "Other",
    description: expense.merchantName || "",
    date: expense.date
      ? new Date(expense.date).toISOString().split("T")[0]
      : "",
    quantity: expense.quantity || 1,
  });

  const categories = [
    "Medical",
    "Education",
    "Consumable",
    "Clothes",
    "Entertainment",
    "Transport",
    "Other",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-[15px] md:text-xl font-semibold text-gray-800 mb-4 font-sans">
          Edit Expense
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238D88] font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238D88] font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238D88] font-sans"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238D88] font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238D88] font-sans"
              min="1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-sans font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-[#238D88] text-white rounded-lg hover:bg-[#1a6d69] font-sans font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Three Dot Menu Component
function ThreeDotMenu({ expense, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer font-sans text-gray-700 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
              >
                <g clip-path="url(#clip0_3494_59327)">
                  <path
                    d="M10.6253 3.54177L13.4586 6.37511M14.9985 4.82527C15.373 4.45087 15.5835 3.94302 15.5835 3.41346C15.5836 2.8839 15.3733 2.37601 14.9989 2.0015C14.6245 1.627 14.1166 1.41657 13.5871 1.4165C13.0575 1.41644 12.5496 1.62674 12.1751 2.00115L2.7217 11.4567C2.55723 11.6207 2.43561 11.8226 2.36753 12.0446L1.43182 15.1273C1.41351 15.1885 1.41213 15.2536 1.42782 15.3156C1.44351 15.3776 1.47568 15.4341 1.52093 15.4793C1.56617 15.5245 1.6228 15.5566 1.68481 15.5722C1.74681 15.5877 1.81188 15.5863 1.87311 15.5679L4.95649 14.6329C5.17832 14.5654 5.38019 14.4445 5.5444 14.2808L14.9985 4.82527Z"
                    stroke="black"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_3494_59327">
                    <rect width="17" height="17" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 border-none bg-transparent cursor-pointer font-sans text-red-600 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
              >
                <path
                  d="M13.4583 4.24984V14.1665C13.4583 14.5422 13.3091 14.9026 13.0434 15.1682C12.7777 15.4339 12.4174 15.5832 12.0417 15.5832H4.95833C4.58261 15.5832 4.22228 15.4339 3.9566 15.1682C3.69092 14.9026 3.54167 14.5422 3.54167 14.1665V4.24984M2.125 4.24984H14.875M5.66667 4.24984V2.83317C5.66667 2.45745 5.81592 2.09711 6.0816 1.83144C6.34728 1.56576 6.70761 1.4165 7.08333 1.4165H9.91667C10.2924 1.4165 10.6527 1.56576 10.9184 1.83144C11.1841 2.09711 11.3333 2.45745 11.3333 2.83317V4.24984"
                  stroke="#FF7B7B"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Budget() {
  const [overview, setOverview] = useState({
    total: 0,
    spent: 0,
    remaining: 0,
    categories: [],
  });
  const [expenses, setExpenses] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("Monthly");
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [showUploadReceipt, setShowUploadReceipt] = useState(false);
  const [aiInsights, setAiInsights] = useState(() => {
    const userId = getUserId();
    if (!userId) return null;

    const saved = localStorage.getItem(`aiInsights_${userId}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsLastFetched, setInsightsLastFetched] = useState(() => {
    const userId = getUserId();
    if (!userId) return null;

    const saved = localStorage.getItem(`aiInsightsTimestamp_${userId}`);
    return saved ? parseInt(saved) : null;
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "";
  const API_URL = `${API_BASE}/api/budget`;

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  const fetchBudgetOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();

      const response = await fetch(`${API_URL}/overview`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }
        if (response.status === 404) {
          setOverview({ total: 0, spent: 0, remaining: 0, categories: [] });
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOverview(data);
    } catch (err) {
      console.error("Error fetching overview:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();

      console.log(`Fetching expenses for year: ${currentYear}`);

      const response = await fetch(`${API_URL}/expenses/year/${currentYear}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched ${data.length} expenses for year ${currentYear}`);

        const byMonth = {};
        data.forEach((exp) => {
          const date = new Date(exp.date);
          const month = date.getUTCMonth() + 1;
          byMonth[month] = (byMonth[month] || 0) + 1;
        });
        console.log("Expenses by month:", byMonth);

        setExpenses(data);
      } else {
        console.error("Failed to fetch expenses:", response.status);
        const errorText = await response.text();
        console.error("Error details:", errorText);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const fetchAIInsights = async () => {
    try {
      setInsightsLoading(true);
      const token = getToken();

      if (!token) return;

      const response = await fetch(`${API_URL}/ai-insights`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const timestamp = Date.now();
        const userId = getUserId();

        if (!userId) {
          console.error("No user ID found");
          return;
        }

        setAiInsights(data.insights);
        setInsightsLastFetched(timestamp);

        localStorage.setItem(
          `aiInsights_${userId}`,
          JSON.stringify(data.insights)
        );
        localStorage.setItem(
          `aiInsightsTimestamp_${userId}`,
          timestamp.toString()
        );

        console.log(" AI Insights fetched and saved for user:", userId);
      }
    } catch (err) {
      console.error("Error fetching AI insights:", err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(expenses.filter((exp) => exp._id !== expenseId));

        if (data.budgetOverview) {
          setOverview((prev) => ({
            ...prev,
            spent: data.budgetOverview.spent,
            remaining: data.budgetOverview.remaining,
            status: data.budgetOverview.status,
          }));
        }
      } else {
        throw new Error("Failed to delete expense");
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const handleDeleteGroupedExpense = async (expenseGroup) => {
    try {
      const token = getToken();

      const deletePromises = expenseGroup.expenseIds.map((expenseId) =>
        fetch(`${API_URL}/expenses/${expenseId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      );

      const responses = await Promise.all(deletePromises);

      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        const lastResponse = responses[responses.length - 1];
        const data = await lastResponse.json();

        setExpenses(
          expenses.filter((exp) => !expenseGroup.expenseIds.includes(exp._id))
        );

        if (data.budgetOverview) {
          setOverview((prev) => ({
            ...prev,
            spent: data.budgetOverview.spent,
            remaining: data.budgetOverview.remaining,
            status: data.budgetOverview.status,
          }));
        }
      } else {
        throw new Error("Some expenses failed to delete");
      }
    } catch (err) {
      console.error("Error deleting grouped expenses:", err);
    }
  };

  const handleEditExpense = async (formData) => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/expenses/${editingExpense._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();

        setExpenses(
          expenses.map((exp) =>
            exp._id === editingExpense._id ? data.expense : exp
          )
        );

        if (data.budgetOverview) {
          setOverview((prev) => ({
            ...prev,
            spent: data.budgetOverview.spent,
            remaining: data.budgetOverview.remaining,
            status: data.budgetOverview.status,
          }));
        }

        setEditingExpense(null);
      } else {
        throw new Error("Failed to update expense");
      }
    } catch (err) {
      console.error("Error updating expense:", err);
    }
  };

  const handleRefreshInsights = () => {
    fetchAIInsights();
  };

  useEffect(() => {
    fetchBudgetOverview();
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      calculateMonthlySpending();
    } else {
      setMonthlySpending(
        Array(12)
          .fill(0)
          .map((_, index) => ({
            month: index,
            spent: 0,
            withinBudget: 0,
            overBudget: 0,
            monthlyBudget: overview.total || 0,
          }))
      );
    }
  }, [expenses.length, selectedCategory, selectedTimeframe, overview.total]);

  useEffect(() => {
    if (
      expenses.length > 0 &&
      overview.total > 0 &&
      !aiInsights &&
      !insightsLoading
    ) {
      console.log("First time loading AI insights...");
      fetchAIInsights();
    }
  }, []);

  useEffect(() => {
    const checkMonthChange = () => {
      const userId = getUserId();
      if (!userId) return;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const lastCheckedKey = `lastBudgetCheck_${userId}`;
      const lastChecked = localStorage.getItem(lastCheckedKey);

      const currentMonthKey = `${currentYear}-${currentMonth}`;

      if (lastChecked !== currentMonthKey) {
        localStorage.setItem(lastCheckedKey, currentMonthKey);

        setTimeout(() => {
          if (overview.total === 0) {
            const monthNames = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ];
            const monthName = monthNames[currentMonth - 1];

            // if (
            //   confirm(
            //     `It's a new month! Set your budget for ${monthName} ${currentYear}?`
            //   )
            // ) {
              setShowBudgetSetup(true);
            // }
          }
        }, 1500);
      }
    };

    checkMonthChange();
    const interval = setInterval(checkMonthChange, 3600000);
    return () => clearInterval(interval);
  }, [overview]);

  useEffect(() => {
    const checkMonthChange = () => {
      const userId = getUserId();
      if (!userId) return;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const lastCheckedKey = `lastBudgetCheck_${userId}`;
      const lastChecked = localStorage.getItem(lastCheckedKey);

      const currentMonthKey = `${currentYear}-${currentMonth}`;

      if (lastChecked !== currentMonthKey) {
        console.log(`Month changed from ${lastChecked} to ${currentMonthKey}`);

        localStorage.setItem(lastCheckedKey, currentMonthKey);

        if (!loading && overview.total === 0) {
          setTimeout(() => {
            const monthNames = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ];
            const monthName = monthNames[currentMonth - 1];
            
            // if (confirm(`It's a new month! Set your budget for ${monthName} ${currentYear}?`)) {
              setShowBudgetSetup(true);
            // }
          }, 1500);
        }
      }
    };

    if (!loading) {
      checkMonthChange();
    }

    const interval = setInterval(checkMonthChange, 3600000);
    return () => clearInterval(interval);
  }, [overview, loading]);

  const refreshMonthlyData = async () => {
    console.log(" Refreshing monthly spending data after budget update...");
    await calculateMonthlySpendingData();
  };

  const calculateMonthlySpending = () => {
    if (selectedTimeframe === "Weekly") {
      calculateWeeklySpending();
    } else {
      calculateMonthlySpendingData();
    }
  };

  const calculateMonthlySpendingData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // 0-11
      const token = getToken();

      if (!token) return;

      console.log(
        "Fetching monthly spending with historical budgets for category:",
        selectedCategory
      );

      // First, fetch all expenses for the year
      const expensesResponse = await fetch(
        `${API_URL}/expenses/year/${currentYear}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!expensesResponse.ok) {
        console.error("Failed to fetch expenses data");
        calculateMonthlySpendingDataFallback();
        return;
      }

      const allExpenses = await expensesResponse.json();

      // Filter expenses by selected category if not "All"
      const filteredExpenses =
        selectedCategory === "All"
          ? allExpenses
          : allExpenses.filter((exp) => exp.category === selectedCategory);

      // Now fetch monthly spending data to get historical budgets
      const monthlyResponse = await fetch(
        `${API_URL}/monthly-spending?year=${currentYear}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!monthlyResponse.ok) {
        console.error("Failed to fetch monthly spending data");
        calculateMonthlySpendingDataFallback();
        return;
      }

      const data = await monthlyResponse.json();
      console.log("Monthly spending data from API:", data);

      // Calculate monthly spending for the filtered expenses
      const monthlySpendingByMonth = Array(12).fill(0);

      filteredExpenses.forEach((expense) => {
        const expenseDate = new Date(expense.date);
        const expenseYear = expenseDate.getUTCFullYear();

        if (expenseYear === currentYear) {
          const monthIndex = expenseDate.getUTCMonth();
          monthlySpendingByMonth[monthIndex] += expense.amount || 0;
        }
      });

      const monthlyData = data.months.map((monthData, index) => {
        let monthlyBudget = 0;

        if (monthData.budget) {
          if (selectedCategory === "All") {
            monthlyBudget = monthData.budget.total || 0;
            console.log(
              `Month ${
                index + 1
              }: Using historical total budget: $${monthlyBudget}`
            );
          } else {
            // Check if the category exists in the historical budget
            const categoryBudget =
              monthData.budget.categories?.[selectedCategory];
            monthlyBudget = categoryBudget ? categoryBudget.allocated : 0;
            console.log(
              `Month ${
                index + 1
              } (${selectedCategory}): Using historical category budget: $${monthlyBudget}`
            );
          }
        } else {
          console.log(`Month ${index + 1}: No budget data found`);
        }

        const spent = monthlySpendingByMonth[index] || 0;
        const withinBudget =
          monthlyBudget > 0 ? Math.min(spent, monthlyBudget) : spent;
        const overBudget =
          monthlyBudget > 0 ? Math.max(0, spent - monthlyBudget) : 0;

        return {
          month: index,
          spent,
          withinBudget,
          overBudget,
          monthlyBudget,
          isPastMonth: index < currentMonth,
        };
      });

      console.log(
        "Final processed monthly data with category filter:",
        monthlyData
      );
      setMonthlySpending(monthlyData);
    } catch (error) {
      console.error("Error in calculateMonthlySpendingData:", error);
      calculateMonthlySpendingDataFallback();
    }
  };

  const calculateMonthlySpendingDataFallback = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11

    // Filter expenses by selected category
    const filteredExpenses =
      selectedCategory === "All"
        ? expenses
        : expenses.filter((exp) => exp.category === selectedCategory);

    const months = Array(12).fill(0);

    filteredExpenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getUTCFullYear();

      if (expenseYear === currentYear) {
        const monthIndex = expenseDate.getUTCMonth();
        months[monthIndex] += expense.amount || 0;
      }
    });

    // Use current budget for all months (fallback behavior)
    let currentMonthlyBudget = overview.total || 0;
    if (
      selectedCategory !== "All" &&
      overview.categories &&
      overview.categories.length > 0
    ) {
      const categoryData = overview.categories.find(
        (cat) => cat.name === selectedCategory
      );
      currentMonthlyBudget = categoryData ? categoryData.allocated || 0 : 0;
    }

    const monthlyData = months.map((spent, index) => {
      const monthlyBudget = currentMonthlyBudget;

      const withinBudget =
        monthlyBudget > 0 ? Math.min(spent, monthlyBudget) : spent;
      const overBudget =
        monthlyBudget > 0 ? Math.max(0, spent - monthlyBudget) : 0;

      return {
        month: index,
        spent,
        withinBudget,
        overBudget,
        monthlyBudget,
        isPastMonth: index < currentMonth,
      };
    });

    setMonthlySpending(monthlyData);
  };

  const calculateWeeklySpending = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getUTCFullYear();
    const currentMonth = currentDate.getUTCMonth();

    let totalBudget = overview.total || 0;
    if (
      selectedCategory !== "All" &&
      overview.categories &&
      overview.categories.length > 0
    ) {
      const categoryData = overview.categories.find(
        (cat) => cat.name === selectedCategory
      );
      totalBudget = categoryData ? categoryData.allocated || 0 : 0;
    }

    const weeklyBudget = totalBudget / 4;
    const weeks = Array(4).fill(0);

    const filteredExpenses =
      selectedCategory === "All"
        ? expenses
        : expenses.filter((exp) => exp.category === selectedCategory);

    filteredExpenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);

      if (
        expenseDate.getUTCFullYear() === currentYear &&
        expenseDate.getUTCMonth() === currentMonth
      ) {
        const dayOfMonth = expenseDate.getUTCDate();
        const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
        weeks[weekIndex] += expense.amount || 0;
      }
    });

    const weeklyData = weeks.map((spent, index) => {
      const withinBudget =
        weeklyBudget > 0 ? Math.min(spent, weeklyBudget) : spent;
      const overBudget =
        weeklyBudget > 0 ? Math.max(0, spent - weeklyBudget) : 0;

      return {
        week: index,
        spent,
        withinBudget,
        overBudget,
        weeklyBudget,
      };
    });

    setMonthlySpending(weeklyData);
  };

  const getChartData = () => {
    if (selectedTimeframe === "Weekly") {
      const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];

      if (monthlySpending.length === 0) {
        return {
          labels: weekLabels,
          datasets: [
            {
              label: "At Budget",
              data: Array(4).fill(0),
              backgroundColor: "#238D88",
              borderRadius: 0,
              borderSkipped: false,
            },
            {
              label: "Below Budget",
              data: Array(4).fill(0),
              backgroundColor: "#238D88",
              borderRadius: { topLeft: 8, topRight: 8 },
              borderSkipped: false,
            },
            {
              label: "Over Budget",
              data: Array(4).fill(0),
              backgroundColor: "#F39D08",
              borderRadius: { topLeft: 8, topRight: 8 },
              borderSkipped: false,
            },
          ],
        };
      }

      const atBudgetData = [];
      const belowBudgetData = [];
      const overBudgetData = [];

      monthlySpending.forEach((w) => {
        const budget = w.weeklyBudget || 0;
        const spent = w.spent || 0;

        if (budget === 0) {
          atBudgetData.push(0);
          belowBudgetData.push(spent);
          overBudgetData.push(0);
        } else if (spent < budget) {
          atBudgetData.push(0);
          belowBudgetData.push(spent);
          overBudgetData.push(0);
        } else if (spent === budget) {
          atBudgetData.push(spent);
          belowBudgetData.push(0);
          overBudgetData.push(0);
        } else {
          atBudgetData.push(budget);
          belowBudgetData.push(0);
          overBudgetData.push(spent - budget);
        }
      });

      return {
        labels: weekLabels,
        datasets: [
          {
            label: "At Budget",
            data: atBudgetData,
            backgroundColor: "#238D88",
            borderRadius: 0,
            borderSkipped: false,
          },
          {
            label: "Below Budget",
            data: belowBudgetData,
            backgroundColor: "#238D88",
            borderRadius: { topLeft: 8, topRight: 8 },
            borderSkipped: false,
          },
          {
            label: "Over Budget",
            data: overBudgetData,
            backgroundColor: "#F39D08",
            borderRadius: { topLeft: 8, topRight: 8 },
            borderSkipped: false,
          },
        ],
      };
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    if (monthlySpending.length === 0 || !hasData) {
      const ghostHeights = [
        1200, 900, 1500, 1800, 1300, 2000, 1600, 1100, 1700, 1400, 1900, 1000,
      ];
      return {
        labels: monthNames,
        datasets: [
          {
            label: "",
            data: ghostHeights,
            backgroundColor: "#E5E7EB",
            borderRadius: { topLeft: 8, topRight: 8 },
            borderSkipped: false,
          },
        ],
      };
    }

    const atBudgetData = [];
    const belowBudgetData = [];
    const overBudgetData = [];

    monthlySpending.forEach((m) => {
      const budget = m.monthlyBudget || 0;
      const spent = m.spent || 0;

      if (budget === 0) {
        atBudgetData.push(0);
        belowBudgetData.push(spent);
        overBudgetData.push(0);
      } else if (spent < budget) {
        atBudgetData.push(0);
        belowBudgetData.push(spent);
        overBudgetData.push(0);
      } else if (spent === budget) {
        atBudgetData.push(spent);
        belowBudgetData.push(0);
        overBudgetData.push(0);
      } else {
        atBudgetData.push(budget);
        belowBudgetData.push(0);
        overBudgetData.push(spent - budget);
      }
    });

    return {
      labels: monthNames,
      datasets: [
        {
          label: "At Budget",
          data: atBudgetData,
          backgroundColor: "#238D88",
          borderRadius: 0,
          borderSkipped: false,
        },
        {
          label: "Below Budget",
          data: belowBudgetData,
          backgroundColor: "#238D88",
          hoverBackgroundColor: "#f39d08",
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false,
        },
        {
          label: "Over Budget",
          data: overBudgetData,
          backgroundColor: "#F39D08",
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false,
        },
      ],
    };
  };

  const getAvailableCategories = () => {
    const categories = ["All"];

    if (overview.categories && overview.categories.length > 0) {
      overview.categories.forEach((cat) => {
        if (cat.name && !categories.includes(cat.name)) {
          categories.push(cat.name);
        }
      });
    } else {
      categories.push(
        "Medical",
        "Education",
        "Consumable",
        "Clothes",
        "Entertainment",
        "Transport",
        "Other"
      );
    }

    return categories;
  };

  const hasData = monthlySpending.some((m) => m.spent > 0);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: { display: false },
      tooltip: {
        enabled: hasData,
        backgroundColor: '#E2E2E2',
        titleColor: '#000000',
        bodyColor: '#000000',
        padding: 12,
        titleFont: { size: 13, weight: 'bold', family: 'DM Sans, system-ui, sans-serif'  },
        bodyFont: { size: 12, family: 'DM Sans, system-ui, sans-serif' },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            label += "$" + context.parsed.y.toFixed(2);
            return label;
          },
          afterBody: function (context) {
            const idx = context[0].dataIndex;
            if (monthlySpending && monthlySpending[idx]) {
              const data = monthlySpending[idx];
              return [
                `Total Spent: $${data.spent.toFixed(2)}`,
                `Budget: $${data.monthlyBudget || data.weeklyBudget || 0}`,
              ];
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          font: { size: 11, family: "DM Sans, system-ui, sans-serif" },
          color: "#737373",
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        suggestedMax: function (context) {
          const maxValue = Math.max(
            ...context.chart.data.datasets.flatMap((d) => d.data)
          );
          const roundedMax = Math.ceil(maxValue / 2000) * 2000;
          return Math.max(roundedMax, 2000);
        },
        ticks: {
          font: {
            size: 11,
            family: "Urbanist, DM Sans, system-ui, sans-serif",
          },
          color: "#737373",
          stepSize: 500,
          callback: function (value) {
            return value === 0 ? "0" : value.toLocaleString();
          },
        },
      },
    },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const groupedExpenses = expenses.reduce((acc, expense) => {
    const dateStr = new Date(expense.date).toISOString().split("T")[0];
    const store = (expense.merchantName || "Unknown Store").trim();
    const key = `${dateStr}-${store}`;

    if (!acc[key]) {
      acc[key] = {
        id: key,
        date: expense.date,
        merchantName: store,
        category: expense.category,
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
        expenseIds: [],
      };
    }

    acc[key].items.push(expense);
    acc[key].totalQuantity += parseInt(expense.quantity) || 1;
    acc[key].totalAmount += parseFloat(expense.amount) || 0;
    acc[key].expenseIds.push(expense._id);

    return acc;
  }, {});

  const groupedExpensesArray = Object.values(groupedExpenses).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const filteredExpenses = groupedExpensesArray.filter((expense) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const description = (expense.merchantName || "").toLowerCase();
    const category = (expense.category || "").toLowerCase();

    return description.includes(query) || category.includes(query);
  });

  if (loading) {
    return (
      <div className="bg-[#EFEFEF] min-h-screen flex items-center justify-center">
        <div className="text-[15px] md:text-lg text-gray-600 font-sans">Loading budget...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl max-w-md text-center">
          <div className="text-[15px] md:text-lg text-red-600 mb-4 font-sans font-semibold">
            Error loading budget
          </div>
          <div className="text-[12px] md:text-sm text-gray-600 mb-4 font-sans">
            {error}
          </div>
          <button
            onClick={fetchBudgetOverview}
            className="px-5 py-2.5 bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm font-sans font-medium hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EFEFEF] min-h-screen font-sans">
      <div className="p-5">
        {/* Consolidated Budget Overview Section */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex  md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-[18px] md:text-[24px] font-semibold text-gray-800 m-0 font-sans">Budget Overview</h2>
            <button 
  onClick={() => setShowBudgetSetup(true)} 
  className="flex justify-center items-center gap-[10px] rounded-[50px] bg-[#F3BE08] text-[15px] md:text-[20px] font-[400] leading-[140%] font-sans px-4 md:px-6 py-3 cursor-pointer border-none whitespace-nowrap"
>
  {/* Text for desktop, icon for mobile */}
  <span className="hidden md:inline">Budget Setup</span>
  <svg 
    className="md:hidden" 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M5 12H19M12 5V19" 
      stroke="black" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F5F5F5] rounded-lg p-5 text-center border border-gray-200">
              <div className="text-[20px] text-gray-600 mb-2 font-sans ">Total Budget</div>
              <div className="text-[19px] md:text-[36px]  font-medium text-gray-800 font-numbers">${overview.total?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="bg-[rgba(243,190,8,0.10)] rounded-lg p-5 text-center border border-[#F3BE08]">
              <div className="text-[20px] mb-2 font-sans  text-[#636363]">Budget Spent</div>
              <div className="text-[19px] md:text-[36px] font-medium text-[#F39D08] font-numbers">${overview.spent?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="bg-[rgba(35,141,136,0.10)] rounded-lg p-5 text-center border border-[#238D88]">
              <div className="text-[20px] mb-2 font-sans  text-[#636363]">Remaining</div>
              <div className="text-[19px] md:text-[36px] font-medium text-[#238D88] font-numbers">${overview.remaining?.toFixed(2) || "0.00"}</div>
              {/* {overview.total > 0 && (
                <div className="text-xs mt-2 font-sans font-medium text-[#238D88]">{overview.status}</div>
              )} */}
            </div>
          </div>

          {/* {overview.categories && overview.categories.length > 0 && (
            <BudgetAllocationBar overview={overview} />
          )} */}
        </div>
        <div>

          {overview.categories && overview.categories.length > 0 && (
            <BudgetAllocationBar overview={overview} />
          )}
        </div>

        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-3">
    <h2 className="text-[15px] md:text-[24px] font-semibold text-gray-800 m-0 font-sans">Spending Overview</h2>
    <div className="relative">
      <button
        onClick={() => setShowTimeframeMenu(!showTimeframeMenu)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-md cursor-pointer text-sm text-gray-700 font-sans"
      >
        {selectedTimeframe}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {showTimeframeMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowTimeframeMenu(false)}
          />
          <div className="absolute left-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[140px]">
            <button
              onClick={() => {
                setSelectedTimeframe("Weekly");
                setShowTimeframeMenu(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer font-sans ${
                selectedTimeframe === "Weekly"
                  ? "text-[#238D88] font-medium bg-[#f0f9f9]"
                  : "text-gray-700"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => {
                setSelectedTimeframe("Monthly");
                setShowTimeframeMenu(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer font-sans ${
                selectedTimeframe === "Monthly"
                  ? "text-[#238D88] font-medium bg-[#f0f9f9]"
                  : "text-gray-700"
              }`}
            >
              Monthly
            </button>
          </div>
        </>
      )}
    </div>
  </div>
  
  <div className="relative">
    <button
      onClick={() => setShowCategoryMenu(!showCategoryMenu)}
      className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-md cursor-pointer text-sm text-gray-700 font-sans"
    >
      {selectedCategory}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 9L12 15L18 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
    {showCategoryMenu && (
      <>
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowCategoryMenu(false)}
        />
        <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[180px] max-h-[300px] overflow-y-auto">
          {getAvailableCategories().map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setShowCategoryMenu(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer font-sans ${
                selectedCategory === category
                  ? "text-[#238D88] font-medium bg-[#f0f9f9]"
                  : "text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </>
    )}
  </div>
</div>

          <div className="h-80 relative">
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-center">
                  <div className="mb-3">
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                      <path d="M9 61L28.1464 41.8536C28.3417 41.6583 28.6583 41.6583 28.8536 41.8536L41.1464 54.1464C41.3417 54.3417 41.6583 54.3417 41.8536 54.1464L90 6" stroke="#232527" strokeWidth="6.5" strokeLinecap="round"/>
                      <line x1="14" y1="89" x2="14" y2="79" stroke="#232527" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="62" y1="89" x2="62" y2="53" stroke="#232527" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="50" y1="89" x2="50" y2="67" stroke="#232527" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="26" y1="89" x2="26" y2="64" stroke="#232527" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="38" y1="89" x2="38" y2="74" stroke="#232527" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="74" y1="89" x2="74" y2="41" stroke="#232527" strokeWidth="4" strokeLinecap="round"/>
                      <line x1="86" y1="89" x2="86" y2="29" stroke="#232527" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-[15px] md:text-xl font-semibold text-gray-800 mb-1 font-sans">
                    No data yet to show!
                  </div>
                  <div className="text-[12px] md:text-sm text-gray-500 font-sans">
                    Please add your details first
                  </div>
                </div>
              </div>
            )}
            <Bar data={getChartData()} options={chartOptions} />
          </div>

          {hasData && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs text-gray-600 font-sans">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#238D88]"></div>
                <span>At budget</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F39D08]"></div>
                <span>Over budget</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="rounded-[15px] mb-6 bg-white" style={{ minHeight: '647px' }}>
          <div className="p-4 md:p-8 h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-[15px] md:text-[24px] font-semibold text-gray-800 m-0 font-sans">Expense add and details</h2>
            </div>

            {expenses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 inline-flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100"
                      height="100"
                      viewBox="0 0 100 100"
                      fill="none"
                    >
                      <path
                        d="M8 28.9198V84.6954C8 88.0021 12.2886 89.8745 15.2999 87.8825L23.1019 82.7831C24.9269 81.5879 27.4819 81.7472 29.1244 83.1815L36.698 89.8347C38.4774 91.3884 41.3976 91.3884 43.177 89.8347L50.8419 83.1416C52.4388 81.7472 54.9938 81.5879 56.7731 82.7831L64.5751 87.8825C67.5864 89.8347 71.875 87.9622 71.875 84.6954V16.9679C71.875 12.5856 75.9812 9 81 9H30.8125H26.25C12.5625 9 8 16.1313 8 24.9359V28.9198Z"
                        stroke="#292D32"
                        strokeWidth="6.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M26 40H54"
                        stroke="#292D32"
                        strokeWidth="6.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M31 55H51"
                        stroke="#292D32"
                        strokeWidth="6.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M91.9723 22.2857V31.1429C91.9723 36.5851 90.4928 40 84.649 40H72V15.9233C72 12.1 76.7712 9 80.8766 9C84.908 9.03444 87.0902 8.73429 89.7531 11.2143C92.4161 13.7287 91.9723 18.4968 91.9723 22.2857Z"
                        stroke="#292D32"
                        strokeWidth="6.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-[15px] md:text-lg font-semibold text-gray-800 mb-2 font-sans">
                    No expenses recorded yet!
                  </div>
                  <div className="text-[12px] md:text-sm text-gray-500 font-sans">
                    Start by adding your first expense by using options below
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate("/dashboard/budget/add-manual")}
                    className="flex justify-center items-center min-w-[180px] h-[54px] gap-[10px] rounded-[15px] text-black font-sans text-[12px] md:text-[16px] font-[600] leading-[140%] cursor-pointer border-2 border-[#F39D08] px-6 transition-colors whitespace-nowrap"
                  >
                    Add manually
                  </button>
                  <button
                    onClick={() => setShowUploadReceipt(true)}
                    className="flex justify-center items-center min-w-[180px] h-[54px] gap-[10px] rounded-[15px] bg-[#F3BE08] text-black font-sans text-[12px] md:text-[16px] font-[600] leading-[140%] cursor-pointer border-none px-6 hover:bg-[#F39D08] transition-colors whitespace-nowrap"
                  >
                    Upload receipt
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                  <div className="relative w-full lg:min-w-[400px]">
                    <input
                      type="text"
                      placeholder="Search by description or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent bg-white font-sans"
                    />
                    <svg
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
                        title="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-row gap-3 w-full lg:w-auto justify-center">
                    <button
                      onClick={() => navigate("/dashboard/budget/add-manual")}
                      className="flex justify-center items-center min-w-[180px] h-[54px] gap-[10px] rounded-[15px] text-black font-sans text-[12px] md:text-[16px] font-[600] leading-[140%] cursor-pointer border-2 border-[#F39D08] px-6 transition-colors whitespace-nowrap"
                    >
                      Add manually
                    </button>
                    <button
                      onClick={() => setShowUploadReceipt(true)}
                      className="flex justify-center items-center min-w-[180px] h-[54px] gap-[10px] rounded-[15px] bg-[#F3BE08] text-black font-sans text-[12px] md:text-[16px] font-[600] leading-[140%] cursor-pointer border-none px-6 hover:bg-[#F39D08] transition-colors whitespace-nowrap"
                    >
                      Upload receipt
                    </button>
                  </div>
                </div>

                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 border-2 border-[#F39D08] rounded-lg inline-flex items-center justify-center mb-4">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F39D08"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                    </div>
                    <div className="text-[15px] md:text-lg font-semibold text-gray-800 mb-2 font-sans">
                      No matching expenses found
                    </div>
                    <div className="text-[12px] md:text-sm text-gray-500 font-sans">
                      Try adjusting your search query or{" "}
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-[#238D88] hover:text-[#1a6d69] underline bg-transparent border-none cursor-pointer p-0 font-medium"
                      >
                        clear the search
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block flex-1 overflow-hidden bg-white rounded-lg shadow-sm">
                      <div
                        className="flex flex-col h-full"
                        style={{ height: "calc(647px - 180px)" }}
                      >
                        {/* Fixed Header */}
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] min-w-[800px] bg-[rgba(35,141,136,0.15)] border-b-2 border-[#1a6d69] flex-shrink-0">
                          <div className="text-left py-4 px-4 text-[12px] md:text-[16px] font-semibold font-sans">
                            Date
                          </div>
                          <div className="text-left py-4 px-4 text-[12px] md:text-[16px] font-semibold font-sans">
                            Description
                          </div>
                          <div className="text-left py-4 px-4 text-[12px] md:text-[16px] font-semibold font-sans">
                            Category
                          </div>
                          <div className="text-center py-4 px-4 text-[12px] md:text-[16px] font-semibold font-sans">
                            Quantity
                          </div>
                          <div className="text-right py-4 px-4 text-[12px] md:text-[16px] font-semibold font-sans">
                            Amount
                          </div>
                          <div className="text-center py-4 px-4 text-[12px] md:text-[16px] font-semibold font-sans">
                            Action
                          </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto overflow-x-auto">
                          <div className="min-w-[800px]">
                            {filteredExpenses.map((expense, index) => (
                              <div
                                key={expense.id}
                                className={`grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] border-b ${
                                  index % 2 === 0 ? "bg-white" : "bg-white"
                                }`}
                              >
                                <div className="py-4 px-4 text-sm text-gray-800 font-medium font-sans">
                                  {formatDate(expense.date)}
                                </div>
                                <div className="py-4 px-4 text-sm text-gray-800 font-sans">
                                  {expense.merchantName}
                                </div>
                                <div className="py-4 px-4 text-sm text-gray-800 font-sans">
                                  {expense.category || "Other"}
                                </div>
                                <div className="py-4 px-4 text-sm text-gray-800 text-center font-sans">
                                  {expense.totalQuantity}
                                </div>
                                <div className="py-4 px-4 text-sm text-gray-900 text-right font-numbers">
                                  ${expense.totalAmount?.toFixed(2) || "0.00"}
                                </div>
                                <div className="py-4 px-4 text-center">
                                  <ThreeDotMenu
                                    expense={expense.items[0]}
                                    onEdit={() =>
                                      setEditingExpense(expense.items[0])
                                    }
                                    onDelete={() =>
                                      handleDeleteGroupedExpense(expense)
                                    }
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:hidden flex-1 overflow-hidden">
                      <div
                        className="overflow-y-auto"
                        style={{ maxHeight: "calc(647px - 180px)" }}
                      >
                        <div className="space-y-4">
                          {filteredExpenses.map((expense, index) => (
                            <div
                              key={expense.id}
                              className="rounded-lg shadow-sm p-4 border border-gray-200"
                            >
                              <div className="flex justify-between items-start text-sm text-gray-600 mb-3">
                                {formatDate(expense.date)}
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm text-gray-600 font-sans">
                                  <div className="text-sm font-semibold text-gray-800 font-sans"></div>
                                  <div className="text-black">
                                    {expense.merchantName}
                                  </div>
                                  <div>
                                    Category: {expense.category || "Other"}
                                  </div>
                                  <div>Quantity: {expense.totalQuantity}</div>
                                </div>

                                <div className="space-y-3 text-sm text-gray-800 font-sans text-right">
                                  <div className="font-semibold font-numbers">
                                    ${expense.totalAmount?.toFixed(2) || "0.00"}
                                  </div>
                                  <button
                                    onClick={() =>
                                      setEditingExpense(expense.items[0])
                                    }
                                    className="p-2 text-gray-600 rounded-lg transition-colors"
                                    title="Edit expense"
                                  >
                                    <svg
                                      width="17"
                                      height="17"
                                      viewBox="0 0 17 17"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <g clip-path="url(#clip0_3494_59327)">
                                        <path
                                          d="M10.6253 3.54177L13.4586 6.37511M14.9985 4.82527C15.373 4.45087 15.5835 3.94302 15.5835 3.41346C15.5836 2.8839 15.3733 2.37601 14.9989 2.0015C14.6245 1.627 14.1166 1.41657 13.5871 1.4165C13.0575 1.41644 12.5496 1.62674 12.1751 2.00115L2.7217 11.4567C2.55723 11.6207 2.43561 11.8226 2.36753 12.0446L1.43182 15.1273C1.41351 15.1885 1.41213 15.2536 1.42782 15.3156C1.44351 15.3776 1.47568 15.4341 1.52093 15.4793C1.56617 15.5245 1.6228 15.5566 1.68481 15.5722C1.74681 15.5877 1.81188 15.5863 1.87311 15.5679L4.95649 14.6329C5.17832 14.5654 5.38019 14.4445 5.5444 14.2808L14.9985 4.82527Z"
                                          stroke="black"
                                          stroke-width="2"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                        />
                                      </g>
                                      <defs>
                                        <clipPath id="clip0_3494_59327">
                                          <rect
                                            width="17"
                                            height="17"
                                            fill="white"
                                          />
                                        </clipPath>
                                      </defs>
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteGroupedExpense(expense)
                                    }
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete expense"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="17"
                                      height="17"
                                      viewBox="0 0 17 17"
                                      fill="none"
                                    >
                                      <path
                                        d="M13.4583 4.24984V14.1665C13.4583 14.5422 13.3091 14.9026 13.0434 15.1682C12.7777 15.4339 12.4174 15.5832 12.0417 15.5832H4.95833C4.58261 15.5832 4.22228 15.4339 3.9566 15.1682C3.69092 14.9026 3.54167 14.5422 3.54167 14.1665V4.24984M2.125 4.24984H14.875M5.66667 4.24984V2.83317C5.66667 2.45745 5.81592 2.09711 6.0816 1.83144C6.34728 1.56576 6.70761 1.4165 7.08333 1.4165H9.91667C10.2924 1.4165 10.6527 1.56576 10.9184 1.83144C11.1841 2.09711 11.3333 2.45745 11.3333 2.83317V4.24984"
                                        stroke="#FF7B7B"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {filteredExpenses.length > 5 && (
                      <div className="md:hidden flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {}}
                          disabled={true}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                          Previous
                        </button>

                        <button
                          onClick={() => {}}
                          disabled={false}
                          className="flex items-center gap-2 px-4 py-2 bg-[#238D88] text-white rounded-lg text-sm font-medium hover:bg-[#1a6d69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-white rounded-xl p-6">
          {!aiInsights ||
          (!aiInsights.immediateAlerts?.length &&
            !aiInsights.budgetAlerts?.length &&
            !aiInsights.predictiveAlerts?.length &&
            !aiInsights.smartShopping?.length) ? (
            <div className="flex flex-col items-center mb-4 gap-3">
              <div className="w-12 h-12 inline-flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <path
                    d="M47.3316 21.1934C48.4476 19.0215 51.5524 19.0215 52.6684 21.1934L63.1361 41.5665C63.4225 42.1239 63.8761 42.5775 64.4335 42.8639L84.8066 53.3316C86.9785 54.4476 86.9785 57.5524 84.8066 58.6684L64.4335 69.1361C63.8761 69.4225 63.4225 69.8761 63.1361 70.4335L52.6684 90.8066C51.5524 92.9785 48.4476 92.9785 47.3316 90.8066L36.8639 70.4335C36.5775 69.8761 36.1239 69.4225 35.5665 69.1361L15.1934 58.6684C13.0215 57.5524 13.0215 54.4476 15.1934 53.3316L35.5665 42.8639C36.1239 42.5775 36.5775 42.1239 36.8639 41.5665L47.3316 21.1934Z"
                    stroke="#232527"
                    strokeWidth="6.5"
                  />
                  <path
                    d="M76.1105 7.73114C76.4825 7.00715 77.5175 7.00715 77.8895 7.73114L81.605 14.9626C81.7004 15.1483 81.8517 15.2996 82.0374 15.395L89.2689 19.1105C89.9928 19.4825 89.9928 20.5175 89.2689 20.8895L82.0374 24.605C81.8517 24.7004 81.7004 24.8517 81.605 25.0374L77.8895 32.2689C77.5175 32.9928 76.4825 32.9928 76.1105 32.2689L72.395 25.0374C72.2996 24.8517 72.1483 24.7004 71.9626 24.605L64.7311 20.8895C64.0072 20.5175 64.0072 19.4825 64.7311 19.1105L71.9626 15.395C72.1483 15.2996 72.2996 15.1483 72.395 14.9626L76.1105 7.73114Z"
                    stroke="#232527"
                    strokeWidth="5"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[15px] md:text-[25px] m-0 font-sans text-center">
                AI Insights & Suggestions
              </h3>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 100 100" fill="none">
                    <path d="M47.3316 21.1934C48.4476 19.0215 51.5524 19.0215 52.6684 21.1934L63.1361 41.5665C63.4225 42.1239 63.8761 42.5775 64.4335 42.8639L84.8066 53.3316C86.9785 54.4476 86.9785 57.5524 84.8066 58.6684L64.4335 69.1361C63.8761 69.4225 63.4225 69.8761 63.1361 70.4335L52.6684 90.8066C51.5524 92.9785 48.4476 92.9785 47.3316 90.8066L36.8639 70.4335C36.5775 69.8761 36.1239 69.4225 35.5665 69.1361L15.1934 58.6684C13.0215 57.5524 13.0215 54.4476 15.1934 53.3316L35.5665 42.8639C36.1239 42.5775 36.5775 42.1239 36.8639 41.5665L47.3316 21.1934Z" stroke="#232527" strokeWidth="6.5"/>
                    <path d="M76.1105 7.73114C76.4825 7.00715 77.5175 7.00715 77.8895 7.73114L81.605 14.9626C81.7004 15.1483 81.8517 15.2996 82.0374 15.395L89.2689 19.1105C89.9928 19.4825 89.9928 20.5175 89.2689 20.8895L82.0374 24.605C81.8517 24.7004 81.7004 24.8517 81.605 25.0374L77.8895 32.2689C77.5175 32.9928 76.4825 32.9928 76.1105 32.2689L72.395 25.0374C72.2996 24.8517 72.1483 24.7004 71.9626 24.605L64.7311 20.8895C64.0072 20.5175 64.0072 19.4825 64.7311 19.1105L71.9626 15.395C72.1483 15.2996 72.2996 15.1483 72.395 14.9626L76.1105 7.73114Z" stroke="#232527" strokeWidth="5"/>
                  </svg>
                </div> */}
                <div className="flex flex-col gap-1">
                  <h3 className="text-[15px] md:text-[24px] font-semibold text-gray-800 m-0 font-sans">AI Insights & Suggestions</h3>
                  {insightsLoading && (
                    <span className="text-xs text-gray-500">
                      Analyzing your budget...
                    </span>
                  )}
                  {insightsLastFetched && !insightsLoading && (
                    <span className="text-xs text-gray-400">
                      Updated:{" "}
                      {new Date(insightsLastFetched).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleRefreshInsights}
                disabled={insightsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#238D88] text-white rounded-lg text-sm font-medium hover:bg-[#1a6d69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex-shrink-0"
                title="Refresh AI insights"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={insightsLoading ? "animate-spin" : ""}
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                {insightsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          )}

          {!aiInsights ||
          (!aiInsights.immediateAlerts?.length &&
            !aiInsights.budgetAlerts?.length &&
            !aiInsights.predictiveAlerts?.length &&
            !aiInsights.smartShopping?.length) ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-[12px] md:text-sm text-gray-400 m-0 leading-relaxed font-sans text-center">
                AI insights will appear here once you have budget and expense
                data. Add your budget and some expenses to get personalized
                recommendations.
              </p>
              {expenses.length > 0 && overview.total > 0 && (
                <button
                  onClick={handleRefreshInsights}
                  disabled={insightsLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-[#238D88] text-white rounded-lg text-sm font-medium hover:bg-[#1a6d69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={insightsLoading ? "animate-spin" : ""}
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  {insightsLoading
                    ? "Generating Insights..."
                    : "Generate AI Insights"}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Immediate Alerts */}
              {aiInsights.immediateAlerts?.length > 0 && (
                <div className="p-4 bg-[rgba(251,208,203,0.70)] border border-[#E90000] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-[24px] h-[24px] rounded-full bg-[rgba(255,20,20,0.24)] flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M6.21151 0.445065C6.50439 -0.111419 7.26968 -0.145958 7.62166 0.340898L7.68677 0.445065L13.8014 12.0629C14.0932 12.6178 13.6907 13.2842 13.0637 13.2843H0.834555C0.20755 13.2842 -0.194956 12.6178 0.0969246 12.0629L6.21151 0.445065ZM1.1106 12.2843H12.7877L6.94914 1.19181L1.1106 12.2843Z"
                          fill="#FF1B00"
                        />
                        <path
                          d="M6.44922 8.11751V4.78418C6.44922 4.50804 6.67308 4.28418 6.94922 4.28418C7.22536 4.28418 7.44922 4.50804 7.44922 4.78418V8.11751C7.44922 8.39366 7.22536 8.61751 6.94922 8.61751C6.67308 8.61751 6.44922 8.39366 6.44922 8.11751Z"
                          fill="#FF1B00"
                        />
                        <path
                          d="M7.33333 10.6667C7.33333 11.0349 7.03486 11.3333 6.66667 11.3333C6.29848 11.3333 6 11.0349 6 10.6667C6 10.2985 6.29848 10 6.66667 10C7.03486 10 7.33333 10.2985 7.33333 10.6667Z"
                          fill="#FF1B00"
                        />
                      </svg>
                    </div>
                    <h4 className="text-[14px] font-semibold text-gray-800 font-sans">
                      Immediate Alert
                    </h4>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1 font-sans">
                    {aiInsights.immediateAlerts[0].title}
                  </p>
                  <p className="text-sm text-gray-700 mb-2 font-sans">
                    {aiInsights.immediateAlerts[0].message}
                  </p>
                  <p className="text-xs text-gray-600 italic font-sans">
                    💡 {aiInsights.immediateAlerts[0].suggestion}
                  </p>
                </div>
              )}

              {/* Budget Alerts */}
              {aiInsights.budgetAlerts?.length > 0 && (
                <div className="p-4 bg-[rgba(243,190,8,0.13)] border border-[#F3BE08] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-[24px] h-[24px] rounded-full bg-[rgba(255,202,31,0.42)] flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M12.3333 6.66667C12.3333 3.53705 9.79628 1 6.66667 1C3.53705 1 1 3.53705 1 6.66667C1 9.79628 3.53705 12.3333 6.66667 12.3333V13.3333C2.98477 13.3333 0 10.3486 0 6.66667C0 2.98477 2.98477 0 6.66667 0C10.3486 0 13.3333 2.98477 13.3333 6.66667C13.3333 10.3486 10.3486 13.3333 6.66667 13.3333V12.3333C9.79628 12.3333 12.3333 9.79628 12.3333 6.66667Z"
                          fill="#FF9900"
                        />
                        <path
                          d="M6.16699 2.6665C6.16699 2.39036 6.39085 2.1665 6.66699 2.1665C6.94313 2.1665 7.16699 2.39036 7.16699 2.6665V6.45947L9.02051 8.31299C9.21577 8.50825 9.21577 8.82476 9.02051 9.02002C8.82525 9.21528 8.50874 9.21528 8.31348 9.02002L6.41113 7.11768C6.25486 6.96141 6.16701 6.74948 6.16699 6.52848V2.6665Z"
                          fill="#FF9900"
                        />
                      </svg>
                    </div>
                    <h4 className="text-[14px] font-semibold text-gray-800 font-sans">
                      Budget Alert
                    </h4>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1 font-sans">
                    {aiInsights.budgetAlerts[0].title}
                  </p>
                  <p className="text-sm text-gray-700 mb-2 font-sans">
                    {aiInsights.budgetAlerts[0].message}
                  </p>
                  <p className="text-xs text-gray-600 italic font-sans">
                    💡 {aiInsights.budgetAlerts[0].suggestion}
                  </p>
                </div>
              )}

              {/* Predictive Alerts */}
              {aiInsights.predictiveAlerts?.length > 0 && (
                <div className="p-4 bg-[rgba(12,198,142,0.17)] border border-[#0CC68E] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-[24px] h-[24px] rounded-full bg-[rgba(0,166,116,0.26)] flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                      >
                        <path
                          d="M2.08301 2.0835V13.1946C2.08301 13.563 2.22934 13.9162 2.4898 14.1767C2.75027 14.4372 3.10354 14.5835 3.4719 14.5835H14.583M13.1941 6.25016L9.7219 9.72238L6.94412 6.94461L4.86079 9.02794"
                          stroke="#238D88"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <h4 className="text-[14px] font-semibold text-gray-800 font-sans">
                      Predictive Alert
                    </h4>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1 font-sans">
                    {aiInsights.predictiveAlerts[0].title}
                  </p>
                  <p className="text-sm text-gray-700 mb-2 font-sans">
                    {aiInsights.predictiveAlerts[0].message}
                  </p>
                  <p className="text-xs text-gray-600 italic font-sans">
                    💡 {aiInsights.predictiveAlerts[0].suggestion}
                  </p>
                </div>
              )}

              {/* Smart Shopping */}
              {aiInsights.smartShopping?.length > 0 && (
                <div className="p-4 bg-[rgba(0,115,231,0.11)] border border-[#0073E7] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-[24px] h-[24px] rounded-full bg-[rgba(69,162,255,0.43)] flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <g clip-path="url(#clip0_3439_67626)">
                          <path
                            d="M1.36621 1.3667H2.69954L4.47288 9.6467C4.53793 9.94994 4.70666 10.221 4.95002 10.4133C5.19338 10.6055 5.49615 10.7069 5.80621 10.7H12.3262C12.6297 10.6995 12.9239 10.5956 13.1602 10.4053C13.3966 10.215 13.561 9.94972 13.6262 9.65336L14.7262 4.70003H3.41288M5.99954 14C5.99954 14.3682 5.70107 14.6667 5.33288 14.6667C4.96469 14.6667 4.66621 14.3682 4.66621 14C4.66621 13.6318 4.96469 13.3334 5.33288 13.3334C5.70107 13.3334 5.99954 13.6318 5.99954 14ZM13.3329 14C13.3329 14.3682 13.0344 14.6667 12.6662 14.6667C12.298 14.6667 11.9995 14.3682 11.9995 14C11.9995 13.6318 12.298 13.3334 12.6662 13.3334C13.0344 13.3334 13.3329 13.6318 13.3329 14Z"
                            stroke="#0080FF"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_3439_67626">
                            <rect width="16" height="16" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <h4 className="text-[14px] font-semibold text-gray-800 font-sans">
                      Smart Shopping
                    </h4>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1 font-sans">
                    {aiInsights.smartShopping[0].title}
                  </p>
                  <p className="text-sm text-gray-700 mb-2 font-sans">
                    {aiInsights.smartShopping[0].message}
                  </p>
                  <p className="text-xs text-gray-600 italic font-sans">
                    💡 {aiInsights.smartShopping[0].suggestion}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showBudgetSetup && (
        <BudgetSetup
          onClose={async () => {
            setShowBudgetSetup(false);
            await fetchBudgetOverview();
            setMonthlySpending([]);
            setTimeout(() => {
              calculateMonthlySpending();
            }, 100);
          }}
        />
      )}

      {showUploadReceipt && (
        <UploadReceipt
          onClose={() => {
            setShowUploadReceipt(false);
            fetchBudgetOverview();
            fetchExpenses();
          }}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={handleEditExpense}
        />
      )}
    </div>
  );
}

export default Budget;
