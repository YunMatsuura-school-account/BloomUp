import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadReceipt() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = "http://localhost:8888/api/budget";

  const getToken = () => localStorage.getItem("accessToken");

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

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch(`${API_URL}/upload-receipt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Send JWT
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Upload failed:", text);
        setError(text);
        alert("Upload failed. Check console for details.");
        return;
      }

      const data = await response.json();
      console.log("Receipt uploaded successfully:", data);
      alert("Receipt uploaded successfully!");
      setFile(null); // Reset file input
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Network/server error");
      alert("Upload failed due to network or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "0 20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Upload Receipt</h2>

      {error && (
        <div
          style={{
            backgroundColor: "#ffe6e6",
            color: "#c62828",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={loading}
        accept="image/*"
        style={{ marginBottom: "16px", width: "100%" }}
      />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: loading || !file ? "#ccc" : "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: loading || !file ? "not-allowed" : "pointer",
          fontWeight: 500,
        }}
      >
        {loading ? "Uploading..." : "Upload Receipt"}
      </button>

      <button
        onClick={() => navigate("/dashboard")}
        disabled={loading}
        style={{
          marginTop: "12px",
          width: "100%",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          color: "#007bff",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
