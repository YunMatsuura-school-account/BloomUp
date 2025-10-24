import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Budget() {
  const [overview, setOverview] = useState({
    total: 0,
    spent: 0,
    remaining: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_URL = "http://localhost:8888/api/budget";

  // Get token from localStorage (matching your AuthGuard)
  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  useEffect(() => {
    fetchBudgetOverview();
  }, []);

  const fetchBudgetOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      
      if (!token) {
        navigate("/login");
        return;
      }

      // NO userId parameter! JWT token handles authentication
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
          // No budget set yet
          setOverview({ total: 0, spent: 0, remaining: 0 });
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

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: "#f5f5f5", 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ fontSize: "18px", color: "#666" }}>Loading budget...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        backgroundColor: "#f5f5f5", 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ 
          backgroundColor: "#fff",
          padding: "24px",
          borderRadius: "12px",
          maxWidth: "400px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "18px", color: "#ff0000", marginBottom: "16px" }}>
            Error loading budget
          </div>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
            {error}
          </div>
          <button
            onClick={fetchBudgetOverview}
            style={{
              padding: "10px 20px",
              backgroundColor: "#666",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "#f5f5f5", 
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#e8e8e8",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #d0d0d0"
      }}>
        <h1 style={{ 
          fontSize: "18px", 
          fontWeight: "600",
          margin: 0,
          color: "#333"
        }}>
          Budget overview
        </h1>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button 
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              fontSize: "20px",
              color: "#666"
            }}
          >
            🏠
          </button>
          <button style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            fontSize: "20px",
            color: "#666"
          }}>
            ⚙️
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px" }}>
        {/* Budget Setup Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <button
            onClick={() => navigate("/dashboard/budget-setup")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#666",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}
          >
            Budget setup
          </button>
        </div>

        {/* Budget Cards */}
        <div style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            flex: 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}>
            <div style={{ 
              fontSize: "13px", 
              color: "#666",
              marginBottom: "8px",
              fontWeight: "500"
            }}>
              Total
            </div>
            <div style={{ 
              fontSize: "24px", 
              fontWeight: "600",
              color: "#333"
            }}>
              ${overview.total?.toFixed(2) || "0.00"}
            </div>
          </div>

          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            flex: 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}>
            <div style={{ 
              fontSize: "13px", 
              color: "#666",
              marginBottom: "8px",
              fontWeight: "500"
            }}>
              Spent
            </div>
            <div style={{ 
              fontSize: "24px", 
              fontWeight: "600",
              color: "#ff0000"
            }}>
              ${overview.spent?.toFixed(2) || "0.00"}
            </div>
          </div>

          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            flex: 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}>
            <div style={{ 
              fontSize: "13px", 
              color: "#666",
              marginBottom: "8px",
              fontWeight: "500"
            }}>
              Remaining
            </div>
            <div style={{ 
              fontSize: "24px", 
              fontWeight: "600",
              color: "#00c853"
            }}>
              ${overview.remaining?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>

        {/* Budget Status */}
        {overview.total > 0 && (
          <div style={{
            backgroundColor: overview.status === "Over budget" ? "#ffebee" : "#e8f5e9",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
            fontSize: "13px",
            color: overview.status === "Over budget" ? "#c62828" : "#2e7d32",
            fontWeight: "500"
          }}>
            {overview.status === "Over budget" ? "⚠️ " : "✅ "}
            {overview.status}
          </div>
        )}

        {/* Expense Section */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#333",
            marginTop: 0,
            marginBottom: "24px"
          }}>
            Expense
          </h2>

          <div style={{
            textAlign: "center",
            padding: "40px 0"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "2px solid #333",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M15 3v18" />
              </svg>
            </div>
            <div style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px"
            }}>
              No expenses recorded yet!
            </div>
            <div style={{
              fontSize: "13px",
              color: "#999",
              marginBottom: "24px"
            }}>
              Start by adding your first expense by using options below
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center"
            }}>
              <button
                onClick={() => navigate("/dashboard/budget/add-manual")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#666",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500"
                }}
              >
                Add manually
              </button>
              <button
                onClick={() => navigate("/dashboard/budget/upload-receipt")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#666",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500"
                }}
              >
                Upload receipt
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h3 style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#333",
              margin: 0
            }}>
              AI Insights & Suggestions
            </h3>
          </div>
          <p style={{
            fontSize: "13px",
            color: "#999",
            margin: 0,
            lineHeight: "1.6"
          }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec maximus fringilla tempor
          </p>
        </div>
      </div>
    </div>
  );
}

export default Budget;