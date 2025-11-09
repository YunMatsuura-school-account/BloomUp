import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import BudgetSetup from "./BudgetSetup";
import UploadReceipt from "../pages/UploadReceipt";
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function EditExpenseModal({ expense, onClose, onSave }) {
  const [formData, setFormData] = useState({
    amount: expense.amount || 0,
    category: expense.category || 'Other',
    description: expense.merchantName || '',
    date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
    quantity: expense.quantity || 1
  });

  const categories = ['Medical', 'Education', 'Consumable', 'Clothes', 'Entertainment', 'Transport', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 font-sans">Edit Expense</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238D88] font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238D88] font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238D88] font-sans"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#238D88] font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
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
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
const [showUploadReceipt, setShowUploadReceipt] = useState(false);
const [aiInsights, setAiInsights] = useState(() => {
  // Load from localStorage on component mount
  const saved = localStorage.getItem('aiInsights');
  return saved ? JSON.parse(saved) : null;
});
const [insightsLoading, setInsightsLoading] = useState(false);
const [insightsLastFetched, setInsightsLastFetched] = useState(() => {
  // Load timestamp from localStorage
  const saved = localStorage.getItem('aiInsightsTimestamp');
  return saved ? parseInt(saved) : null;
});
const [editingExpense, setEditingExpense] = useState(null); 
  const navigate = useNavigate();
  const API_URL = "http://localhost:8888/api/budget";

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

      // Fetch all expenses for the entire current year
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
        
        // Log expense distribution by month
        const byMonth = {};
        data.forEach(exp => {
          const date = new Date(exp.date);
          const month = date.getUTCMonth() + 1;
          byMonth[month] = (byMonth[month] || 0) + 1;
        });
        console.log('Expenses by month:', byMonth);
        
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
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      const timestamp = Date.now();
      
      // Save to state
      setAiInsights(data.insights);
      setInsightsLastFetched(timestamp);
      
      // Save to localStorage so it persists across navigation
      localStorage.setItem('aiInsights', JSON.stringify(data.insights));
      localStorage.setItem('aiInsightsTimestamp', timestamp.toString());
      
      console.log(' AI Insights fetched and saved');
    }
  } catch (err) {
    console.error("Error fetching AI insights:", err);
  } finally {
    setInsightsLoading(false);
  }
};
 const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

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
        // Update local state
        setExpenses(expenses.filter(exp => exp._id !== expenseId));
        
        // Update overview if budgetOverview is returned
        if (data.budgetOverview) {
          setOverview(prev => ({
            ...prev,
            spent: data.budgetOverview.spent,
            remaining: data.budgetOverview.remaining,
            status: data.budgetOverview.status
          }));
        }
        
        alert('Expense deleted successfully');
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleEditExpense = async (formData) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/expenses/${editingExpense._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local expenses
        setExpenses(expenses.map(exp => 
          exp._id === editingExpense._id ? data.expense : exp
        ));
        
        // Update overview if budgetOverview is returned
        if (data.budgetOverview) {
          setOverview(prev => ({
            ...prev,
            spent: data.budgetOverview.spent,
            remaining: data.budgetOverview.remaining,
            status: data.budgetOverview.status
          }));
        }
        
        setEditingExpense(null);
        alert('Expense updated successfully');
      } else {
        throw new Error('Failed to update expense');
      }
    } catch (err) {
      console.error("Error updating expense:", err);
      alert('Failed to update expense. Please try again.');
    }
  };
