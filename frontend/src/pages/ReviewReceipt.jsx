import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ReviewReceipt() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const API_BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "";
  const API_URL = `${API_BASE}/api/budget`;
  const getToken = () => localStorage.getItem("accessToken");

  const categories = [
    "Medical",
    "Education",
    "Consumable",
    "Clothes",
    "Entertainment",
    "Transport",
    "Other",
  ];

  useEffect(() => {
    // Check if mobile on component mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    console.log("ReviewReceipt - Location state:", location.state);

    const data = location.state?.receiptData?.receiptData;

    if (data?.expenses && data.expenses.length > 0) {
      setReceiptInfo({
        merchantName: data.merchantName,
        totalAmount: data.totalAmount,
        date: data.date,
        currency: data.currency,
      });

      console.log(` Processing ${data.expenses.length} items from receipt`);

      // Map each item from the receipt
      const formattedExpenses = data.expenses.map((exp, idx) => {
        console.log(
          `  Item ${idx + 1}: ${exp.description} - ${exp.category} - Qty: ${
            exp.quantity
          } - $${exp.amount}`
        );

        return {
          id: idx,
          date: exp.date || new Date().toISOString().split("T")[0],
          items: exp.description || "Unknown Item",
          description: data.merchantName || "Unknown Merchant",
          category: exp.category || "Other",
          quantity: exp.quantity || 1,
          amount: parseFloat(exp.amount) || 0,
        };
      });

      // ADD DISCOUNT LINE ITEM IF THERE'S A DIFFERENCE
      const itemsTotal = formattedExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      const receiptTotal = data.totalAmount || 0;
      const difference = itemsTotal - receiptTotal;

      if (Math.abs(difference) > 0.01) {
        // If there's more than 1 cent difference
        console.log(`Discount detected: $${difference.toFixed(2)}`);
        formattedExpenses.push({
          id: formattedExpenses.length,
          date: data.date || new Date().toISOString().split("T")[0],
          items: "Discount",
          description: data.merchantName || "Unknown Merchant",
          category: "Other",
          quantity: 1,
          amount: -difference, // Negative amount for discount
        });
      }

      console.log(
        `Created ${formattedExpenses.length} expense rows for review`
      );
      setExpenses(formattedExpenses);
    } else {
      // ... rest of the code
    }
  }, [location.state]);

  const handleChange = (id, field, value) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleRemoveExpense = (id) => {
    if (expenses.length > 1) {
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    }
  };

  const handleAddExpense = () => {
    const newId = Math.max(...expenses.map((e) => e.id), 0) + 1;
    setExpenses((prev) => [
      ...prev,
      {
        id: newId,
        date: new Date().toISOString().split("T")[0],
        items: "",
        description: receiptInfo?.merchantName || "",
        category: "Other",
        quantity: 1,
        amount: 0,
      },
    ]);
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) {
      alert("You must be logged in.");
      navigate("/login");
      return;
    }

    const validExpenses = expenses.filter((exp) => exp.amount > 0);
    if (validExpenses.length === 0) {
      alert("Please add at least one expense with a valid amount.");
      return;
    }

    console.log(`\n Grouping ${validExpenses.length} items by category...`);
    setLoading(true);

    try {
      const savedExpenses = [];

      // Save EACH item separately - NO GROUPING
      for (const expense of validExpenses) {
        const response = await fetch(`${API_URL}/add-manual`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(expense.amount),
            category: expense.category,
            productName: expense.items,
            merchantName: expense.description, //
            date: expense.date,
            quantity: parseInt(expense.quantity),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Failed to save ${expense.items}`
          );
        }

        const data = await response.json();
        console.log(`  Saved expense ID: ${data.expense._id}\n`);
        savedExpenses.push(data);
      }

      console.log(
        `\nSuccessfully saved ${savedExpenses.length} individual expenses!`
      );
      alert(
        `Successfully saved ${savedExpenses.length} expense(s)! Each item is tracked separately.`
      );

      // Navigate back and trigger refresh
      navigate("/dashboard/budget", {
        state: {
          refreshData: true,
          message: `${savedExpenses.length} expenses added from receipt`,
        },
      });
    } catch (err) {
      console.error(" Save error:", err);
      alert("Failed to save expenses: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = expenses.reduce(
    (sum, exp) => sum + (parseFloat(exp.amount) || 0),
    0
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <>
        {/* Mobile Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => navigate("/dashboard/budget")}
        />

        {/* Mobile Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              {/* Mobile Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold m-0 mb-1 font-sans">
                    Review Receipt
                  </h2>
                  {receiptInfo && (
                    <div className="text-xs text-gray-600 font-sans">
                      <span className="font-medium">
                        {receiptInfo.merchantName || "Unknown Merchant"}
                      </span>
                      {receiptInfo.date && (
                        <span className="ml-2">• {receiptInfo.date}</span>
                      )}
                    </div>
                  )}
                </div>
                {/* <button
                  onClick={() => navigate("/dashboard/budget")}
                  className="bg-transparent border-none text-xl cursor-pointer p-1 text-gray-600 hover:text-gray-800"
                >
                  ×
                </button> */}
              </div>

              {/* Mobile Expense Cards */}
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className=" rounded-lg p-3 border border-gray-200"
                  >
                    <div className="text-sm font-medium text-gray-700 font-sans">
                      {expense.date}
                    </div>

                    {/* Top Row - Date and Amount */}
                    <div className="flex justify-between items-center">
                      <div className="text-base font-semibold text-gray-900 mb-1 font-sans">
                        {expense.items || "Item name"}
                      </div>
                      <div className="text-lg font-semibold text-gray-800 font-numbers">
                        ${expense.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 font-sans">
                      {expense.category}
                    </div>

                    {/* Store Name */}
                    <div className="text-sm text-gray-600  font-sans">
                      {expense.description || "Store name"}
                    </div>

                    {/* Bottom Row - Category, Quantity, and Actions */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-600 font-sans">
                          Qty: {expense.quantity}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleRemoveExpense(expense.id)}
                          disabled={expenses.length === 1}
                          className="p-2 rounded text-red-600 cursor-pointer hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Item Button */}
              <button
                onClick={handleAddExpense}
                className="w-full py-3 text-[#238D88] hover:text-[#1a6d69] text-sm font-medium flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer font-sans mb-4"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Another Item
              </button>

              {/* Mobile Summary */}
              <div className="bg-[#EFEFEF] rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600 font-sans">
                    Total Items:{" "}
                    <span className="font-semibold">{expenses.length}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-800 font-numbers">
                    ${totalAmount.toFixed(2)}
                  </div>
                </div>
                {receiptInfo?.totalAmount && (
                  <div className="text-xs text-gray-500 text-center mt-2 font-sans">
                    Receipt total: {receiptInfo.currency || "$"}
                    {receiptInfo.totalAmount.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/dashboard/budget")}
                  disabled={loading}
                  className="flex-1 py-3 text-gray-700 rounded-lg cursor-pointer text-sm font-medium border border-black disabled:cursor-not-allowed disabled:opacity-50 font-sans"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    loading || expenses.every((exp) => exp.amount === 0)
                  }
                  className="flex-1 py-3 bg-[#238D88] text-white border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-[#1a6d69] disabled:cursor-not-allowed disabled:bg-gray-400 font-sans"
                >
                  {loading
                    ? "Saving..."
                    : `Save ${
                        expenses.filter((e) => e.amount > 0).length
                      } Item(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Layout (your original code)
  return (
    <>
      {/* Backdrop Blur Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={() => navigate("/dashboard/budget")}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-5 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-8 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold m-0 mb-2 font-sans">
                  Review and Edit Receipt
                </h2>
                {receiptInfo && (
                  <div className="text-sm text-gray-600 font-sans">
                    <span className="font-medium">
                      {receiptInfo.merchantName || "Unknown Merchant"}
                    </span>
                    {receiptInfo.date && (
                      <span className="ml-3">• {receiptInfo.date}</span>
                    )}
                    {receiptInfo.totalAmount && (
                      <span className="ml-3">
                        • Total: {receiptInfo.currency || "$"}
                        {receiptInfo.totalAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {/* <button
                onClick={() => navigate("/dashboard/budget")}
                className="bg-transparent border-none text-2xl cursor-pointer p-1 text-gray-600 hover:text-gray-800"
              >
                ×
              </button> */}
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[100px_1.5fr_1.5fr_130px_80px_100px_60px] gap-3 px-4 py-3 bg-[rgba(35,141,136,0.15)] border-b border-gray-200 text-xs font-semibold font-sans">
              <div>Date</div>
              <div>Items</div>
              <div>Description</div>
              <div>Category</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Amount</div>
              <div className="text-center">Action</div>
            </div>

            {/* Expense Rows */}
            <div className="max-h-96 overflow-y-auto">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-[100px_1.5fr_1.5fr_130px_80px_100px_60px] gap-3 px-4 py-3 border-b border-gray-200 items-center"
                >
                  {/* Date */}
                  <input
                    type="date"
                    value={expense.date}
                    onChange={(e) =>
                      handleChange(expense.id, "date", e.target.value)
                    }
                    className="px-2 py-2  rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-sans"
                  />

                  {/* Items (Product Name) */}
                  <input
                    type="text"
                    value={expense.items}
                    onChange={(e) =>
                      handleChange(expense.id, "items", e.target.value)
                    }
                    placeholder="Item name"
                    className="px-2 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-sans"
                  />

                  {/* Description (Store Name) */}
                  <input
                    type="text"
                    value={expense.description}
                    onChange={(e) =>
                      handleChange(expense.id, "description", e.target.value)
                    }
                    placeholder="Store name"
                    className="px-2 py-2  rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-sans"
                  />

                  {/* Category */}
                  <select
                    value={expense.category}
                    onChange={(e) =>
                      handleChange(expense.id, "category", e.target.value)
                    }
                    className="px-2 py-2  rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-sans"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {/* Quantity */}
                  <input
                    type="number"
                    value={expense.quantity}
                    onChange={(e) =>
                      handleChange(expense.id, "quantity", e.target.value)
                    }
                    min="1"
                    className="px-2 py-2 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-sans"
                  />

                  {/* Amount */}
                  <input
                    type="number"
                    step="0.01"
                    value={expense.amount}
                    onChange={(e) =>
                      handleChange(expense.id, "amount", e.target.value)
                    }
                    placeholder="0.00"
                    className="px-2 py-2  rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#238D88] focus:border-transparent font-numbers"
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => handleRemoveExpense(expense.id)}
                      disabled={expenses.length === 1}
                      className="bg-transparent border-none cursor-pointer p-1 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Row Button */}
            <div className="px-4 py-3 border-b border-gray-200">
              <button
                onClick={handleAddExpense}
                className="text-[#238D88] hover:text-[#1a6d69] text-sm font-medium flex items-center gap-2 bg-transparent border-none cursor-pointer font-sans"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Another Item
              </button>
            </div>

            {/* Summary */}
            <div className="px-4 py-4 bg-[#EFEFEF] rounded-lg mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600 font-sans">
                Total Items:{" "}
                <span className="font-semibold">{expenses.length}</span>
              </div>
              <div className="text-lg font-semibold text-gray-800 font-numbers">
                Total: ${totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mt-6 pb-4">
              <button
                onClick={() => navigate("/dashboard/budget")}
                disabled={loading}
                className="py-3 px-8  text-gray-700 border border-black  rounded-lg cursor-pointer text-sm font-medium  disabled:cursor-not-allowed disabled:opacity-50 font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || expenses.every((exp) => exp.amount === 0)}
                className="py-3 px-8 bg-[#238D88] text-white border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-[#1a6d69] disabled:cursor-not-allowed disabled:bg-gray-400 font-sans"
              >
                {loading
                  ? "Saving..."
                  : `Save ${
                      expenses.filter((e) => e.amount > 0).length
                    } Expense(s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
