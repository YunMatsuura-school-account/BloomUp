// frontend/src/components/CustomReminderModal.jsx
import React, { useState, useEffect } from 'react';

const CustomReminderModal = ({ isOpen, onClose, onSave, onDaysChange }) => {
  const [customDays, setCustomDays] = useState('');
  const [error, setError] = useState('');

  // Notify parent of days change for preview
  useEffect(() => {
    if (onDaysChange && customDays && !error) {
      onDaysChange(customDays);
    }
  }, [customDays, error, onDaysChange]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomDays(value);
      setError('');
    }
  };

  const handleConfirm = () => {
    const days = parseInt(customDays);
    
    if (!customDays || days <= 0) {
      setError('Please enter a valid number of days');
      return;
    }

    if (days > 365) {
      setError('Please enter a number less than 365 days');
      return;
    }

    onSave(days);
    setCustomDays('');
    setError('');
  };

  const handleCancel = () => {
    setCustomDays('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]" onClick={(e) => e.stopPropagation()}>
      <div className="custom-reminder-modal bg-white rounded-2xl p-8 w-[600px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <h2 className="text-2xl font-bold text-black mb-4 text-center">
          Customize your reminder
        </h2>

        {/* Description */}
        <p className="text-gray-700 text-center mb-8">
          Write your own custom alert date for getting reminder for this item!
        </p>

        {/* Input Section */}
        <div className="mb-8">
          <label className="block text-black font-semibold text-lg mb-3">
            Alert
          </label>
          <input
            type="text"
            value={customDays}
            onChange={handleInputChange}
            placeholder="Ex: every 10 days"
            className={`w-full px-4 py-3 border-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#238D88] transition-colors ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
          <p className="mt-2 text-gray-500 text-sm">
            Enter the number of days before the event you want to be reminded
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-[#238D88] text-white rounded-lg font-medium hover:bg-[#1a6b67] transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomReminderModal;