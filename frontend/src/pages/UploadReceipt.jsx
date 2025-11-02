import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadReceipt() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://localhost:8888/api/budget";

  const getToken = () => localStorage.getItem("accessToken");

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
      alert("Please upload an image file (JPG, PNG, PDF)");
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

    setLoading(true);
    setError(null);

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
        setError(text);
        alert("Upload failed. Check console for details.");
        return;
      }

      const data = await response.json();
      console.log("Receipt uploaded successfully:", data);
      
      // Navigate to review/edit screen with the receipt data
      navigate("/dashboard/budget/review-receipt", { 
        state: { receiptData: data } 
      });
      
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Network/server error");
      alert("Upload failed due to network or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop Blur Overlay */}
      <div 
  className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" 
  style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
  onClick={() => navigate("/dashboard/budget")} 
/>
      
      {/* Modal Container */}
     
<div className="fixed inset-0 flex items-center justify-center z-[9999] p-5 pointer-events-none">
  
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold m-0">Upload Receipt</h2>
              <button
                onClick={() => navigate("/dashboard/budget")}
                className="bg-transparent border-none text-2xl cursor-pointer p-1 text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-3 py-3 rounded-lg mb-5 text-sm">
                {error}
              </div>
            )}

            {/* Drag & Drop Area */}
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
              {/* Upload Icon */}
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
                  disabled={loading}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            {/* File Info */}
            <div className="text-center mb-8">
              <p className="text-xs text-gray-400 my-1">
                Supported file type: JPG, PNG, PDF
              </p>
              <p className="text-xs text-gray-400 my-1">
                Maximum file size: 10MB
              </p>
            </div>

            {/* Action Buttons */}
            {file && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setFile(null)}
                  disabled={loading}
                  className="py-3 px-8 bg-gray-100 text-gray-700 border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="py-3 px-8 bg-teal-500 text-white border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {loading ? "Processing..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}  
// "http://localhost:8888/api/expense"