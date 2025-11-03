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
const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

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
        setAiInsights(data.insights);
      }
    } catch (err) {
      console.error("Error fetching AI insights:", err);
    } finally {
      setInsightsLoading(false);
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

  useEffect(() => {
    if (expenses.length > 0 && overview.total > 0) {
      fetchAIInsights();
    }
  }, [expenses, overview]);

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
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="bg-gray-200 px-5 py-4 flex items-center justify-between border-b border-gray-300">
        <h1 className="text-lg font-semibold m-0 text-gray-800 font-sans">Budget overview</h1>
        <div className="flex gap-3 items-center">
          <button onClick={() => navigate("/dashboard")} className="bg-transparent border-none cursor-pointer p-1 text-xl text-gray-600 hover:text-gray-800">🏠</button>
          <button className="bg-transparent border-none cursor-pointer p-1 text-xl text-gray-600 hover:text-gray-800">⚙️</button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-end mb-4">
<button onClick={() => setShowBudgetSetup(true)} className="flex justify-center items-center gap-[10px] flex-shrink-0 rounded-[15px] bg-[#238D88] text-white text-[20px] font-[600] leading-[140%] font-sans px-8 py-[15px] cursor-pointer border-none whitespace-nowrap hover:bg-[#1a6d69] transition-colors">
  Budget setup
</button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 flex-1 shadow-sm">
            <div className="text-sm text-center text-gray-600 mb-2 font-sans font-medium">Total</div>
            <div className="text-2xl text-center font-semibold text-gray-800 font-numbers">${overview.total?.toFixed(2) || "0.00"}</div>
          </div>
          <div className="bg-white rounded-xl p-5 flex-1 shadow-sm">
            <div className="text-sm text-center mb-2 font-sans font-medium text-[#F39D08]">Budget Spent</div>
            <div className="text-2xl text-center font-semibold text-[#F39D08] font-numbers">${overview.spent?.toFixed(2) || "0.00"}</div>
          </div>
          <div className="bg-white rounded-xl p-5 flex-1 shadow-sm">
            <div className="text-sm text-center mb-2 font-sans font-medium text-[#238D88]">Remaining</div>
            <div className="text-2xl text-center font-semibold text-[#238D88] font-numbers">${overview.remaining?.toFixed(2) || "0.00"}</div>
            {overview.total > 0 && (
              <div className="text-xs text-center mt-2 font-sans font-medium text-[#238D88]">{overview.status}</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
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
            className="flex justify-center items-center min-w-[180px] h-[54px] gap-[10px] rounded-[15px] bg-[#238D88] text-white font-sans text-[16px] font-[600] leading-[140%] cursor-pointer border-none px-6 hover:bg-[#1a6d69] transition-colors whitespace-nowrap"
          >
            Add manually
          </button>
          <button 
            onClick={() => setShowUploadReceipt(true)} 
            className="flex justify-center items-center min-w-[180px] h-[54px] gap-[10px] rounded-[15px] bg-[#238D88] text-white font-sans text-[16px] font-[600] leading-[140%] cursor-pointer border-none px-6 hover:bg-[#1a6d69] transition-colors whitespace-nowrap"
          >
            Upload receipt
          </button>
        </div>
      </div>
    </div>

            {/* Empty State or Table */}
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
              <div className="flex-1 overflow-hidden bg-white rounded-lg shadow-sm">
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
                  className={`border-b  'bg-white' }`}
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
                    <button 
                      className="text-gray-500 hover:text-[#238D88] cursor-pointer bg-transparent border-none text-lg transition-colors p-2 rounded hover:bg-gray-100" 
                      onClick={() => console.log('Edit expense:', expense._id)}
                      title="Edit expense"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    )}
  </div>
</div>    
        {/* AI Insights Section */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#238D88" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h3 className="text-base font-semibold text-gray-800 m-0 font-sans">AI Insights & Suggestions</h3>
            {insightsLoading && (
              <span className="text-xs text-gray-500 ml-2">Loading insights...</span>
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
    </div>
  );
}

export default Budget;
