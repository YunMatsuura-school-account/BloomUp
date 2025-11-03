// frontend/src/components/ReminderModal.jsx
import React, { useState, useEffect } from 'react';

const ReminderModal = ({ isOpen, onClose, onSelectAlert, event, customDaysPreview, existingReminder }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState('None');

  // Helper function to format custom days for display
  const formatCustomDaysDisplay = (days) => {
    if (!days) return null;
    
    // Check for second-based alerts
    if (days < 0.001) {
      const seconds = Math.round(days * 24 * 60 * 60);
      return `${seconds} second${seconds > 1 ? 's' : ''} before`;
    }
    
    // Check for standard short-term alerts
    if (Math.abs(days - 0.0035) < 0.0001) return '5 minutes before';
    if (Math.abs(days - 0.0104) < 0.0001) return '15 minutes before';
    if (Math.abs(days - 0.0417) < 0.001) return '1 hour before';
    
    // Check if it's less than a day (show in hours or minutes)
    if (days < 1) {
      const totalMinutes = Math.round(days * 24 * 60);
      if (totalMinutes < 60) {
        return `${totalMinutes} minute${totalMinutes > 1 ? 's' : ''} before`;
      }
      const hours = Math.round(days * 24);
      return `${hours} hour${hours > 1 ? 's' : ''} before`;
    }
    
    // Show in days
    const displayDays = Math.round(days);
    return `${displayDays} day${displayDays > 1 ? 's' : ''} before`;
  };

  // Reset and load existing reminder when modal opens
  useEffect(() => {
    if (isOpen && event) {
      // Reset first
      setShowDropdown(false);
      
      // Load existing reminder if present
      if (existingReminder) {
        console.log('📝 Loading existing reminder:', existingReminder);
        
        if (existingReminder.customAlert && existingReminder.customDays !== null) {
          // Use the helper function to format display
          const displayText = formatCustomDaysDisplay(existingReminder.customDays);
          setSelectedAlert(displayText || 'Custom');
        } else {
          // Standard alert
          setSelectedAlert(existingReminder.alert || 'None');
        }
      } else {
        // No existing reminder, default to None
        setSelectedAlert('None');
      }
    }
  }, [isOpen, event, existingReminder]);

  // Update display when custom days change
  useEffect(() => {
    if (customDaysPreview && customDaysPreview !== '') {
      const days = parseFloat(customDaysPreview);
      const displayText = formatCustomDaysDisplay(days);
      setSelectedAlert(displayText || `${customDaysPreview} days before`);
    }
  }, [customDaysPreview]);

  const alertOptions = [
    'None',
    '5 minutes before',
    '15 minutes before',
    '1 hour before',
    '1 day before',
    '2 Weeks before',
    '3 Weeks before'
  ];

  const handleAlertClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOptionSelect = (option) => {
    setSelectedAlert(option);
    setShowDropdown(false);
  };

  const handleConfirm = () => {
    onSelectAlert(selectedAlert);
    setShowDropdown(false);
  };

  const handleCustomClick = () => {
    onSelectAlert('Custom');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" onClick={(e) => e.stopPropagation()}>
      <div className="reminder-modal bg-white rounded-2xl p-8 w-[500px] shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Reminder</h2>
          <button
            onClick={handleCustomClick}
            className="px-6 py-2 bg-[#F3BE08] text-black rounded-lg font-medium hover:bg-amber-500 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Custom
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-center mb-6">
          Stay on track! When should Bloom Up remind you about this?
        </p>

        {/* Alert Section */}
        <div className="mb-8">
          <div className="relative">
            {/* Alert Label with Dropdown Trigger */}
            <button
              onClick={handleAlertClick}
              className="w-full text-left mb-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black text-lg">Alert</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {/* Dropdown Options */}
            {showDropdown && (
              <div className="mt-2 bg-white border-2 border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                {alertOptions.map((option, index) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      selectedAlert === option
                        ? 'bg-[#238D88] text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    } ${index !== alertOptions.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Show selected option when dropdown is closed */}
            {!showDropdown && selectedAlert && (
              <div className="mt-2 px-4 py-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">{selectedAlert}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
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

export default ReminderModal;