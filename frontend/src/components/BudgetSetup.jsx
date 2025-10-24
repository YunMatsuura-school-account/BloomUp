import { useState, useEffect } from "react";

function BudgetSetup({ onClose }) {
  const [totalBudget, setTotalBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = "http://localhost:8888/api/budget";

  const getToken = () => localStorage.getItem("accessToken");

  // ✅ Fetch existing budget
  useEffect(() => {
    const fetchExistingBudget = async () => {
      try {
        setFetching(true);
        const token = getToken();

        if (!token) {
          setError("Please log in first.");
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
            setTotalBudget(data.total);
          }
        } else if (response.status === 404) {
          setTotalBudget("");
        } else {
          throw new Error("Error fetching existing budget");
        }
      } catch (err) {
        console.error("Error loading existing budget:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchExistingBudget();
  }, []);

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        setError("Please log in first.");
        return;
      }

      const budgetAmount = parseFloat(totalBudget);
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        setError("Please enter a valid budget amount");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ total: budgetAmount }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to set budget");
      }

      alert("Budget updated successfully!");
      onClose(); // ✅ Close modal after success
    } catch (err) {
      console.error("Error setting budget:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return null; // don't render modal until data loaded
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={titleStyle}>Set Your Budget</h2>

        <p style={descStyle}>
          {totalBudget
            ? `You currently have a total budget of $${Number(totalBudget).toFixed(2)}.`
            : "Enter your total monthly budget to start tracking expenses."}
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Total Budget Amount</label>
          <div style={{ position: "relative", marginBottom: "24px" }}>
            <span style={dollarStyle}>$</span>
            <input
              type="number"
              placeholder="0.00"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              step="0.01"
              min="0"
              required
              disabled={loading}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={loading || !totalBudget}
              style={{
                ...buttonStyle,
                backgroundColor: loading || !totalBudget ? "#ccc" : "#007bff",
                cursor: loading || !totalBudget ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving..." : "Save Budget"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: "#666" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ✅ Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(5px)", // ✅ blur background
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "32px",
  width: "90%",
  maxWidth: "420px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  animation: "fadeIn 0.3s ease",
};

const titleStyle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#333",
  marginBottom: "8px",
};

const descStyle = {
  color: "#666",
  fontSize: "14px",
  marginBottom: "20px",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "500",
  color: "#333",
  marginBottom: "8px",
};

const dollarStyle = {
  position: "absolute",
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "18px",
  color: "#666",
};

const inputStyle = {
  padding: "12px 12px 12px 32px",
  width: "100%",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "16px",
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle = {
  flex: 1,
  padding: "10px 20px",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "500",
};

const errorStyle = {
  backgroundColor: "#ffebee",
  color: "#c62828",
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "16px",
  fontSize: "14px",
};

export default BudgetSetup;
