import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadReceipt({ onClose }) {
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
    if (droppedFile && (droppedFile.type.startsWith("image/") || droppedFile.type === "application/pdf")) {
      setFile(droppedFile);
    } else {
      setError("Please upload an image file (JPG, PNG) or PDF");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload an image file (JPG, PNG) or PDF");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("You must be logged in to upload a receipt.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      console.log("Uploading file:", file.name, file.type, file.size);

      const response = await fetch(`${API_URL}/upload-receipt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Receipt uploaded successfully:", data);
      
      // Navigate to ReviewReceipt with the parsed data instead of just closing
      navigate("/dashboard/budget/review-receipt", { 
        state: { receiptData: data } 
      });
      
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
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
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-[1001px] max-h-[90vh] overflow-y-auto">
          <div className="p-6 md:p-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 m-0 font-sans text-center">Upload Receipt</h2>
              <button
                onClick={onClose}
                className="bg-transparent border-none text-2xl cursor-pointer p-1 text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-sans">
                {error}
              </div>
            )}

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl py-12 md:py-16 px-6 md:px-10 text-center mb-6 transition-all ${
                isDragging 
                  ? "border-[#238D88] bg-[#f0f9f9]" 
                  : "border-gray-300"
              }`}
            >
              {/* Upload Icon */}
              <div className="mb-4 md:mb-6">
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

              <p className="text-base text-gray-700 mb-2 font-medium font-sans">
                {file ? file.name : "Drag & Drop your Receipt here"}
              </p>
              
              <p className="text-sm text-gray-400 mb-4 font-sans">or</p>

              <label className="inline-block py-2.5 px-6 bg-[#238D88] text-white rounded-lg cursor-pointer text-sm font-medium hover:bg-[#1a6d69] transition-colors font-sans">
                Browse File
                <input
                  type="file"
                  onChange={handleFileSelect}
                  disabled={loading}
                  accept="image/*,.pdf"
                  className="hidden"
                />
              </label>
            </div>

            {/* File Info */}
            <div className="text-center mb-8">
              <p className="text-xs text-gray-400 mb-1 font-sans">
                Supported file type: JPG, PNG, PDF
              </p>
              <p className="text-xs text-gray-400 font-sans">
                Maximum file size: 10MB
              </p>
            </div>

            {/* Action Buttons */}
            {file && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setFile(null)}
                  disabled={loading}
                  className="py-3 px-8 bg-gray-100 text-gray-700 border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-sans"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="py-3 px-8 bg-[#238D88] text-white border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-[#1a6d69] disabled:cursor-not-allowed disabled:bg-gray-400 transition-colors font-sans"
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