const handleRefreshInsights = () => {
  if (window.confirm(' Refreshing AI insights will make an API call that costs money. Continue?')) {
    fetchAIInsights();
  }
};

  useEffect(() => {
    fetchBudgetOverview();
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      calculateMonthlySpending();
    } else {
      setMonthlySpending(Array(12).fill(0).map((_, index) => ({
        month: index,
        spent: 0,
        withinBudget: 0,
        overBudget: 0,
        monthlyBudget: overview.total || 0
      })));
    }
  }, [expenses, overview.total, overview.categories, selectedCategory, selectedTimeframe]);

  // useEffect(() => {
  //   if (expenses.length > 0 && overview.total > 0) {
  //     fetchAIInsights();
  //   }
  // }, [expenses, overview]);

  useEffect(() => {
  // Only fetch if:
  // 1. We have expenses and budget
  // 2. We don't have cached insights
  // 3. We're not already loading
  if (expenses.length > 0 && overview.total > 0 && !aiInsights && !insightsLoading) {
    console.log('First time loading AI insights...');
    fetchAIInsights();
  }
}, []);

  const calculateMonthlySpending = () => {
    if (selectedTimeframe === "Weekly") {
      calculateWeeklySpending();
    } else {
      calculateMonthlySpendingData();
    }
  };

  const calculateMonthlySpendingData = () => {
    const currentYear = new Date().getFullYear();
    
    let monthlyBudget = overview.total || 0;
    if (
      selectedCategory !== "All" &&
      overview.categories &&
      overview.categories.length > 0
    ) {
      const categoryData = overview.categories.find(
        (cat) => cat.name === selectedCategory
      );
      monthlyBudget = categoryData ? categoryData.allocated || 0 : 0;
    }
    
    const months = Array(12).fill(0);
    
    const filteredExpenses = selectedCategory === 'All' 
      ? expenses 
      : expenses.filter(exp => exp.category === selectedCategory);
    
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getUTCFullYear();
      
      if (expenseYear === currentYear) {
        const monthIndex = expenseDate.getUTCMonth();
        months[monthIndex] += expense.amount || 0;
      }
    });
    
    const monthlyData = months.map((spent, index) => {
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
    
    const filteredExpenses = selectedCategory === 'All' 
      ? expenses 
      : expenses.filter(exp => exp.category === selectedCategory);
    
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      
      if (expenseDate.getUTCFullYear() === currentYear && expenseDate.getUTCMonth() === currentMonth) {
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
  if (selectedTimeframe === 'Weekly') {
    const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    if (monthlySpending.length === 0) {
      return {
        labels: weekLabels,
        datasets: [
          {
            label: 'At Budget',
            data: Array(4).fill(0),
            backgroundColor: '#238D88',
            borderRadius: 0,
            borderSkipped: false,
          },
          {
            label: 'Below Budget',
            data: Array(4).fill(0),
            backgroundColor: '#F3BE08',
            borderRadius: { topLeft: 8, topRight: 8 },
            borderSkipped: false,
          },
          {
            label: 'Over Budget',
            data: Array(4).fill(0),
            backgroundColor: '#F39D08',
            borderRadius: { topLeft: 8, topRight: 8 },
            borderSkipped: false,
          },
        ],
      };
    }

    // ✅ CALCULATE DATA FOR WEEKLY
    const atBudgetData = [];
    const belowBudgetData = [];
    const overBudgetData = [];

    monthlySpending.forEach(w => {
      const budget = w.weeklyBudget || 0;
      const spent = w.spent || 0;
      
      if (budget === 0) {
        atBudgetData.push(0);
        belowBudgetData.push(spent);
        overBudgetData.push(0);
      } else if (spent < budget) {
        // Below budget (0-999): Yellow only
        atBudgetData.push(0);
        belowBudgetData.push(spent);
        overBudgetData.push(0);
      } else if (spent === budget) {
        // Exactly at budget (1000): Green only
        atBudgetData.push(spent);
        belowBudgetData.push(0);
        overBudgetData.push(0);
      } else {
        // Over budget (1000+): Green (budget amount) + Orange (excess)
        atBudgetData.push(budget);
        belowBudgetData.push(0);
        overBudgetData.push(spent - budget);
      }
    });

    return {
      labels: weekLabels,
      datasets: [
        {
          label: 'At Budget',
          data: atBudgetData,
          backgroundColor: '#238D88',
          borderRadius: 0,
          borderSkipped: false,
        },
        {
          label: 'Below Budget',
          data: belowBudgetData,
          backgroundColor: '#F3BE08',
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false,
        },
        {
          label: "Over Budget",
          data: overBudgetData,
          backgroundColor: '#F39D08',
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false,
        },
      ],
    };
  }
  
  // MONTHLY VIEW
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (monthlySpending.length === 0) {
    return {
      labels: monthNames,
      datasets: [
        {
          label: 'At Budget',
          data: Array(12).fill(0),
          backgroundColor: '#238D88',
          borderRadius: 0,
          borderSkipped: false,
        },
        {
          label: 'Below Budget',
          data: Array(12).fill(0),
          backgroundColor: '#F3BE08',
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false,
        },
        {
          label: 'Over Budget',
          data: Array(12).fill(0),
          backgroundColor: '#F39D08',
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false,
        }
      ]
    };
  }

  // ✅ CALCULATE DATA FOR MONTHLY
  const atBudgetData = [];
  const belowBudgetData = [];
  const overBudgetData = [];

  monthlySpending.forEach(m => {
    const budget = m.monthlyBudget || 0;
    const spent = m.spent || 0;
    
    if (budget === 0) {
      atBudgetData.push(0);
      belowBudgetData.push(spent);
      overBudgetData.push(0);
    } else if (spent < budget) {
      // Below budget (0-999): Yellow only
      atBudgetData.push(0);
      belowBudgetData.push(spent);
      overBudgetData.push(0);
    } else if (spent === budget) {
      // Exactly at budget (1000): Green only
      atBudgetData.push(spent);
      belowBudgetData.push(0);
      overBudgetData.push(0);
    } else {
      // Over budget (1000+): Green (budget amount) + Orange (excess)
      atBudgetData.push(budget);
      belowBudgetData.push(0);
      overBudgetData.push(spent - budget);
    }
  });

  return {
    labels: monthNames,
    datasets: [
      {
        label: 'At Budget',
        data: atBudgetData,
        backgroundColor: '#238D88',
        borderRadius: 0,
        borderSkipped: false,
      },
      {
        label: 'Below Budget',
        data: belowBudgetData,
        backgroundColor: '#F3BE08',
        borderRadius: { topLeft: 8, topRight: 8 },
        borderSkipped: false,
      },
      {
        label: 'Over Budget',
        data: overBudgetData,
        backgroundColor: '#F39D08',
        borderRadius: { topLeft: 8, topRight: 8 },
        borderSkipped: false,
      }
    ]
  };
};

  const getAvailableCategories = () => {
    const categories = ['All'];
    
    if (overview.categories && overview.categories.length > 0) {
      overview.categories.forEach((cat) => {
        if (cat.name && !categories.includes(cat.name)) {
          categories.push(cat.name);
        }
      });
    } else {
      categories.push('Medical', 'Education', 'Consumable', 'Clothes', 'Entertainment', 'Transport', 'Other');
    }

    return categories;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        
         display: false,
        
      },
      title: { display: false },
      tooltip: {
        backgroundColor: '#238D88',
        padding: 12,
        titleFont: { size: 13, weight: 'bold', family: 'DM Sans, system-ui, sans-serif' },
        bodyFont: { size: 12, family: 'DM Sans, system-ui, sans-serif' },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            label += '$' + context.parsed.y.toFixed(2);
            return label;
          },
          afterBody: function(context) {
            const idx = context[0].dataIndex;
            if (monthlySpending && monthlySpending[idx]) {
              const data = monthlySpending[idx];
              return [
                `Total Spent: $${data.spent.toFixed(2)}`,
                `Budget: $${data.monthlyBudget || data.weeklyBudget || 0}`
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
          font: { size: 11, family: 'DM Sans, system-ui, sans-serif' },
          color: '#737373'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        suggestedMax: function(context) {
          const maxValue = Math.max(...context.chart.data.datasets.flatMap(d => d.data));
          const roundedMax = Math.ceil(maxValue / 2000) * 2000;
          return Math.max(roundedMax, 2000);
        },
        ticks: {
          font: { size: 11, family: 'Urbanist, DM Sans, system-ui, sans-serif' },
          color: '#737373',
          stepSize: 2000,
          callback: function(value) {
            return value === 0 ? '0' : value.toLocaleString();
          }
        }
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredExpenses = expenses.filter(expense => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const description = (expense.merchantName || '').toLowerCase();
    const category = (expense.category || '').toLowerCase();
    
    return description.includes(query) || category.includes(query);
  });

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600 font-sans">Loading budget...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl max-w-md text-center">
          <div className="text-lg text-red-600 mb-4 font-sans font-semibold">Error loading budget</div>
          <div className="text-sm text-gray-600 mb-4 font-sans">{error}</div>
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
    <div className="bg-[#E2E2E2] min-h-screen font-sans">
    

      <div className="p-5">
        {/* Consolidated Budget Overview Section */}
        <div className="bg-[#FAFAFA] rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 m-0 font-sans">Budget Overview</h2>
            <button 
              onClick={() => setShowBudgetSetup(true)} 
              className="flex justify-center items-center gap-[10px] rounded-[15px] bg-[#238D88] text-white text-[16px] font-[600] leading-[140%] font-sans px-6 py-3 cursor-pointer border-none whitespace-nowrap hover:bg-[#1a6d69] transition-colors"
            >
              Budget Setup
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-5 text-center">
              <div className="text-sm text-gray-600 mb-2 font-sans font-medium">Total Budget</div>
              <div className="text-2xl font-semibold text-gray-800 font-numbers">${overview.total?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="bg-white rounded-lg p-5 text-center">
              <div className="text-sm mb-2 font-sans font-medium text-[#F39D08]">Budget Spent</div>
              <div className="text-2xl font-semibold text-[#F39D08] font-numbers">${overview.spent?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="bg-white rounded-lg p-5 text-center">
              <div className="text-sm mb-2 font-sans font-medium text-[#238D88]">Remaining</div>
              <div className="text-2xl font-semibold text-[#238D88] font-numbers">${overview.remaining?.toFixed(2) || "0.00"}</div>
              {overview.total > 0 && (
                <div className="text-xs mt-2 font-sans font-medium text-[#238D88]">{overview.status}</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#FAFAFA] rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-gray-800 m-0 font-sans">Spending Overview</h2>
              <div className="relative">
                <button onClick={() => setShowTimeframeMenu(!showTimeframeMenu)} className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-md cursor-pointer text-sm text-gray-700 font-sans">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {showTimeframeMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowTimeframeMenu(false)} />
                    <div className="absolute left-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[140px]">
                      <button onClick={() => { setSelectedTimeframe('Weekly'); setShowTimeframeMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer font-sans ${selectedTimeframe === 'Weekly' ? 'text-[#238D88] font-medium bg-[#f0f9f9]' : 'text-gray-700'}`}>Weekly</button>
                      <button onClick={() => { setSelectedTimeframe('Monthly'); setShowTimeframeMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer font-sans ${selectedTimeframe === 'Monthly' ? 'text-[#238D88] font-medium bg-[#f0f9f9]' : 'text-gray-700'}`}>Monthly</button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setShowCategoryMenu(!showCategoryMenu)} className="bg-transparent border-none cursor-pointer text-gray-600 hover:text-gray-800 p-2">⋮</button>
              {showCategoryMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryMenu(false)} />
                  <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[180px] max-h-[300px] overflow-y-auto">
                    {getAvailableCategories().map((category) => (
                      <button key={category} onClick={() => { setSelectedCategory(category); setShowCategoryMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer font-sans ${selectedCategory === category ? 'text-[#238D88] font-medium bg-[#f0f9f9]' : 'text-gray-700'}`}>{category}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-80">
            <Bar data={getChartData()} options={chartOptions} />
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs text-gray-600 font-sans">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F3BE08]"></div>
              <span>Below budget</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#238D88]"></div>
              <span>At budget</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F39D08]"></div>
              <span>Over budget</span>
            </div>
          </div>
        </div>
        
       <div className="rounded-[15px] mb-6 bg-[#FAFAFA]" style={{ minHeight: '647px' }}>
  <div className="p-4 md:p-8 h-full flex flex-col">
    {/* Two-column layout */}
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
      {/* Left column - Title only */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-800 m-0 font-sans">Expense add and details</h2>
      </div>
      
      {/* Right column - Search and buttons */}
      <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
        {/* Search Bar */}
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
              onClick={() => setSearchQuery('')}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Buttons - Right aligned */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto justify-end">
          <button 
            onClick={() => navigate("/dashboard/budget/add-manual")} 
            className="flex justify-center items-center min-w-[180px] h-[54px] gap-[10px] rounded-[15px] bg-[#F3BE08] text-black font-sans text-[16px] font-[600] leading-[140%] cursor-pointer border-none px-6 hover:bg-[#F39D08] transition-colors whitespace-nowrap"
          >
            Add manually
          </button>
          <button 
            onClick={() => setShowUploadReceipt(true)} 
            className="flex justify-center items-center min-w-[180px] h-[54px] gap-[10px] rounded-[15px] bg-[#F3BE08] text-black font-sans text-[16px] font-[600] leading-[140%] cursor-pointer border-none px-6 hover:bg-[#F39D08] transition-colors whitespace-nowrap"
          >
            Upload receipt
          </button>
        </div>
      </div>
    </div>

    {/* Empty State or Content */}
    {expenses.length === 0 ? (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-2 border-gray-800 rounded-lg inline-flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M15 3v18" />
          </svg>
        </div>
        <div className="text-lg font-semibold text-gray-800 mb-2 font-sans">No expenses recorded yet!</div>
        <div className="text-sm text-gray-500 font-sans">Start by adding your first expense by using options above</div>
      </div>
    ) : filteredExpenses.length === 0 ? (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-2 border-[#F39D08] rounded-lg inline-flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F39D08" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <div className="text-lg font-semibold text-gray-800 mb-2 font-sans">No matching expenses found</div>
        <div className="text-sm text-gray-500 font-sans">Try adjusting your search query or <button onClick={() => setSearchQuery('')} className="text-[#238D88] hover:text-[#1a6d69] underline bg-transparent border-none cursor-pointer p-0 font-medium">clear the search</button></div>
      </div>
    ) : (
      <>
        {/* Desktop Table View (hidden on mobile) */}
        <div className="hidden md:block flex-1 overflow-hidden bg-white rounded-lg shadow-sm">
          <div className="overflow-y-auto overflow-x-auto" style={{ maxHeight: 'calc(647px - 180px)' }}>
            <table className="w-full min-w-[800px]">
              <thead className="sticky top-0 bg-[#238D88] z-10">
                <tr className="border-b-2 border-[#1a6d69]">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-white font-sans">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-white font-sans">Description</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-white font-sans">Category</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-white font-sans">Quantity</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-white font-sans">Amount</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-white font-sans">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense, index) => (
                  <tr 
                    key={expense._id} 
                    className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="py-4 px-4 text-sm text-gray-800 font-medium font-sans">{formatDate(expense.date)}</td>
                    <td className="py-4 px-4 text-sm text-gray-800 font-sans">{expense.merchantName || '-'}</td>
                    <td className="py-4 px-4 text-sm text-gray-800 font-sans">
                      <span className="px-4 py-4 text-sm text-gray-800 font-sans">
                        {expense.category || 'Other'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800 text-center font-sans">{expense.quantity || '-'}</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right font-numbers">${expense.amount?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 px-4 text-center">
                      <ThreeDotMenu
                        expense={expense}
                        onEdit={() => setEditingExpense(expense)}
                        onDelete={() => handleDeleteExpense(expense._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View (shown on mobile) */}
        <div className="md:hidden flex-1 overflow-hidden">
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(647px - 180px)' }}>
            <div className="space-y-4">
              {filteredExpenses.map((expense, index) => (
                <div key={expense._id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  {/* Header with Date and Three Dot Menu */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm font-semibold text-gray-800 font-sans">
                      {formatDate(expense.date)}
                    </div>
                    <ThreeDotMenu
                      expense={expense}
                      onEdit={() => setEditingExpense(expense)}
                      onDelete={() => handleDeleteExpense(expense._id)}
                    />
                  </div>

                  {/* Two-column layout for expense details */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Left Column - Labels */}
                    <div className="space-y-3 text-sm text-gray-600 font-sans">
                      <div>Description:</div>
                      <div>Category:</div>
                      <div>Quantity:</div>
                      <div>Amount:</div>
                    </div>

                    {/* Right Column - Values */}
                    <div className="space-y-3text-sm text-gray-800 font-sans text-right">
                      <div className="font-medium">{expense.merchantName || '-'}</div>
                      <div>
                        <span>
                          {expense.category || 'Other'}
                        </span>
                      </div>
                      <div>{expense.quantity || '-'}</div>
                      <div className="font-semibold font-numbers">${expense.amount?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>

                  {/* Dotted divider (except for last item) */}
                  {index < filteredExpenses.length - 1 && (
                    <div className="mt-4 border-t border-dashed border-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Controls - Show after 5 rows */}
        {filteredExpenses.length > 5 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {/* Add previous page logic */}}
              disabled={true} // Add proper disabled logic based on current page
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Previous
            </button>
            
            <div className="text-sm text-gray-600 font-sans">
              Page 1 of {Math.ceil(filteredExpenses.length / 5)} {/* Adjust based on your pagination */}
            </div>
            
            <button
              onClick={() => {/* Add next page logic */}}
              disabled={false} // Add proper disabled logic based on current page
              className="flex items-center gap-2 px-4 py-2 bg-[#238D88] text-white rounded-lg text-sm font-medium hover:bg-[#1a6d69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </>
    )}
  </div>
</div>    
        {/* AI Insights Section */}
        <div className="bg-[#FAFAFA] rounded-xl p-6">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
    <div className="flex items-center gap-2 flex-wrap">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#238D88" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <h3 className="text-base font-semibold text-gray-800 m-0 font-sans">AI Insights & Suggestions</h3>
      {insightsLoading && (
        <span className="text-xs text-gray-500">Analyzing your budget...</span>
      )}
      {insightsLastFetched && !insightsLoading && (
        <span className="text-xs text-gray-400">
          Updated: {new Date(insightsLastFetched).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit' 
          })}
        </span>
      )}
    </div>
    
    {/*  REFRESH BUTTON - Shows when insights exist or on initial load */}
    {(aiInsights || (expenses.length > 0 && overview.total > 0)) && (
      <button
        onClick={handleRefreshInsights}
        disabled={insightsLoading}
        className="flex items-center gap-2 px-4 py-2 bg-[#238D88] text-white rounded-lg text-sm font-medium hover:bg-[#1a6d69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        title="Refresh AI insights (costs money)"
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
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        {insightsLoading ? 'Refreshing...' : aiInsights ? 'Refresh Insights' : 'Get AI Insights'}
      </button>
    )}
  </div>
          
          {!aiInsights || (!aiInsights.immediateAlerts?.length && !aiInsights.budgetAlerts?.length && 
            !aiInsights.predictiveAlerts?.length && !aiInsights.smartShopping?.length) ? (
            <p className="text-sm text-gray-400 m-0 leading-relaxed font-sans">
              AI insights will appear here once you have budget and expense data. Add your budget and some expenses to get personalized recommendations.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Immediate Alerts */}
              {aiInsights.immediateAlerts?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-lg">⚠️</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 font-sans">Immediate Alerts</h4>
                  </div>
                  {aiInsights.immediateAlerts.map((alert, idx) => (
                    <div key={idx} className="ml-10 p-4 bg-white  border border-gray-300 rounded-lg">
                      <p className="text-sm font-semibold text-gray-800 mb-1 font-sans">{alert.title}</p>
                      <p className="text-sm text-gray-700 mb-2 font-sans">{alert.message}</p>
                      <p className="text-xs text-gray-600 italic font-sans">💡 {alert.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Budget Alerts */}
              {aiInsights.budgetAlerts?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-lg">⚠️</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 font-sans">Budget Alerts</h4>
                  </div>
                  {aiInsights.budgetAlerts.map((alert, idx) => (
                    <div key={idx} className="ml-10 p-4 bg-white  border border-gray-300 rounded-lg">
                      <p className="text-sm font-semibold text-gray-800 mb-1 font-sans">{alert.title}</p>
                      <p className="text-sm text-gray-700 mb-2 font-sans">{alert.message}</p>
                      <p className="text-xs text-gray-600 italic font-sans">💡 {alert.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Predictive Alerts */}
              {aiInsights.predictiveAlerts?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 font-sans">Predictive Alerts</h4>
                  </div>
                  {aiInsights.predictiveAlerts.map((alert, idx) => (
                    <div key={idx} className="ml-10 p-4 bg-white  border border-gray-300 rounded-lg ">
                      <p className="text-sm font-semibold text-gray-800 mb-1 font-sans">{alert.title}</p>
                      <p className="text-sm text-gray-700 mb-2 font-sans">{alert.message}</p>
                      <p className="text-xs text-gray-600 italic font-sans">💡 {alert.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Smart Shopping */}
              {aiInsights.smartShopping?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-lg">🛒</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 font-sans">Smart Shopping</h4>
                  </div>
                  {aiInsights.smartShopping.map((tip, idx) => (
                    <div key={idx} className="ml-10 p-4 bg-white  border border-gray-300 rounded-lg ">
                      <p className="text-sm font-semibold text-gray-800 mb-1 font-sans">{tip.title}</p>
                      <p className="text-sm text-gray-700 mb-2 font-sans">{tip.message}</p>
                      <p className="text-xs text-gray-600 italic font-sans">💡 {tip.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
       {/* Budget Setup Overlay */}
      {showBudgetSetup && (
        <BudgetSetup 
          onClose={() => {
            setShowBudgetSetup(false);
            fetchBudgetOverview();
          }} 
        />
      )}
       {/* Upload Receipt Overlay */}
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