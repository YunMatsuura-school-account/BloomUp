import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Budget() {
  const [overview, setOverview] = useState({
    total: 0,
    spent: 0,
    remaining: 0,
    categories: []
  });
  const [expenses, setExpenses] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Monthly');
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const navigate = useNavigate();
  const API_URL = "http://localhost:8888/api/budget";

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  useEffect(() => {
    fetchBudgetOverview();
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      calculateMonthlySpending();
    } else {
      // Set empty data if no expenses
      setMonthlySpending(Array(12).fill(0).map((_, index) => ({
        month: index,
        spent: 0,
        withinBudget: 0,
        overBudget: 0,
        monthlyBudget: overview.total || 0
      })));
    }
  }, [expenses, overview.total, overview.categories, selectedCategory, selectedTimeframe]);

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
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
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

      const response = await fetch(`${API_URL}/expenses`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  // Calculate monthly spending for the current year
  const calculateMonthlySpending = () => {
    if (selectedTimeframe === 'Weekly') {
      calculateWeeklySpending();
    } else {
      calculateMonthlySpendingData();
    }
  };

  const calculateMonthlySpendingData = () => {
    const currentYear = new Date().getFullYear();
    
    // Get allocated budget for selected category or total budget for 'All'
    let monthlyBudget = overview.total || 0;
    if (selectedCategory !== 'All' && overview.categories && overview.categories.length > 0) {
      const categoryData = overview.categories.find(cat => cat.name === selectedCategory);
      monthlyBudget = categoryData ? (categoryData.allocated || 0) : 0;
    }
    
    // Initialize 12 months with 0 spending
    const months = Array(12).fill(0);
    
    // Filter expenses by category if not 'All'
    const filteredExpenses = selectedCategory === 'All' 
      ? expenses 
      : expenses.filter(exp => exp.category === selectedCategory);
    
    // Sum up expenses by month
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      
      if (expenseYear === currentYear) {
        const monthIndex = expenseDate.getMonth();
        months[monthIndex] += expense.amount || 0;
      }
    });
    
    // Create monthly data with budget comparison
    const monthlyData = months.map((spent, index) => {
      const withinBudget = monthlyBudget > 0 ? Math.min(spent, monthlyBudget) : spent;
      const overBudget = monthlyBudget > 0 ? Math.max(0, spent - monthlyBudget) : 0;
      
      return {
        month: index,
        spent,
        withinBudget,
        overBudget,
        monthlyBudget
      };
    });
    
    setMonthlySpending(monthlyData);
  };

  const calculateWeeklySpending = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Get allocated budget for selected category or total budget for 'All'
    let totalBudget = overview.total || 0;
    if (selectedCategory !== 'All' && overview.categories && overview.categories.length > 0) {
      const categoryData = overview.categories.find(cat => cat.name === selectedCategory);
      totalBudget = categoryData ? (categoryData.allocated || 0) : 0;
    }
    
    // Weekly budget (divide monthly budget by ~4 weeks)
    const weeklyBudget = totalBudget / 4;
    
    // Initialize 4 weeks with 0 spending
    const weeks = Array(4).fill(0);
    
    // Filter expenses by category if not 'All'
    const filteredExpenses = selectedCategory === 'All' 
      ? expenses 
      : expenses.filter(exp => exp.category === selectedCategory);
    
    // Sum up expenses by week for current month
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      
      if (expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth) {
        const dayOfMonth = expenseDate.getDate();
        const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3); // 0-3 weeks
        weeks[weekIndex] += expense.amount || 0;
      }
    });
    
    // Create weekly data with budget comparison
    const weeklyData = weeks.map((spent, index) => {
      const withinBudget = weeklyBudget > 0 ? Math.min(spent, weeklyBudget) : spent;
      const overBudget = weeklyBudget > 0 ? Math.max(0, spent - weeklyBudget) : 0;
      
      return {
        week: index,
        spent,
        withinBudget,
        overBudget,
        weeklyBudget
      };
    });
    
    setMonthlySpending(weeklyData);
  };

  // Prepare Chart Data for monthly spending
  const getChartData = () => {
    if (selectedTimeframe === 'Weekly') {
      const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      
      if (monthlySpending.length === 0) {
        return {
          labels: weekLabels,
          datasets: [
            {
              label: 'Within Budget',
              data: Array(4).fill(0),
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: 'Over Budget',
              data: Array(4).fill(0),
              backgroundColor: 'rgba(251, 146, 60, 0.8)',
              borderRadius: 6,
              borderSkipped: false,
            }
          ]
        };
      }

      const withinBudgetData = monthlySpending.map(w => w.withinBudget);
      const overBudgetData = monthlySpending.map(w => w.overBudget);

      return {
        labels: weekLabels,
        datasets: [
          {
            label: 'Within Budget',
            data: withinBudgetData,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Over Budget',
            data: overBudgetData,
            backgroundColor: 'rgba(251, 146, 60, 0.8)',
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      };
    }
    
    // Monthly view
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (monthlySpending.length === 0) {
      return {
        labels: monthNames,
        datasets: [
          {
            label: 'Within Budget',
            data: Array(12).fill(0),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Over Budget',
            data: Array(12).fill(0),
            backgroundColor: 'rgba(251, 146, 60, 0.8)',
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      };
    }

    const withinBudgetData = monthlySpending.map(m => m.withinBudget);
    const overBudgetData = monthlySpending.map(m => m.overBudget);

    return {
      labels: monthNames,
      datasets: [
        {
          label: 'Within Budget',
          data: withinBudgetData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Over Budget',
          data: overBudgetData,
          backgroundColor: 'rgba(251, 146, 60, 0.8)',
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    };
  };

  // Get available categories from database
  const getAvailableCategories = () => {
    const categories = ['All'];
    
    // Add categories from database (overview.categories)
    if (overview.categories && overview.categories.length > 0) {
      overview.categories.forEach(cat => {
        if (cat.name && !categories.includes(cat.name)) {
          categories.push(cat.name);
        }
      });
    } else {
      // Fallback to default categories if no data from database
      categories.push('Medical', 'Education', 'Consumable', 'Clothes', 'Entertainment', 'Transport', 'Other');
    }
    
    return categories;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += '$' + context.parsed.y.toFixed(2);
            return label;
          },
          afterBody: function(context) {
            const monthIndex = context[0].dataIndex;
            if (monthlySpending && monthlySpending[monthIndex]) {
              const monthData = monthlySpending[monthIndex];
              return [
                `Total Spent: $${monthData.spent.toFixed(2)}`,
                `Budget: $${monthData.monthlyBudget || monthData.weeklyBudget || 0}`
              ];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#6b7280'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        suggestedMax: function(context) {
          const maxValue = Math.max(...context.chart.data.datasets.flatMap(d => d.data));
          const roundedMax = Math.ceil(maxValue / 2000) * 2000;
          return Math.max(roundedMax, 2000);
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#6b7280',
          stepSize: 2000,
          callback: function(value) {
            if (value === 0) return '0';
            return value.toLocaleString();
          }
        }
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
    } else {
      alert("Please upload an image file (JPG, PNG, WEBP)");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("You must be logged in to upload a receipt.");
      navigate("/login");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch(`${API_URL}/upload-receipt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Upload failed:", text);
        setUploadError(text);
        alert("Upload failed. Check console for details.");
        return;
      }

      const data = await response.json();
      console.log("Receipt uploaded successfully:", data);
      
      setShowUploadModal(false);
      setFile(null);
      navigate("/dashboard/budget/review-receipt", { 
        state: { receiptData: data } 
      });
      
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Network/server error");
      alert("Upload failed due to network or server error.");
    } finally {
      setUploadLoading(false);
    }
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setFile(null);
    setUploadError(null);
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading budget...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl max-w-md text-center">
          <div className="text-lg text-red-600 mb-4">
            Error loading budget
          </div>
          <div className="text-sm text-gray-600 mb-4">
            {error}
          </div>
          <button
            onClick={fetchBudgetOverview}
            className="px-5 py-2.5 bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="bg-gray-200 px-5 py-4 flex items-center justify-between border-b border-gray-300">
        <h1 className="text-lg font-semibold m-0 text-gray-800">
          Budget overview
        </h1>
        
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="bg-transparent border-none cursor-pointer p-1 text-xl text-gray-600 hover:text-gray-800"
          >
            🏠
          </button>
          <button className="bg-transparent border-none cursor-pointer p-1 text-xl text-gray-600 hover:text-gray-800">
            ⚙️
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Budget Setup Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/dashboard/budget-setup")}
            className="px-4 py-2 bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-gray-700"
          >
            Budget setup
          </button>
        </div>

        {/* Budget Cards */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 flex-1 shadow-sm">
            <div className="text-sm text-center text-gray-600 mb-2 font-medium">
              Total
            </div>
            <div className="text-2xl text-center font-semibold text-gray-800">
              ${overview.total?.toFixed(2) || "0.00"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 flex-1 shadow-sm">
            <div className="text-sm text-center text-gray-600 mb-2 font-medium">
              Spent
            </div>
            <div className="text-2xl text-center font-semibold text-red-600">
              ${overview.spent?.toFixed(2) || "0.00"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 flex-1 shadow-sm">
            <div className="text-sm text-center text-gray-600 mb-2 font-medium">
              Remaining
            </div>
            <div className="text-2xl text-center font-semibold text-green-600">
              ${overview.remaining?.toFixed(2) || "0.00"}
            </div>
            {overview.total > 0 && (
              <div className={`text-xs text-center mt-2 font-medium ${
                overview.status === "Over budget" 
                  ? "text-red-600" 
                  : "text-green-600"
              }`}>
                {overview.status}
              </div>
            )}
          </div>
        </div>

        {/* Chart Section - Spending Overview */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-gray-800 m-0">
                Spending Overview
              </h2>
              
              {/* Timeframe Dropdown (Weekly/Monthly) */}
              <div className="relative">
                <button 
                  onClick={() => setShowTimeframeMenu(!showTimeframeMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-md cursor-pointer text-sm text-gray-700"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                          setSelectedTimeframe('Weekly');
                          setShowTimeframeMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer ${
                          selectedTimeframe === 'Weekly' ? 'text-teal-600 font-medium bg-teal-50' : 'text-gray-700'
                        }`}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTimeframe('Monthly');
                          setShowTimeframeMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer ${
                          selectedTimeframe === 'Monthly' ? 'text-teal-600 font-medium bg-teal-50' : 'text-gray-700'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Three dots menu for Categories */}
            <div className="relative">
              <button 
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="bg-transparent border-none cursor-pointer text-gray-600 hover:text-gray-800 p-2"
              >
                ⋮
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-none bg-transparent cursor-pointer ${
                          selectedCategory === category ? 'text-teal-600 font-medium bg-teal-50' : 'text-gray-700'
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
          
          <div className="h-80">
            <Bar data={getChartData()} options={chartOptions} />
          </div>
          
          {/* Legend Info */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>
                Within budget
                {selectedCategory !== 'All' && overview.categories && (() => {
                  const catData = overview.categories.find(c => c.name === selectedCategory);
                  return catData ? ` ($${catData.allocated?.toFixed(2) || "0.00"})` : '';
                })()}
                {selectedCategory === 'All' && ` ($${overview.total?.toFixed(2) || "0.00"})`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Over budget</span>
            </div>
          </div>
        </div>

        {/* Expense Section */}
        <div className="bg-white rounded-xl p-8 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-gray-800 m-0">
              Expense add and details
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard/budget/add-manual")}
                className="px-5 py-2.5 bg-teal-500 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-teal-600"
              >
                Add manually
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-2.5 bg-teal-500 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-teal-600"
              >
                Upload receipt
              </button>
            </div>
          </div>

          {/* Expense List or Empty State */}
          {expenses.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-2 border-gray-800 rounded-lg inline-flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18M15 3v18" />
                </svg>
              </div>
              <div className="text-base font-semibold text-gray-800 mb-2">
                No expenses recorded yet!
              </div>
              <div className="text-sm text-gray-400">
                Start by adding your first expense by using options above
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Quantity</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-800">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-800">
                        {expense.merchantName || '-'}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-800">
                        {expense.category || 'Other'}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-800 text-center">
                        {expense.quantity || '-'}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-800 text-right font-medium">
                        ${expense.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button 
                          className="text-gray-600 hover:text-gray-800 cursor-pointer bg-transparent border-none"
                          onClick={() => {
                            console.log('Edit expense:', expense._id);
                          }}
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h3 className="text-base font-semibold text-gray-800 m-0">
              AI Insights & Suggestions
            </h3>
          </div>
          <p className="text-sm text-gray-400 m-0 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec maximus fringilla tempor
          </p>
        </div>
      </div>

      {/* Upload Receipt Modal */}
      {showUploadModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" 
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={closeModal} 
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-5 pointer-events-none">
            <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold m-0">Upload Receipt</h2>
                  <button
                    onClick={closeModal}
                    className="bg-transparent border-none text-2xl cursor-pointer p-1 text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </div>

                {uploadError && (
                  <div className="bg-red-50 text-red-700 px-3 py-3 rounded-lg mb-5 text-sm">
                    {uploadError}
                  </div>
                )}

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl py-16 px-10 text-center mb-5 transition-all ${
                    isDragging 
                      ? "border-teal-500 bg-teal-50" 
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="mb-5">
                    <svg 
                      width="48" 
                      height="48" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#9ca3af" 
                      strokeWidth="2"
                      className="mx-auto"
                    >
                      <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                  </div>

                  <p className="text-base text-gray-700 mb-2 font-medium">
                    {file ? file.name : "Drag & Drop your Receipt here"}
                  </p>
                  
                  <p className="text-sm text-gray-400 mb-5">or</p>

                  <label className="inline-block py-2.5 px-6 bg-teal-500 text-white rounded-lg cursor-pointer text-sm font-medium hover:bg-teal-600">
                    Browse File
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      disabled={uploadLoading}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-center mb-8">
                  <p className="text-xs text-gray-400 my-1">
                    Supported file type: JPG, PNG, WEBP
                  </p>
                  <p className="text-xs text-gray-400 my-1">
                    Maximum file size: 10MB
                  </p>
                </div>

                {file && (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setFile(null)}
                      disabled={uploadLoading}
                      className="py-3 px-8 bg-gray-100 text-gray-700 border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploadLoading}
                      className="py-3 px-8 bg-teal-500 text-white border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {uploadLoading ? "Processing..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Budget;