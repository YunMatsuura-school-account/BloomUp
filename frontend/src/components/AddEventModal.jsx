// frontend/src/components/AddEventModal.jsx
import React, { useState, useEffect } from 'react';
import ChildAvatar from './ChildAvatar';

const ALERT_OPTIONS = [
  'At time of event',
  '5 minutes before',
  '15 minutes before',
  '1 hour before',
  '1 day before'
];

export default function AddEventModal({ isOpen, onClose, onSaved, initialData = null }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [selectedChild, setSelectedChild] = useState(
    initialData?.children && initialData.children.length === 1 ? initialData.children[0] : 'All'
  );
  const [category, setCategory] = useState(initialData?.category || 'Others');
  const [startDate, setStartDate] = useState(initialData?.startDate ? formatForInput(initialData.startDate) : '');
  const [endDate, setEndDate] = useState(initialData?.endDate ? formatForInput(initialData.endDate) : '');
  const [alertTime, setAlertTime] = useState(initialData?.alert || 'At time of event');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [attachments, setAttachments] = useState(
    Array.isArray(initialData?.attachments)
      ? initialData.attachments.join(', ')
      : (initialData?.attachments || '')
  );

  // Time selection states
  const [startTime, setStartTime] = useState(initialData?.startDate ? getTimeFromDate(initialData.startDate) : '12:00');
  const [endTime, setEndTime] = useState(initialData?.endDate ? getTimeFromDate(initialData.endDate) : '13:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeFor, setEditingTimeFor] = useState('start'); // 'start' or 'end'

  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showAddCategoryPanel, setShowAddCategoryPanel] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Others');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [childrenList, setChildrenList] = useState([]);

  // Custom dropdown states
  const [showChildrenDropdown, setShowChildrenDropdown] = useState(false);

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load categories and children
  // Load categories and children
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // Load categories
        const categoriesRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }

        // Load children using the same approach as sidebar - get user data first
        const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('User data with children:', userData);

          if (userData.children && userData.children.length > 0) {
            // Fetch detailed child information for each child ID
            const detailedChildren = await Promise.all(
              userData.children.map(async (childId) => {
                try {
                  const childRes = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/users/${userData.id}/children/${childId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  if (childRes.ok) {
                    const childData = await childRes.json();
                    return childData.child || childData; // Return the full child object
                  }
                  return null;
                } catch (error) {
                  console.error(`Error fetching child ${childId}:`, error);
                  return null;
                }
              })
            );

            // Filter out any null values and set the children list
            const validChildren = detailedChildren.filter(child => child !== null);
            console.log('Detailed children data for dropdown:', validChildren);
            setChildrenList(validChildren);
          } else {
            console.log('No children found for user');
            setChildrenList([]);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [isOpen]);

  // Reset form when opening modal or when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSelectedChild(
        initialData.children && initialData.children.length === 1 ?
          initialData.children[0] : 'All'
      );
      setCategory(initialData.category || 'Others');
      setSelectedCategory(initialData.category || 'Others');
      setStartDate(initialData.startDate ? formatForInput(initialData.startDate) : '');
      setEndDate(initialData.endDate ? formatForInput(initialData.endDate) : '');
      setStartTime(initialData.startDate ? getTimeFromDate(initialData.startDate) : '12:00');
      setEndTime(initialData.endDate ? getTimeFromDate(initialData.endDate) : '13:00');
      setAlertTime(initialData.alert || 'At time of event');
      setNotes(initialData.notes || '');
      setUrl(initialData.url || '');
      setAttachments(
        Array.isArray(initialData.attachments)
          ? initialData.attachments.join(', ')
          : (initialData.attachments || '')
      );

      // Set temp dates for date picker
      if (initialData.startDate) {
        setTempStartDate(new Date(initialData.startDate));
      }
      if (initialData.endDate) {
        setTempEndDate(new Date(initialData.endDate));
      }

      setShowCategoryPopup(false);
      setShowAddCategoryPanel(false);
      setSaving(false);
      setDeleting(false);
    } else if (isOpen) {
      setTitle('');
      setSelectedChild('All');
      setCategory('Others');
      setSelectedCategory('Others');
      setStartDate('');
      setEndDate('');
      setStartTime('12:00');
      setEndTime('13:00');
      setAlertTime('At time of event');
      setNotes('');
      setUrl('');
      setAttachments('');
      setTempStartDate(null);
      setTempEndDate(null);
      setShowCategoryPopup(false);
      setShowAddCategoryPanel(false);
      setSaving(false);
      setDeleting(false);
    }
  }, [initialData, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showChildrenDropdown && !event.target.closest('.children-dropdown-container')) {
        setShowChildrenDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChildrenDropdown]);

  // Helper function to extract time from date
  function getTimeFromDate(dateString) {
    if (!dateString) return '12:00';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Get selected child name for display
  const getSelectedChildName = () => {
    if (selectedChild === 'All') return 'All Children';
    const child = childrenList.find(c => c._id === selectedChild);
    return child ? child.name : 'Select Child';
  };

  // Calendar functions
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

  const handleDayClick = (day, isStartDate = true) => {
    if (!day) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);

    if (isStartDate) {
      setTempStartDate(date);
      // Combine selected date with current time
      const [hours, minutes] = startTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      setStartDate(formatForInput(date));
    } else {
      setTempEndDate(date);
      // Combine selected date with current time
      const [hours, minutes] = endTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      setEndDate(formatForInput(date));
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDaySelected = (day, isStartDate = true) => {
    if (!day) return false;
    const selectedDate = isStartDate ? tempStartDate : tempEndDate;
    if (!selectedDate) return false;
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

  const startFormatted = tempStartDate ? formatDateDisplay(tempStartDate) : null;
  const endFormatted = tempEndDate ? formatDateDisplay(tempEndDate) : null;
  const monthYearDisplay = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Handle category selection
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // Save selected category
  const handleSaveCategory = () => {
    setCategory(selectedCategory);
    setShowCategoryPopup(false);
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ category: newCategoryName })
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(prev => [...prev, data.category]);
        setSelectedCategory(data.category.category);
        setNewCategoryName('');
        setShowAddCategoryPanel(false);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  // Save event
  async function handleSave() {
    // VALIDATION FOR REQUIRED FIELDS
    if (!title || !title.trim()) {
      window.alert('Please provide an event title.');
      return;
    }

    if (!startDate) {
      window.alert('Please provide a start date/time.');
      return;
    }

    if (!category || category === '') {
      window.alert('Please select a category.');
      return;
    }

    // Build children payload
    let childrenPayload = [];
    if (selectedChild && selectedChild !== 'All') {
      childrenPayload = [selectedChild];
    } else if (childrenList.length > 0) {
      childrenPayload = childrenList.map(child => child._id);
    }

    // VALIDATE: At least one child should be selected
    if (childrenPayload.length === 0) {
      window.alert('Please select at least one child or "All Children".');
      return;
    }

    // Combine date and time for start date
    let finalStartDate = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    finalStartDate.setHours(startHours, startMinutes, 0, 0);

    // Combine date and time for end date (if provided)
    let finalEndDate = null;
    if (endDate && endDate.trim()) {
      finalEndDate = new Date(endDate);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      finalEndDate.setHours(endHours, endMinutes, 0, 0);
    }

    // FIXED: Proper handling for attachments (can be string or array)
    let attachmentsPayload = [];
    if (Array.isArray(attachments)) {
      attachmentsPayload = attachments.filter(a => a && a.trim && a.trim() !== '');
    } else if (typeof attachments === 'string' && attachments.trim()) {
      attachmentsPayload = [attachments.trim()];
    }

    const payload = {
      title: title.trim(),
      children: childrenPayload,
      color: '#006F69',
      category: category,
      startDate: finalStartDate.toISOString(),
      alert: alertTime || '',
      notes: notes || '', // Empty string is fine
      url: url || '', // Empty string is fine
      attachments: attachmentsPayload
    };

    // Add endDate only if provided
    if (finalEndDate) {
      payload.endDate = finalEndDate.toISOString();
    }

    const method = initialData?._id ? 'PUT' : 'POST';
    const urlPath = initialData?._id
      ? `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData._id}`
      : `${import.meta.env.VITE_BACKEND_URL}/api/calendar`;

    setSaving(true);
    try {
      const resp = await fetch(urlPath, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await resp.text();

      let data = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          throw new Error(`Server returned invalid JSON. Status: ${resp.status}`);
        }
      }

      if (!resp.ok) {
        const errorMessage = data.message ||
          data.error ||
          data.errors?.join(', ') ||
          `HTTP ${resp.status}: ${resp.statusText}`;
        throw new Error(errorMessage);
      }

      // Call onSaved callback if provided (parent handles modal close)
      // Otherwise, close modal directly
      if (onSaved) {
        onSaved(data.event || data);
      } else {
        onClose();
      }

    } catch (err) {
      console.error('❌ Save error:', err);
      window.alert(`Could not save event: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // Delete event
  async function handleDelete() {
    if (!initialData?._id) {
      window.alert('No event to delete.');
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    const urlPath = `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData._id}`;

    setDeleting(true);
    try {
      const resp = await fetch(urlPath, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const responseText = await resp.text();

      let data = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          throw new Error(`Server returned invalid JSON. Status: ${resp.status}`);
        }
      }

      if (!resp.ok) {
        const errorMessage = data.message ||
          data.error ||
          data.errors?.join(', ') ||
          `HTTP ${resp.status}: ${resp.statusText}`;
        throw new Error(errorMessage);
      }

      // Call onSaved callback if provided (parent handles modal close)
      // Otherwise, close modal directly
      if (onSaved) {
        onSaved(null); // Pass null to indicate deletion
      } else {
        onClose();
      }

    } catch (err) {
      console.error('❌ Delete error:', err);
      window.alert(`Could not delete event: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {initialData ? 'Edit Event' : 'Add Event'}
        </h3>

        {/* Title - No label, just placeholder */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter Event Title"
          className="w-full border-b-2 border-gray-300 px-2 py-3 mb-4 focus:outline-none focus:border-[#238D88] text-gray-700 placeholder-gray-400"
        />

        {/* Category Dropdown */}
        <div className="mb-4">
          <button
            onClick={() => setShowCategoryPopup(true)}
            className="w-full bg-[#F3BE08] text-black rounded-lg px-4 py-3 font-medium flex justify-between items-center hover:bg-amber-500 transition-colors"
          >
            <span>{category}</span>
            <span>▼</span>
          </button>
        </div>

        {/* Select Children Dropdown with Label and Custom Dropdown */}
        {/* Select Children Dropdown */}
        <div className="mb-4 children-dropdown-container">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select the child that will be assigned to the event
          </label>
          <div className="relative">
            <button
              onClick={() => setShowChildrenDropdown(!showChildrenDropdown)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-[#238D88] text-gray-700 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                {selectedChild !== 'All' ? (
                  <>
                    <ChildAvatar
                      child={childrenList.find(c => c._id === selectedChild)}
                      width={24}
                      height={24}
                    />
                    <span>{getSelectedChildName()}</span>
                  </>
                ) : (
                  <span>{getSelectedChildName()}</span>
                )}
              </div>
              <span>▼</span>
            </button>

            {/* Custom Dropdown Menu */}
            {showChildrenDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {/* All Children Option */}
                <button
                  onClick={() => {
                    setSelectedChild('All');
                    setShowChildrenDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${selectedChild === 'All' ? 'bg-[#238D88] text-white' : 'text-gray-700'
                    }`}
                >
                  <span>All Children</span>
                </button>

                {/* Individual Children Options */}
                {childrenList.map(child => (
                  <button
                    key={child._id}
                    onClick={() => {
                      setSelectedChild(child._id);
                      setShowChildrenDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${selectedChild === child._id ? 'bg-[#238D88] text-white' : 'text-gray-700'
                      }`}
                  >
                    <ChildAvatar child={child} width={24} height={24} />
                    <span>{child.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date and Time Heading */}
        <h4 className="text-black font-semibold mb-3">Date and Time</h4>

        {/* Start and End Date with Time Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStartDatePicker(true)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-left focus:outline-none focus:border-[#238D88] text-gray-700 bg-white text-sm"
              >
                {startDate ? new Date(startDate).toLocaleDateString() : "Select date"}
              </button>
              <button
                onClick={() => {
                  setEditingTimeFor('start');
                  setShowTimePicker(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#238D88] text-gray-700 bg-white text-sm"
              >
                {startTime}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEndDatePicker(true)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-left focus:outline-none focus:border-[#238D88] text-gray-700 bg-white text-sm"
              >
                {endDate ? new Date(endDate).toLocaleDateString() : "Select date"}
              </button>
              <button
                onClick={() => {
                  setEditingTimeFor('end');
                  setShowTimePicker(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#238D88] text-gray-700 bg-white text-sm"
              >
                {endTime}
              </button>
            </div>
          </div>
        </div>

        {/* Alert Dropdown */}
        <div className="mb-4">
          <select
            value={alertTime}
            onChange={e => setAlertTime(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#238D88] text-gray-700"
          >
            {ALERT_OPTIONS.map(alert => (
              <option key={alert} value={alert}>{alert}</option>
            ))}
          </select>
        </div>

        {/* Notes, URL, Attachments */}
        <div className="space-y-3 mb-6">
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes"
            className="w-full border-b-2 border-gray-300 px-2 py-3 focus:outline-none focus:border-[#238D88] text-gray-700 placeholder-gray-400"
          />
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Add URL"
            className="w-full border-b-2 border-gray-300 px-2 py-3 focus:outline-none focus:border-[#238D88] text-gray-700 placeholder-gray-400"
          />
          <input
            value={attachments}
            onChange={e => setAttachments(e.target.value)}
            placeholder="Add attachments"
            className="w-full border-b-2 border-gray-300 px-2 py-3 focus:outline-none focus:border-[#238D88] text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Save, Cancel, and Delete Buttons */}
        <div className="flex justify-between gap-3">
          {/* Delete Button - Only show when editing */}
          {initialData && (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          {/* Spacer when Delete button is shown */}
          {initialData && <div className="flex-1"></div>}
          {/* Cancel and Save Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving || deleting}
              className="px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="px-6 py-2 bg-[#238D88] text-white rounded hover:bg-[#1d7470] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : (initialData ? 'Save Changes' : 'Save')}
            </button>
          </div>
        </div>

        {/* Category Popup */}
        {showCategoryPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Select Category</h4>
                <button
                  onClick={() => {
                    setShowCategoryPopup(false);
                    setShowAddCategoryPanel(true);
                  }}
                  className="bg-[#F3BE08] text-black px-3 py-1 rounded text-sm font-medium hover:bg-amber-500 transition-colors"
                >
                  Add Category +
                </button>
              </div>

              {/* Category List */}
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {categories.map(cat => (
                  <div key={cat._id} className="flex items-center gap-3 py-2">
                    <input
                      type="radio"
                      id={cat._id}
                      name="category"
                      checked={selectedCategory === cat.category}
                      onChange={() => handleCategorySelect(cat.category)}
                      className="w-4 h-4 text-[#238D88] focus:ring-[#238D88]"
                    />
                    <label htmlFor={cat._id} className="text-gray-700">
                      {cat.category}
                    </label>
                  </div>
                ))}
              </div>

              {/* Category Popup Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowCategoryPopup(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-[#238D88] text-white rounded hover:bg-[#1d7470] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Category as separate popup */}
        {showAddCategoryPanel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              <h5 className="font-semibold text-gray-800 mb-3">Add New Category</h5>
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-[#238D88] text-gray-700 placeholder-gray-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddCategoryPanel(false);
                    setNewCategoryName(''); // Clear the input
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-[#238D88] text-white rounded hover:bg-[#1d7470] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-lg font-semibold mb-4">
                Select {editingTimeFor === 'start' ? 'Start' : 'End'} Time
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time (24-hour format)
                </label>
                <input
                  type="time"
                  value={editingTimeFor === 'start' ? startTime : endTime}
                  onChange={(e) => {
                    if (editingTimeFor === 'start') {
                      setStartTime(e.target.value);
                    } else {
                      setEndTime(e.target.value);
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#238D88]"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTimePicker(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowTimePicker(false)}
                  className="px-4 py-2 bg-[#238D88] text-white rounded hover:bg-[#1d7470] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Date Picker Modal */}
        {(showStartDatePicker || showEndDatePicker) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4" onClick={() => {
            setShowStartDatePicker(false);
            setShowEndDatePicker(false);
          }}>
            <div className="bg-white rounded-2xl p-6 w-[606px] h-[506px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Calendar Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-black">Select {showStartDatePicker ? 'Start' : 'End'} Date</h3>

                {/* Selected Date Display */}
                <div className="grid grid-cols-2 gap-4 p-1">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      {showStartDatePicker ? 'Starts' : 'Ends'}
                    </p>
                    {showStartDatePicker && startFormatted ? (
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
                    ) : showEndDatePicker && endFormatted ? (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-800">
                            {endFormatted.day}
                          </span>
                          <span className="text-sm text-gray-600">
                            {endFormatted.month} {endFormatted.year}
                            <p className="text-xs text-gray-500 mt-1">
                              {endFormatted.dayName}
                            </p>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Select date</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="mb-4">
                <div className="p-2 border-2 border-gray-300 w-[557px] h-[267px] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
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
                  <div className="grid grid-cols-7 gap-1">
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
                        onClick={() => handleDayClick(day, showStartDatePicker)}
                        disabled={!day}
                        className={`
                          h-[24px] w-[32px] rounded-lg text-sm font-medium transition-all
                          ${!day ? 'invisible' : ''}
                          ${isDaySelected(day, showStartDatePicker)
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
                  onClick={() => {
                    setShowStartDatePicker(false);
                    setShowEndDatePicker(false);
                  }}
                  className="flex-1 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowStartDatePicker(false);
                    setShowEndDatePicker(false);
                  }}
                  className="flex-1 px-6 py-2.5 bg-[#238D88] text-white rounded-lg font-medium hover:bg-[#1a6b67] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatForInput(isoOrDate) {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}