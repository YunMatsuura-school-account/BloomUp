import React, { useState, useEffect } from 'react';

const ReminderModal = ({ 
  isOpen, 
  onClose, 
  onSelectAlert, 
  event, 
  customDaysPreview, 
  existingReminder,
  showDatePicker = false,
  productName = null
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState('None');
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false); // NEW: Controls calendar popup

  const formatCustomDaysDisplay = (days) => {
    if (!days) return null;
    
    if (days < 0.001) {
      const seconds = Math.round(days * 24 * 60 * 60);
      return `${seconds} second${seconds > 1 ? 's' : ''} before`;
    }
    
    if (Math.abs(days - 0.0035) < 0.0001) return '5 minutes before';
    if (Math.abs(days - 0.0104) < 0.0001) return '15 minutes before';
    if (Math.abs(days - 0.0417) < 0.001) return '1 hour before';
    
    if (days < 1) {
      const totalMinutes = Math.round(days * 24 * 60);
      if (totalMinutes < 60) {
        return `${totalMinutes} minute${totalMinutes > 1 ? 's' : ''} before`;
      }
      const hours = Math.round(days * 24);
      return `${hours} hour${hours > 1 ? 's' : ''} before`;
    }
    
    const displayDays = Math.round(days);
    return `${displayDays} day${displayDays > 1 ? 's' : ''} before`;
  };

  useEffect(() => {
    if (isOpen && event) {
      setShowDropdown(false);
      setSelectedDate(null);
      setCurrentMonth(new Date());
      setShowCalendar(false); // Reset calendar popup
      
      if (existingReminder) {
        if (existingReminder.customAlert && existingReminder.customDays !== null) {
          const displayText = formatCustomDaysDisplay(existingReminder.customDays);
          setSelectedAlert(displayText || 'Custom');
        } else {
          setSelectedAlert(existingReminder.alert || 'None');
        }
      } else {
        setSelectedAlert('None');
      }
    }
  }, [isOpen, event, existingReminder]);

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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleDayClick = (day) => {
    if (!day) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDaySelected = (day) => {
    if (!day || !selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const formatDateDisplay = (date) => {
    if (!date) return null;
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      dayName: date.toLocaleString('en-US', { weekday: 'long' })
    };
  };

  const startFormatted = selectedDate ? formatDateDisplay(selectedDate) : null;
  const endDate = selectedDate ? new Date(selectedDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null;
  const endFormatted = endDate ? formatDateDisplay(endDate) : null;
  const monthYearDisplay = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const handleAlertClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOptionSelect = (option) => {
    setSelectedAlert(option);
    setShowDropdown(false);
  };

  const handleConfirm = () => {
    if (showDatePicker && !selectedDate) {
      alert('Please select a date');
      return;
    }

    if (showDatePicker) {
      onSelectAlert(selectedAlert, selectedDate);
    } else {
      onSelectAlert(selectedAlert);
    }
    
    setShowDropdown(false);
  };

  const handleCustomClick = () => {
    // When Custom is clicked, we need to signal to the parent
    // The parent will close this modal and open CustomReminderModal
    // Pass 'Custom' as the alert type, with current selectedDate (or null)
    onSelectAlert('Custom', selectedDate);
  };

  // NEW: Handle "Enter Date" click
  const handleEnterDateClick = () => {
    setShowCalendar(true);
  };

  // NEW: Handle calendar save
  const handleCalendarSave = () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }
    setShowCalendar(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-2xl p-6 shadow-2xl relative overflow-y-auto w-[606px] h-[393px]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-black">
              {showDatePicker ? 'Set Restock Date' : 'Reminder'}
            </h2>
            {showDatePicker && productName && (
              <p className="text-sm text-gray-600 mt-1">
                When do you want to restock <span className="font-semibold">{productName}</span>?
              </p>
            )}
          </div>
          <button
            onClick={handleCustomClick}
            className="px-4 py-2 bg-[#F3BE08] text-black rounded-lg font-medium hover:bg-amber-500 transition-colors flex items-center gap-2 text-sm whitespace-nowrap ml-3"
          >
            Custom <span className="text-lg">+</span>
          </button>
        </div>

        {/* Description (only show if not date picker mode) */}
        {!showDatePicker && (
          <p className="text-gray-700 text-center mb-6 text-sm">
            Stay on track! When should Bloom Up remind you about this?
          </p>
        )}

        {/* Date Picker Section */}
        {showDatePicker && (
          <div className="mb-6">
            {/* Date and Time Section */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-black mb-3">Date and Time</h3>
              
              {/* Enter Date Button */}
              <button
                onClick={handleEnterDateClick}
                className="w-full text-left transition-colors mb-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {selectedDate 
                      ? `${startFormatted.day} ${startFormatted.month} ${startFormatted.year} (${startFormatted.dayName})`
                      : 'Enter Date'
                    }
                  </span>
                  
                </div>
              </button>

              {/* Time Setting Button (placeholder for now) */}
              <button
                className="w-full text-left  transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Time Setting</span>
                  
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Alert Section */}
        <div className="mb-6">
          <div className="relative">
            {/* Alert Label with Dropdown Trigger */}
            <button
              onClick={handleAlertClick}
              className="w-full text-left  transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-black block mb-1">Alert</span>
                  <span className="text-sm text-gray-600">{selectedAlert}</span>
                </div>
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto shadow-lg z-10">
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-[#238D88] text-white rounded-lg font-medium hover:bg-[#1a6b67] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={showDatePicker && !selectedDate}
          >
            Confirm
          </button>
        </div>
      </div>

      {/* Calendar Popup Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4" onClick={() => setShowCalendar(false)}>
          <div className="bg-white rounded-2xl p-6 w-[606px] h-[506px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Calendar Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-black">Date</h3>
              
              {/* Selected Date Display */}
              {/* <div className="grid grid-cols-2 gap-4  p-1 "> */}
                {/* <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Starts</p>
                  {startFormatted ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-800">
                          {startFormatted.day}
                        </span>
                        <span className="text-sm text-gray-600">
                          {startFormatted.month} {startFormatted.year}
                          <p className="text-xs text-gray-500 mt-1">
                        {startFormatted.dayName}
                      </p>
                        </span>
                      </div>
                     
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Select date</p>
                  )}
                </div> */}

                {/* <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Ends</p>
                  {endFormatted ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-400">
                          {endFormatted.day}
                        </span>
                        <span className="text-sm text-gray-400">
                          {endFormatted.month} {endFormatted.year}
                          <p className="text-xs text-gray-400 mt-1">
                        {endFormatted.dayName}
                      </p>
                        </span>
                      </div>
                      
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">+2 days</p>
                  )}
                </div> */}
              {/* </div> */}
            </div>

            {/* Calendar */}
            <div className="mb-4">
              {/* Month Navigation */}
              <div className="p-2 border-2 border-gray-300 w-[557px]  h-[267px] rounded-lg">
              <div className="flex items-center justify-between mb-4 ">
                <h3 className="font-semibold text-gray-800 text-sm">{monthYearDisplay}</h3>

                <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                </div>
              </div>
           

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 ">
                {['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1 h-[14px] w-[32px]">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    disabled={!day}
                    className={`
                      h-[24px] w-[32px] rounded-lg text-sm font-medium transition-all
                      ${!day ? 'invisible' : ''}
                      ${isDaySelected(day) 
                        ? 'bg-[#238D88] text-white shadow-md' 
                        : isToday(day)
                        ? 'bg-gray-200 text-gray-800 font-bold'
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            </div>

            {/* Calendar Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCalendar(false)}
                className="flex-1 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCalendarSave}
                className="flex-1 px-6 py-2.5 bg-[#238D88] text-white rounded-lg font-medium hover:bg-[#1a6b67] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderModal;