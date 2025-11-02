import { useState, useEffect, useRef } from "react";

function BudgetSetup({ onClose }) {
  const [totalBudget, setTotalBudget] = useState("");
  const [mode, setMode] = useState("dollar");
  const [categories, setCategories] = useState([
    { id: 1, name: "Medical", allocated: 0, percentage: 0, spent: 0, color: "#4CAF50" },
    { id: 2, name: "Education", allocated: 0, percentage: 0, spent: 0, color: "#2196F3" },
    { id: 3, name: "Consumable", allocated: 0, percentage: 0, spent: 0, color: "#FF9800" },
    { id: 4, name: "Other", allocated: 0, percentage: 0, spent: 0, color: "#9E9E9E" }
  ]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [draggingCategory, setDraggingCategory] = useState(null);
  
  const API_URL = "http://localhost:8888/api/budget";
  const getToken = () => localStorage.getItem("accessToken");

  // Custom brand color
  const brandColor = "#238D88";

  useEffect(() => {
    const fetchExistingBudget = async () => {
      try {
        setFetching(true);
        const token = getToken();

        if (!token) {
          setError("Please log in first.");
          setFetching(false);
          return;
        }

        const response = await fetch(`${API_URL}/overview`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.total) {
            setTotalBudget(data.total.toString());
          }
          
          if (data.categories && data.categories.length > 0) {
            const loadedCategories = data.categories.map((cat, index) => {
              const existingCat = categories.find(c => c.name === cat.name);
              return {
                id: existingCat?.id || Date.now() + index,
                name: cat.name,
                allocated: parseFloat(cat.allocated) || 0,
                percentage: parseFloat(cat.percentage) || 0,
                spent: parseFloat(cat.spent) || 0,
                color: existingCat?.color || "#" + Math.floor(Math.random()*16777215).toString(16)
              };
            });
            setCategories(loadedCategories);
          }
          
          await fetchCategorySpending();
        } else if (response.status === 404) {
          setTotalBudget("");
        }
      } catch (err) {
        console.error("Error loading existing budget:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchExistingBudget();
  }, []);

  const fetchCategorySpending = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/expenses`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const expenses = await response.json();
        
        const spentByCategory = {};
        expenses.forEach(expense => {
          const cat = expense.category || "Other";
          spentByCategory[cat] = (spentByCategory[cat] || 0) + parseFloat(expense.amount || 0);
        });

        setCategories(prev => prev.map(cat => ({
          ...cat,
          spent: spentByCategory[cat.name] || 0
        })));
      }
    } catch (err) {
      console.error("Error fetching category spending:", err);
    }
  };

  const totalAssigned = categories.reduce((sum, cat) => sum + parseFloat(cat.allocated || 0), 0);
  const totalPercentage = categories.reduce((sum, cat) => sum + parseFloat(cat.percentage || 0), 0);

  const updateCategoryValue = (id, value) => {
    const inputValue = parseFloat(value) || 0;
    const budget = parseFloat(totalBudget) || 0;
    
    if (budget === 0) {
      setError("Please set total budget first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (mode === "dollar") {
      const percentage = budget > 0 ? (inputValue / budget) * 100 : 0;
      setCategories(prev => prev.map(cat => 
        cat.id === id 
          ? { ...cat, allocated: inputValue, percentage: parseFloat(percentage.toFixed(2)) }
          : cat
      ));
    } else {
      const amount = (inputValue / 100) * budget;
      setCategories(prev => prev.map(cat => 
        cat.id === id 
          ? { ...cat, percentage: inputValue, allocated: parseFloat(amount.toFixed(2)) }
          : cat
      ));
    }
  };

  const handleProgressBarDrag = (categoryId, event, barElement) => {
    const budget = parseFloat(totalBudget) || 0;
    if (budget === 0) {
      setError("Please set total budget first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const rect = barElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    const allocated = (percentage / 100) * budget;

    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, allocated: parseFloat(allocated.toFixed(2)), percentage: parseFloat(percentage.toFixed(2)) }
        : cat
    ));
  };

  const startDragging = (categoryId, event, barElement) => {
    setDraggingCategory(categoryId);
    handleProgressBarDrag(categoryId, event, barElement);

    const handleMouseMove = (e) => {
      handleProgressBarDrag(categoryId, e, barElement);
    };

    const handleMouseUp = () => {
      setDraggingCategory(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const addCategory = (e) => {
    if (e) e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setError("Please enter a category name");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const colors = ["#E91E63", "#9C27B0", "#3F51B5", "#00BCD4", "#8BC34A", "#FFC107", "#FF5722"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newCategory = {
      id: Date.now(),
      name: newCategoryName.trim(),
      allocated: 0,
      percentage: 0,
      spent: 0,
      color: randomColor
    };
    
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName("");
    setShowAddCategory(false);
  };

  const removeCategory = (id) => {
    const defaultIds = [1, 2, 3, 4];
    if (defaultIds.includes(id)) {
      setError("Cannot remove default categories");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        setError("Please log in first.");
        setLoading(false);
        return;
      }

      const budgetAmount = parseFloat(totalBudget);
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        setError("Please enter a valid budget amount");
        setLoading(false);
        return;
      }

      if (totalAssigned > budgetAmount) {
        setError("Total allocated amount exceeds budget!");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          total: budgetAmount,
          categories: categories.map(cat => ({
            name: cat.name,
            allocated: parseFloat(cat.allocated) || 0,
            percentage: parseFloat(cat.percentage) || 0
          }))
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to set budget");
      }

      alert("Budget updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error setting budget:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 z-[100] flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="hidden md:block md:w-[300px]" />
        <div className="flex-1 bg-black bg-opacity-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-gray-600">Loading budget data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="hidden md:block md:w-[300px]" />
      
      <div className="flex-1 bg-black bg-opacity-50 overflow-y-auto flex items-start justify-center p-4">
        <div className="bg-white flex flex-col items-start gap-5 p-[48px_46px] w-[1034px] rounded-[10px] shadow-md">

          <h2 className="text-xl font-semibold text-gray-800 mb-1">Set your overall Budget</h2>
          <p className="text-gray-600 text-sm mb-5">
            Enter the total amount you want to set budget for this period
          </p>

          {error && (
            <div className="px-4 py-3 rounded-lg mb-4 text-sm bg-red-50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <div className="mb-6">
              <div className="relative flex items-center gap-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-600 z-10">
                  $
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  step="0.01"
                  min="0"
                  disabled={loading}
                  className="flex w-[665px] items-center px-[30px] pr-[561px] py-[11px] rounded-[15px] border border-gray-300 text-[20px] font-[500] leading-[26px] text-black outline-none"
                  style={{ 
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxShadow: 'none'
                  }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}`}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (parseFloat(totalBudget) <= 0) {
                      setError("Please enter a valid budget amount");
                      setTimeout(() => setError(null), 3000);
                    }
                  }}
                  className="flex justify-center items-center w-[172px] h-[48px] px-[136px] py-[15px] gap-[10px] rounded-[15px] text-white text-[16px] font-[600] leading-[22.4px] cursor-pointer transition-opacity"
                  style={{ 
                    backgroundColor: brandColor,
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Set Budget
                </button>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex justify-end items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Mode:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="dollar"
                    checked={mode === "dollar"}
                    onChange={(e) => setMode(e.target.value)}
                    className="cursor-pointer"
                    style={{ accentColor: brandColor }}
                  />
                  <span className="text-sm text-gray-800">$</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="percentage"
                    checked={mode === "percentage"}
                    onChange={(e) => setMode(e.target.value)}
                    className="cursor-pointer"
                    style={{ accentColor: brandColor }}
                  />
                  <span className="text-sm text-gray-800">%</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Define your budget by category
              </h3>

              <div className="mb-5">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">Total assigned</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ${parseFloat(totalBudget || 0).toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 rounded"
                    style={{ 
                      width: `${Math.min(totalPercentage, 100)}%`,
                      backgroundColor: brandColor
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gray-600">
                    {totalPercentage >= 100 ? (
                      <>
                        <span className="font-medium">Assigned:</span> {totalPercentage.toFixed(1)}%
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Remaining:</span> {(100 - totalPercentage).toFixed(1)}%
                      </>
                    )}
                  </div>
                  <div className="text-xs font-semibold">
                    {totalPercentage > 100 ? (
                      <span className="text-red-500">Over Budget</span>
                    ) : totalPercentage === 100 ? (
                      <span className="text-green-500 flex items-center gap-1">
                        ✓ All Budget Assigned
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {!showAddCategory && (
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="w-full py-2.5 bg-gray-100 rounded-lg text-sm font-medium mb-4 border border-dashed transition-colors"
                  style={{ 
                    color: brandColor,
                    borderColor: brandColor
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  + Add New Category
                </button>
              )}

              {showAddCategory && (
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCategory(e);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none"
                    style={{ boxShadow: 'none' }}
                    onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}`}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                  <button 
                    type="button" 
                    onClick={addCategory}
                    className="px-4 py-2 text-white rounded-md text-sm font-medium transition-opacity"
                    style={{ backgroundColor: brandColor }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Add
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategoryName("");
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {categories.map((category) => {
                  const spentPercentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
                  const allocationPercentage = category.percentage;

                  return (
                    <div key={category.id} className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-3">
                        
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800 mb-0.5">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${category.allocated.toFixed(2)} allocated
                          </div>
                        </div>

                        <div 
                          className="flex-1 h-3 bg-gray-200 rounded overflow-hidden relative mt-1 cursor-pointer"
                          onMouseDown={(e) => startDragging(category.id, e, e.currentTarget)}
                          style={{ userSelect: 'none' }}
                          title="Drag to allocate budget"
                        >
                          <div
                            className="h-full rounded transition-all duration-150"
                            style={{ 
                              width: `${Math.min(allocationPercentage, 100)}%`, 
                              backgroundColor: brandColor,
                              opacity: draggingCategory === category.id ? 0.8 : 1
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative w-20">
                            <input
                              type="number"
                              value={mode === "dollar" ? (category.allocated || "") : (category.percentage || "")}
                              onChange={(e) => updateCategoryValue(category.id, e.target.value)}
                              placeholder={mode === "dollar" ? "0.00" : "0"}
                              step={mode === "dollar" ? "0.01" : "0.1"}
                              min="0"
                              max={mode === "percentage" ? "100" : undefined}
                              className="w-full pr-6 pl-2 py-1.5 border border-gray-300 rounded-md text-sm text-right outline-none"
                              style={{ boxShadow: 'none' }}
                              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}`}
                              onBlur={(e) => e.target.style.boxShadow = 'none'}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                              {mode === "percentage" ? "%" : "$"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeCategory(category.id)}
                            disabled={category.id <= 4}
                            className={`w-8 h-8 rounded-md flex items-center justify-center ${
                              category.id <= 4 
                                ? 'bg-gray-100 cursor-not-allowed opacity-40' 
                                : 'bg-red-50 hover:bg-red-100 cursor-pointer'
                            }`}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M3 6H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="#FF7B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-200 text-gray-600 rounded-lg text-base font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !totalBudget || totalAssigned > parseFloat(totalBudget)}
                className="flex-1 py-3 rounded-lg text-base font-medium transition-opacity"
                style={{
                  backgroundColor: (loading || !totalBudget || totalAssigned > parseFloat(totalBudget)) ? '#d1d5db' : brandColor,
                  color: 'white',
                  cursor: (loading || !totalBudget || totalAssigned > parseFloat(totalBudget)) ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!loading && totalBudget && totalAssigned <= parseFloat(totalBudget)) {
                    e.target.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetSetup;