// // frontend/src/components/AddEventModal.jsx
// frontend/src/components/AddEventModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import ChildAvatar from './ChildAvatar';

const ALERT_OPTIONS = [
  'None',
  '5 minutes before',
  '15 minutes before',
  '30 minutes before',
  '1 hour before',
  '2 hour before',
  '1 day before',
  '2 day before'
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

  // Category states
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Others');

  // Date picker states
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Alert panel states
  const [customAlertText, setCustomAlertText] = useState('');

  // Active panel state
  const [activePanel, setActivePanel] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [childrenList, setChildrenList] = useState([]);
  const [showChildrenDropdown, setShowChildrenDropdown] = useState(false);


  useEffect(() => {
    // This prevents the modal from closing when typing in inputs
    const handleMouseDown = (e) => {
      // If the click is on an input or textarea, don't close any panels
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        e.stopPropagation();
      }
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, []);

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

        // Load children
        const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('User data with children:', userData);

          if (userData.children && userData.children.length > 0) {
            const detailedChildren = await Promise.all(
              userData.children.map(async (childId) => {
                try {
                  const childRes = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/users/${userData.id}/children/${childId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  if (childRes.ok) {
                    const childData = await childRes.json();
                    return childData.child || childData;
                  }
                  return null;
                } catch (error) {
                  console.error(`Error fetching child ${childId}:`, error);
                  return null;
                }
              })
            );

            const validChildren = detailedChildren.filter(child => child !== null);
            setChildrenList(validChildren);
          } else {
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

      if (initialData.startDate) {
        setTempStartDate(new Date(initialData.startDate));
      }
      if (initialData.endDate) {
        setTempEndDate(new Date(initialData.endDate));
      }

      setActivePanel(null);
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
      setActivePanel(null);
      setSaving(false);
      setDeleting(false);
    }
  }, [initialData, isOpen]);

  // Helper functions
  function getTimeFromDate(dateString) {
    if (!dateString) return '12:00';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const getSelectedChildName = () => {
    if (selectedChild === 'All') return 'All Children';
    const child = childrenList.find(c => c._id === selectedChild);
    return child ? child.name : 'Select Child';
  };

  const getSelectedChild = () => {
    if (selectedChild === 'All') return null;
    return childrenList.find(c => c._id === selectedChild);
  };

  // Format time for display (03.00 am format)
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours);
    const period = hourNum >= 12 ? 'pm' : 'am';
    const displayHour = hourNum % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}.${minutes} ${period}`;
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const handleDayClick = (day) => {
    if (!day) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);

    if (!tempStartDate) {
      setTempStartDate(date);
    } else if (!tempEndDate && date >= tempStartDate) {
      setTempEndDate(date);
    } else {
      setTempStartDate(date);
      setTempEndDate(null);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDaySelected = (day) => {
    if (!day) return false;
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (tempStartDate && tempEndDate) {
      return selectedDate >= tempStartDate && selectedDate <= tempEndDate;
    } else if (tempStartDate) {
      return selectedDate.getTime() === tempStartDate.getTime();
    }
    return false;
  };

  const isStartDate = (day) => {
    if (!day || !tempStartDate) return false;
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return selectedDate.getTime() === tempStartDate.getTime();
  };

  const isEndDate = (day) => {
    if (!day || !tempEndDate) return false;
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return selectedDate.getTime() === tempEndDate.getTime();
  };

  const handleSaveDate = () => {
    if (tempStartDate) {
      const [hours, minutes] = startTime.split(':').map(Number);
      tempStartDate.setHours(hours, minutes, 0, 0);
      setStartDate(formatForInput(tempStartDate));
    }
    if (tempEndDate) {
      const [hours, minutes] = endTime.split(':').map(Number);
      tempEndDate.setHours(hours, minutes, 0, 0);
      setEndDate(formatForInput(tempEndDate));
    }
    setActivePanel(null);
  };

  // Format date display for the calendar header
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

  // Time Picker Component
  const TimePicker = () => {
    const [selectedHour, setSelectedHour] = useState('12');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const [selectedPeriod, setSelectedPeriod] = useState('AM');
    const [selectedEndHour, setSelectedEndHour] = useState('01');
    const [selectedEndMinute, setSelectedEndMinute] = useState('00');
    const [selectedEndPeriod, setSelectedEndPeriod] = useState('PM');

    useEffect(() => {
      // Set start time
      const [startHours, startMinutes] = startTime.split(':');
      const startHourNum = parseInt(startHours);
      if (startHourNum >= 12) {
        setSelectedPeriod('PM');
        setSelectedHour(startHourNum === 12 ? '12' : String(startHourNum - 12).padStart(2, '0'));
      } else {
        setSelectedPeriod('AM');
        setSelectedHour(startHourNum === 0 ? '12' : String(startHourNum).padStart(2, '0'));
      }
      setSelectedMinute(startMinutes);

      // Set end time
      const [endHours, endMinutes] = endTime.split(':');
      const endHourNum = parseInt(endHours);
      if (endHourNum >= 12) {
        setSelectedEndPeriod('PM');
        setSelectedEndHour(endHourNum === 12 ? '12' : String(endHourNum - 12).padStart(2, '0'));
      } else {
        setSelectedEndPeriod('AM');
        setSelectedEndHour(endHourNum === 0 ? '12' : String(endHourNum).padStart(2, '0'));
      }
      setSelectedEndMinute(endMinutes);
    }, [startTime, endTime]);

    const handleSaveTime = () => {
      // Convert start time to 24-hour format
      let startHour24 = parseInt(selectedHour);
      if (selectedPeriod === 'PM' && startHour24 !== 12) {
        startHour24 += 12;
      } else if (selectedPeriod === 'AM' && startHour24 === 12) {
        startHour24 = 0;
      }
      const newStartTime = `${String(startHour24).padStart(2, '0')}:${selectedMinute}`;

      // Convert end time to 24-hour format
      let endHour24 = parseInt(selectedEndHour);
      if (selectedEndPeriod === 'PM' && endHour24 !== 12) {
        endHour24 += 12;
      } else if (selectedEndPeriod === 'AM' && endHour24 === 12) {
        endHour24 = 0;
      }
      const newEndTime = `${String(endHour24).padStart(2, '0')}:${selectedEndMinute}`;

      setStartTime(newStartTime);
      setEndTime(newEndTime);
      setActivePanel(null);
    };

    const TimeColumn = ({
      selectedValue,
      setSelectedValue,
      items,
      isStart = true,
      type
    }) => {
      const columnRef = useRef(null);

      useEffect(() => {
        if (columnRef.current) {
          const selectedElement = columnRef.current.querySelector(`[data-value="${selectedValue}"]`);
          if (selectedElement) {
            selectedElement.scrollIntoView({
              block: 'center',
              behavior: 'smooth'
            });
          }
        }
      }, [selectedValue]);

      const handleItemClick = (item) => {
        setSelectedValue(item);
      };

      return (
        <div className="relative h-24 overflow-hidden">
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-6 bg-[#F3BE08] opacity-20 rounded pointer-events-none"></div>

          <div
            ref={columnRef}
            className="h-full overflow-y-auto"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <div
              className="py-10 space-y-0.5"
              style={{
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  data-value={item}
                  className={`h-6 flex items-center justify-center cursor-pointer text-[14px] font-nunito font-light leading-5 tracking-[0.05px] rounded transition-colors ${selectedValue === item
                    ? 'text-[#238D88] font-semibold'
                    : 'text-[#238D88] hover:bg-[#F3BE08] hover:bg-opacity-20'
                    }`}
                  onClick={() => handleItemClick(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    const minuteItems = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    return (
      <div className="bg-white rounded-[10px] w-full h-full flex flex-col">
        <div className="w-full flex flex-col justify-start items-start gap-2 p-4">
          <div className="self-stretch flex flex-col justify-center items-center gap-4">
            <div className="self-stretch flex flex-col justify-center items-center gap-3">
              <div className="self-stretch justify-start items-start gap-2 inline-flex">
                <div className="text-center flex flex-col justify-center text-[#232527] text-[20px] font-dm-sans font-semibold">
                  Time
                </div>
              </div>

              <div className="w-full">
                <div className="self-stretch relative overflow-hidden">
                  {/* Start Time Section */}
                  <div className="mb-4">
                    <div className="text-[14px] font-dm-sans font-medium text-[#232527] mb-2">Start Time</div>
                    <div className="flex items-center justify-center gap-1 bg-white rounded-lg p-2">
                      <div className="w-12">
                        <TimeColumn
                          selectedValue={selectedHour}
                          setSelectedValue={setSelectedHour}
                          items={Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))}
                          isStart={true}
                          type="hour"
                        />
                      </div>

                      <div className="w-3 text-center text-[#219653] text-[14px] font-nunito font-light leading-5 tracking-[0.05px]">
                        :
                      </div>

                      <div className="w-12">
                        <TimeColumn
                          selectedValue={selectedMinute}
                          setSelectedValue={setSelectedMinute}
                          items={minuteItems}
                          isStart={true}
                          type="minute"
                        />
                      </div>

                      <div className="w-12">
                        <TimeColumn
                          selectedValue={selectedPeriod}
                          setSelectedValue={setSelectedPeriod}
                          items={['AM', 'PM']}
                          isStart={true}
                          type="period"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Time Section */}
                  <div>
                    <div className="text-[14px] font-dm-sans font-medium text-[#232527] mb-2">End Time</div>
                    <div className="flex items-center justify-center gap-1 bg-white rounded-lg p-2">
                      <div className="w-12">
                        <TimeColumn
                          selectedValue={selectedEndHour}
                          setSelectedValue={setSelectedEndHour}
                          items={Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))}
                          isStart={false}
                          type="hour"
                        />
                      </div>

                      <div className="w-3 text-center text-[#219653] text-[14px] font-nunito font-light leading-5 tracking-[0.05px]">
                        :
                      </div>

                      <div className="w-12">
                        <TimeColumn
                          selectedValue={selectedEndMinute}
                          setSelectedValue={setSelectedEndMinute}
                          items={minuteItems}
                          isStart={false}
                          type="minute"
                        />
                      </div>

                      <div className="w-12">
                        <TimeColumn
                          selectedValue={selectedEndPeriod}
                          setSelectedValue={setSelectedEndPeriod}
                          items={['AM', 'PM']}
                          isStart={false}
                          type="period"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center gap-4 mt-2">
              <button
                onClick={() => setActivePanel(null)}
                className="w-28 px-4 py-2 bg-white border border-gray-300 rounded text-[#444444] text-[12px] font-dm-sans font-normal leading-[20px] tracking-[0.3px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTime}
                className="w-28 px-4 py-2 bg-[#238D88] text-white rounded text-[12px] font-dm-sans font-semibold leading-[20px] tracking-[0.3px] hover:bg-[#1d7470] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Category functions
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleSaveCategory = () => {
    setCategory(selectedCategory);
    setActivePanel(null);
  };

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
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  // Delete category function
  const handleDeleteCategory = async (categoryId, categoryName) => {
    try {
      const token = localStorage.getItem("accessToken");

      const confirmed = window.confirm(`Are you sure you want to delete the category "${categoryName}"?`);
      if (!confirmed) return;

      console.log('Attempting to delete category:', categoryId, categoryName);

      const deleteRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const result = await deleteRes.json();
      console.log('Delete category response:', result);

      if (deleteRes.ok) {
        setCategories(prev => prev.filter(cat => cat._id !== categoryId));

        if (selectedCategory === categoryName) {
          setSelectedCategory('Others');
          setCategory('Others');
        }

        alert('Category deleted successfully');
      } else {
        alert(result.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  // Alert functions
  const handleAlertSelect = (alert) => {
    setAlertTime(alert);
    setActivePanel(null);
  };

  const handleCustomAlertSave = () => {
    if (customAlertText.trim()) {
      setAlertTime(customAlertText);
      setActivePanel(null);
    }
  };

  // Notes/URL/Attachments Panel Component
  // Notes Panel Component - Compact header with original input styling
  const NotesPanel = () => {
    const [tempNotes, setTempNotes] = useState(notes);
    const [tempUrl, setTempUrl] = useState(url);
    const [tempAttachments, setTempAttachments] = useState(attachments);

    const handleSaveNotes = () => {
      setNotes(tempNotes);
      setUrl(tempUrl);
      setAttachments(tempAttachments);
      setActivePanel(null);
    };

    const handleCancel = () => {
      setActivePanel(null);
    };

    return (
      <div className="bg-white rounded-[10px] w-full h-full flex flex-col">
        <div className="w-full h-full flex flex-col justify-start items-start gap-2 p-4">
          <div className="self-stretch flex flex-col justify-start items-center gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              {/* Header - Compact version */}
              <div className="self-stretch justify-between items-center inline-flex">
                <div className="justify-center flex flex-col text-black text-[22px] font-dm-sans font-semibold leading-[24px] tracking-[0.30px]">
                  Add Notes, URL, or Attachments
                </div>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                {/* Notes Section - Original styling */}
                <div className="w-full">
                  <div className="text-[16px] font-dm-sans font-medium text-[#232527] mb-2">Add notes</div>
                  <div className="flex items-center border-b-2 border-gray-300 px-2 py-3 focus-within:border-[#238D88]">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <input
                      type="text"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Add notes"
                      className="flex-1 focus:outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                    />
                  </div>
                </div>

                {/* URL Section - Original styling */}
                <div className="w-full">
                  <div className="text-[16px] font-dm-sans font-medium text-[#232527] mb-2">URL</div>
                  <div className="flex items-center border-b-2 border-gray-300 px-2 py-3 focus-within:border-[#238D88]">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <input
                      type="url"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      placeholder="Add URL"
                      className="flex-1 focus:outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                    />
                  </div>
                </div>

                {/* Attachments Section - Original styling */}
                <div className="w-full">
                  <div className="text-[16px] font-dm-sans font-medium text-[#232527] mb-2">Attachments</div>
                  <div className="flex items-center border-b-2 border-gray-300 px-2 py-3 focus-within:border-[#238D88]">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <input
                      type="text"
                      value={tempAttachments}
                      onChange={(e) => setTempAttachments(e.target.value)}
                      placeholder="Add attachments"
                      className="flex-1 focus:outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons - Matching Category Panel Style */}
            <div className="w-full justify-center items-center gap-6 inline-flex">
              <button
                onClick={handleCancel}
                className="w-28 px-4 py-2 bg-white border border-gray-300 rounded text-[#444444] text-[12px] font-dm-sans font-normal leading-[20px] tracking-[0.3px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="w-28 px-4 py-2 bg-[#238D88] text-white rounded text-[12px] font-dm-sans font-semibold leading-[20px] tracking-[0.3px] hover:bg-[#1d7470] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Category Panel Component
  const CategoryPanel = () => {
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [localNewCategoryName, setLocalNewCategoryName] = useState('');
    const addCategoryInputRef = useRef(null);

    useEffect(() => {
      if (showAddCategory && addCategoryInputRef.current) {
        addCategoryInputRef.current.focus();
      }
    }, [showAddCategory]);

    const handleAddCategoryClick = () => {
      setShowAddCategory(true);
      setLocalNewCategoryName('');
    };

    const handleSaveNewCategory = async () => {
      if (!localNewCategoryName.trim()) {
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
          body: JSON.stringify({ category: localNewCategoryName })
        });

        if (res.ok) {
          const data = await res.json();
          setCategories(prev => [...prev, data.category]);
          setSelectedCategory(data.category.category);
          setShowAddCategory(false);
          setLocalNewCategoryName('');
        } else {
          const error = await res.json();
          alert(error.message || 'Failed to add category');
        }
      } catch (error) {
        console.error('Error adding category:', error);
        alert('Failed to add category');
      }
    };

    const handleCancelAddCategory = () => {
      setShowAddCategory(false);
      setLocalNewCategoryName('');
    };

    return (
      <div className="bg-white rounded-[10px] w-full h-full flex flex-col">
        <div className="w-full h-full flex flex-col justify-start items-start gap-2 p-4">
          <div className="self-stretch flex flex-col justify-start items-center gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              {/* Header */}
              <div className="self-stretch justify-between items-center inline-flex">
                <div className="text-black text-[22px] font-dm-sans font-semibold">
                  Category Name
                </div>
                {!showAddCategory && (
                  <button
                    onClick={handleAddCategoryClick}
                    className="w-40 h-8 px-4 bg-[#F3BE08] rounded-[5px] justify-center items-center gap-2.5 inline-flex"
                  >
                    <div className="text-black text-[14px] font-dm-sans font-normal">
                      Add Category +
                    </div>
                  </button>
                )}
              </div>

              {showAddCategory ? (
                <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-sm font-medium text-gray-700 mb-2">Add New Category</div>
                  <input
                    ref={addCategoryInputRef}
                    type="text"
                    value={localNewCategoryName}
                    onChange={(e) => setLocalNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveNewCategory();
                      }
                      if (e.key === 'Escape') {
                        handleCancelAddCategory();
                      }
                    }}
                    placeholder="Enter category name..."
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2 text-[14px] focus:outline-none focus:border-[#238D88] text-gray-700 focus:ring-2 focus:ring-[#238D88] focus:ring-opacity-20 bg-white"
                  />
                  <p className="text-xs text-gray-500 mb-3">Suggestions: Medical, Stationary, etc.</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelAddCategory}
                      className="w-28 px-4 py-2 bg-white border border-gray-300 rounded text-[#444444] text-[12px] font-dm-sans font-normal hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNewCategory}
                      className="w-28 px-4 py-2 bg-[#238D88] text-white rounded text-[12px] font-dm-sans font-semibold hover:bg-[#1d7470] transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Category List */}
                  <div className="w-full max-h-48 overflow-y-auto flex flex-col justify-start items-start gap-2">
                    {categories.map(cat => (
                      <div key={cat._id} className="w-full flex items-center justify-between gap-3 p-1.5 rounded transition-colors hover:bg-gray-100">
                        <button
                          onClick={() => handleCategorySelect(cat.category)}
                          className="flex-1 flex items-center gap-3 text-left"
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedCategory === cat.category
                              ? 'border-[#F3BE08] bg-[#F3BE08]'
                              : 'border-gray-300 bg-white'
                              }`}
                          >
                            {selectedCategory === cat.category && (
                              <div className="w-1.5 h-1.5 bg-[#F3BE08] rounded-full"></div>
                            )}
                          </div>
                          <div className={`text-[14px] font-dm-sans font-normal ${selectedCategory === cat.category ? 'text-[#238D88] font-semibold' : 'text-black'
                            }`}>
                            {cat.category}
                          </div>
                        </button>

                        {cat.createdBy && (
                          <button
                            onClick={() => handleDeleteCategory(cat._id, cat.category)}
                            className="p-0.5 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete Category"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full flex justify-center gap-6 mt-4">
                    <button
                      onClick={() => setActivePanel(null)}
                      className="w-28 px-4 py-2 bg-white border border-gray-300 rounded text-[#444444] text-[12px] font-dm-sans font-normal hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCategory}
                      className="w-28 px-4 py-2 bg-[#238D88] text-white rounded text-[12px] font-dm-sans font-semibold hover:bg-[#1d7470] transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Date Picker Panel Component
  const DatePickerPanel = () => {
    return (
      <div className="bg-white rounded-[10px] w-full h-full flex flex-col">
        <div className="w-full flex flex-col justify-start items-start gap-2 p-4 h-full">
          <h3 className="text-xl font-semibold text-[#232527] mb-2 text-center w-full">Date</h3>

          {/* Compact Date Display Header */}
          <div className="flex justify-between items-center mb-3 w-full">
            <div className="w-40">
              <div className="text-[12px] font-dm-sans font-medium text-black mb-1">Starts</div>
              {startFormatted ? (
                <div className="flex items-baseline gap-1">
                  <div className="text-[28px] font-dm-sans font-bold text-black leading-[20px]">
                    {startFormatted.day}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[12px] font-dm-sans font-normal text-black leading-tight">
                      {startFormatted.month} {startFormatted.year}
                    </div>
                    <div className="text-[12px] font-dm-sans font-normal text-black leading-tight">
                      {startFormatted.dayName}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-xs">Select start date</div>
              )}
            </div>

            <div className="w-40">
              <div className={`text-[12px] font-dm-sans font-medium ${endFormatted ? 'text-black' : 'text-[#A0A0A0]'} mb-1`}>
                Ends
              </div>
              {endFormatted ? (
                <div className="flex items-baseline gap-1">
                  <div className={`text-[28px] font-dm-sans font-bold ${endFormatted ? 'text-black' : 'text-[#A0A0A0]'} leading-[20px]`}>
                    {endFormatted.day}
                  </div>
                  <div className="flex flex-col">
                    <div className={`text-[12px] font-dm-sans font-normal ${endFormatted ? 'text-black' : 'text-[#777777]'} leading-tight`}>
                      {endFormatted.month} {endFormatted.year}
                    </div>
                    <div className={`text-[12px] font-dm-sans font-normal ${endFormatted ? 'text-black' : 'text-[#777777]'} leading-tight`}>
                      {endFormatted.dayName}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-xs">Select end date</div>
              )}
            </div>
          </div>

          {/* Compact Calendar - Fixed Height */}
          <div className="w-full flex-1 min-h-0">
            <div className="border border-[#A0A0A0] rounded-lg p-3 w-full h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[14px] font-dm-sans font-semibold text-[#202020]">
                  {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="flex gap-1">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M15 19L8 12L15 5" stroke="#444444" strokeWidth="2" />
                    </svg>
                  </button>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5L16 12L9 19" stroke="#444444" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-[11px] font-dm-sans font-normal text-[#C1C1C1] py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days - Compact */}
              <div className="grid grid-cols-7 gap-1 min-h-[120px]">
                {calendarDays.map((day, index) => (
                  <div key={index} className="flex items-center justify-center min-h-[18px]">
                    <button
                      onClick={() => handleDayClick(day)}
                      disabled={!day}
                      className={`
                      w-6 h-6 text-[11px] font-dm-sans font-semibold rounded transition-all flex items-center justify-center
                      ${!day ? 'invisible' : ''}
                      ${isStartDate(day) || isEndDate(day) ? 'bg-[#F3BE08] text-black' : ''}
                      ${isDaySelected(day) && !isStartDate(day) && !isEndDate(day) ? 'bg-[#F3BE08] bg-opacity-30' : ''}
                      ${!isDaySelected(day) ? 'hover:bg-gray-100 text-[#202020]' : ''}
                    `}
                    >
                      {day}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 w-full mt-3">
            <button
              onClick={() => setActivePanel(null)}
              className="w-28 px-4 py-2 bg-white border border-gray-300 rounded text-[#444444] text-[12px] font-dm-sans font-normal leading-[20px] tracking-[0.3px] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDate}
              className="w-28 px-4 py-2 bg-[#238D88] text-white rounded text-[12px] font-dm-sans font-semibold leading-[20px] tracking-[0.3px] hover:bg-[#1d7470] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Alert Panel Component
  const AlertPanel = () => {
    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [localCustomAlertText, setLocalCustomAlertText] = useState('');

    const handleCustomAlertSave = () => {
      if (localCustomAlertText.trim()) {
        setAlertTime(localCustomAlertText);
        setActivePanel(null);
      }
    };

    if (showCustomAlert) {
      return (
        <div className="bg-white rounded-[10px] w-full h-full flex flex-col">
          <div className="w-full h-full flex flex-col justify-start items-start gap-2 p-4">
            <h3 className="text-xl font-bold text-black text-center mb-2 w-full">Customize your alert</h3>
            <p className="text-center text-gray-600 text-[14px] mb-3 w-full">
              Write your own custom alert date for getting reminder for this item!
            </p>
            <div className="mb-4 w-full">
              <label className="block text-gray-700 text-[14px] mb-1">Alert</label>
              <input
                type="text"
                value={localCustomAlertText}
                onChange={e => setLocalCustomAlertText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomAlertSave();
                  }
                }}
                placeholder="Ex: before 5 days"
                className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[#238D88] text-gray-700"
                autoFocus
              />
            </div>
            <div className="flex justify-center gap-2 w-full">
              <button
                onClick={() => {
                  setShowCustomAlert(false);
                  setLocalCustomAlertText('');
                }}
                className="w-28 px-4 py-2 bg-white border border-gray-300 rounded text-[#444444] text-[12px] font-dm-sans font-normal hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomAlertSave}
                className="w-28 px-4 py-2 bg-[#238D88] text-white rounded text-[12px] font-dm-sans font-semibold hover:bg-[#1d7470] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[10px] w-full h-full flex flex-col">
        <div className="w-full h-full flex flex-col justify-start items-start gap-2 p-4">
          <div className="flex justify-between items-center mb-3 w-full">
            <h3 className="text-lg font-semibold text-gray-800">Select Alert Time</h3>
            <button
              onClick={() => setShowCustomAlert(true)}
              className="px-2 py-1 bg-[#F3BE08] text-black rounded text-[12px] font-medium hover:bg-amber-500 transition-colors"
            >
              Custom +
            </button>
          </div>
          <div className="space-y-1 mb-3 w-full">
            {ALERT_OPTIONS.map(option => (
              <button
                key={option}
                onClick={() => handleAlertSelect(option)}
                className="w-full px-3 py-2 text-left hover:bg-[#238D88] hover:text-white transition-colors rounded-lg text-[14px]"
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 w-full">
            <button
              onClick={() => setActivePanel(null)}
              className="w-28 px-4 py-2 bg-white border border-gray-300 rounded text-[#444444] text-[12px] font-dm-sans font-normal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setActivePanel(null)}
              className="w-28 px-4 py-2 bg-[#238D88] text-white rounded text-[12px] font-dm-sans font-semibold hover:bg-[#1d7470] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Save event function
  async function handleSave() {
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

    let childrenPayload = [];
    if (selectedChild && selectedChild !== 'All') {
      childrenPayload = [selectedChild];
    } else if (childrenList.length > 0) {
      childrenPayload = childrenList.map(child => child._id);
    }

    if (childrenPayload.length === 0) {
      window.alert('Please select at least one child or "All Children".');
      return;
    }

    let finalStartDate = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    finalStartDate.setHours(startHours, startMinutes, 0, 0);

    let finalEndDate = null;
    if (endDate && endDate.trim()) {
      finalEndDate = new Date(endDate);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      finalEndDate.setHours(endHours, endMinutes, 0, 0);
    }

    let attachmentsPayload = [];
    if (Array.isArray(attachments)) {
      attachmentsPayload = attachments.filter(a => a && a.trim && a.trim() !== '');
    } else if (typeof attachments === 'string' && attachments.trim()) {
      attachmentsPayload = [attachments.trim()];
    }

    const getChildSpecificColor = (childrenIds, childrenList) => {
      if (childrenIds.length !== 1 || childrenIds[0] === 'All') {
        return '#006F69';
      }

      const child = childrenList.find(c => c._id === childrenIds[0]);
      if (child && child.backgroundColor) {
        return child.backgroundColor;
      }

      return '#006F69';
    };

    const payload = {
      title: title.trim(),
      children: childrenPayload,
      color: getChildSpecificColor(childrenPayload, childrenList),
      category: category,
      startDate: finalStartDate.toISOString(),
      alert: alertTime || '',
      notes: notes || '',
      url: url || '',
      attachments: attachmentsPayload
    };

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

  // Delete event function
  async function handleDelete() {
    if (!initialData?._id) {
      window.alert('No event to delete.');
      return;
    }

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

      if (onSaved) {
        onSaved(null);
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

  // Get display text for date and time inputs
  const getDateDisplayText = () => {
    if (tempStartDate && tempEndDate) {
      return `${formatDateForDisplay(tempStartDate)} → ${formatDateForDisplay(tempEndDate)}`;
    } else if (tempStartDate) {
      return `${formatDateForDisplay(tempStartDate)} → Select end date`;
    } else if (startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : null;
      return end
        ? `${formatDateForDisplay(start)} → ${formatDateForDisplay(end)}`
        : `${formatDateForDisplay(start)} → Select end date`;
    }
    return 'Select Start and end Date';
  };

  const getTimeDisplayText = () => {
    if (startTime && endTime) {
      return `${formatTimeForDisplay(startTime)} → ${formatTimeForDisplay(endTime)}`;
    }
    return 'Select Start and End time';
  };

  const selectedChildData = getSelectedChild();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      {/* Main Modal Container */}
      <div className="bg-white rounded-[10px] w-[606px]">
        <div className="w-full bg-white flex flex-col justify-start items-start gap-2.5 p-6">
          <div className="self-stretch flex flex-col justify-start items-center gap-4">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">

              {/* Show event title and basic info when panel is active */}
              {activePanel && (
                <div className="w-full mb-4">
                  <div className="flex items-center gap-4">
                    {selectedChild !== 'All' && selectedChildData && (
                      <div className="w-10 h-10 bg-zinc-300 rounded-full overflow-hidden flex-shrink-0">
                        <ChildAvatar child={selectedChildData} width={40} height={40} />
                      </div>
                    )}
                    <div className="relative flex-1">
                      <div className="text-[28px] font-poppins font-semibold leading-[24px] tracking-[0.30px] text-[#232527]">
                        {title || 'New Event'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Creating event for: {getSelectedChildName()}
                  </div>
                </div>
              )}

              {/* Main content based on active panel */}
              {activePanel === 'category' ? (
                <CategoryPanel />
              ) : activePanel === 'date' ? (
                <DatePickerPanel />
              ) : activePanel === 'time' ? (
                <TimePicker />
              ) : activePanel === 'alert' ? (
                <AlertPanel />
              ) : activePanel === 'notes' ? (
                <NotesPanel />
              ) : (
                // Default main form
                <>
                  {/* Title Section with Trash Icon for Edit Mode */}
                  <div className="justify-between items-center gap-4 inline-flex w-full">
                    <div className="flex items-center gap-4">
                      {/* Show circle only when NOT "All Children" */}
                      {selectedChild !== 'All' && selectedChildData && (
                        <div className="w-10 h-10 bg-zinc-300 rounded-full overflow-hidden flex-shrink-0">
                          <ChildAvatar child={selectedChildData} width={40} height={40} />
                        </div>
                      )}
                      {/* Don't show circle when "All Children" is selected */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter Event Title"
                          className="w-full bg-transparent border-none outline-none text-[28px] font-poppins font-semibold leading-[24px] tracking-[0.30px] placeholder-[#A0A0A0] text-[#232527] focus:outline-none focus:border-none p-0"
                          style={{
                            minHeight: '32px'
                          }}
                        />
                        {!title && (
                          <div className="absolute inset-0 pointer-events-none text-[#A0A0A0] text-[28px] font-poppins font-semibold leading-[24px] tracking-[0.30px]">
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trash Icon - Only show in Edit mode */}
                    {initialData && (
                      <div className="relative group">
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex items-center gap-2 p-1 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Event"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Category Section */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    <div className="self-stretch justify-center flex flex-col text-black text-[18px] font-dm-sans font-semibold leading-[22px] tracking-[0.30px]">
                      Category
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setActivePanel('category')}
                        className="w-48 h-9 px-4 bg-[#F3BE08] rounded-[6px] justify-between items-center inline-flex text-black text-[14px] font-dm-sans font-normal leading-[20px] tracking-[0.30px] hover:bg-[#e0ab07] transition-colors border border-gray-300"
                      >
                        <span>{category || 'Select Category'}</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Select Children Section */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    <div className="self-stretch justify-center flex flex-col text-black text-[14px] font-dm-sans font-normal leading-[20px] tracking-[0.30px]">
                      Select the child that will be assigned to the event
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowChildrenDropdown(!showChildrenDropdown)}
                        className="w-48 h-9 bg-[#238D88] border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:border-[#238D88] text-white flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          {selectedChild !== 'All' ? (
                            <>
                              <ChildAvatar
                                child={childrenList.find(c => c._id === selectedChild)}
                                width={20}
                                height={20}
                              />
                              <span className="text-white text-[14px]">
                                {getSelectedChildName()}
                              </span>
                            </>
                          ) : (
                            <span className="text-white text-[14px]">
                              {getSelectedChildName()}
                            </span>
                          )}
                        </div>

                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showChildrenDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          <button
                            onClick={() => {
                              setSelectedChild('All');
                              setShowChildrenDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors text-[14px] ${selectedChild === 'All' ? 'bg-[#238D88] text-white' : 'text-gray-700'}`}
                          >
                            <span>All Children</span>
                          </button>

                          {childrenList.map(child => (
                            <button
                              key={child._id}
                              onClick={() => {
                                setSelectedChild(child._id);
                                setShowChildrenDropdown(false);
                              }}
                              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors text-[14px] ${selectedChild === child._id ? 'bg-[#238D88] text-white' : 'text-gray-700'}`}
                            >
                              <ChildAvatar child={child} width={20} height={20} />
                              <span>{child.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="self-stretch h-0 outline outline-1 outline-[#BFBFBF] outline-offset-[-1px]"></div>

                  {/* Date and Time Section */}
                  <div className="w-full flex flex-col justify-start items-start gap-1">
                    <div className="self-stretch justify-center flex flex-col text-black text-[18px] font-dm-sans font-semibold leading-[22px] tracking-[0.30px]">
                      Date and Time
                    </div>
                    <div className="w-full flex flex-col justify-start items-start gap-1">
                      {/* Date Button */}
                      <button
                        onClick={() => setActivePanel('date')}
                        className="w-full max-w-md justify-center flex flex-col text-[#777777] text-[14px] font-dm-sans font-medium leading-[20px] tracking-[0.30px] hover:text-black transition-colors text-left py-1"
                      >
                        {getDateDisplayText() || 'Enter Date'}
                      </button>
                      {/* Time Button */}
                      <button
                        onClick={() => setActivePanel('time')}
                        className="w-full max-w-md justify-center flex flex-col text-[#777777] text-[14px] font-dm-sans font-medium leading-[20px] tracking-[0.30px] hover:text-black transition-colors text-left py-1"
                      >
                        {getTimeDisplayText() || 'Time Setting'}
                      </button>
                    </div>
                  </div>

                  {/* Alert Section */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    <div className="self-stretch justify-center flex flex-col text-black text-[18px] font-dm-sans font-semibold leading-[22px] tracking-[0.30px]">
                      Alert
                    </div>
                    <button
                      onClick={() => setActivePanel('alert')}
                      className="self-stretch px-2 py-1.5 rounded border border-[#BFBFBF] justify-between items-start inline-flex hover:bg-gray-50 transition-colors"
                    >
                      <div className="justify-center flex flex-col text-black text-[14px] font-dm-sans font-normal leading-[20px] tracking-[0.30px]">
                        {alertTime}
                      </div>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Add Notes, URL or Attachments Link */}
                  <div className="mt-2">
                    <button
                      onClick={() => setActivePanel('notes')}
                      className="self-stretch justify-center flex flex-col text-black text-[14px] font-dm-sans font-semibold underline leading-[20px] tracking-[0.30px] hover:text-[#238D88] transition-colors text-left"
                    >
                      Add Notes, URL, or Attachments
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full flex justify-center gap-6 mt-2">
                    <button
                      onClick={onClose}
                      disabled={saving || deleting}
                      className="w-24 px-4 py-1.5 bg-white border border-gray-300 rounded-[5px] text-[#444444] text-[12px] font-dm-sans font-normal leading-[18px] tracking-[0.3px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || deleting}
                      className="px-4 py-1.5 bg-[#238D88] text-white rounded-[5px] hover:bg-[#1d7470] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[12px] font-dm-sans font-semibold leading-[18px] tracking-[0.3px]"
                    >
                      {saving ? 'Saving...' : (initialData ? 'Update' : 'Confirm')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
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



// old code
// frontend/src/components/AddEventModal.jsx
// frontend/src/components/AddEventModal.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import ChildAvatar from './ChildAvatar';

// const ALERT_OPTIONS = [
//   'None',
//   '5 minutes before',
//   '15 minutes before',
//   '30 minutes before',
//   '1 hour before',
//   '2 hour before',
//   '1 day before',
//   '2 day before'
// ];

// export default function AddEventModal({ isOpen, onClose, onSaved, initialData = null }) {
//   const [title, setTitle] = useState(initialData?.title || '');
//   const [selectedChild, setSelectedChild] = useState(
//     initialData?.children && initialData.children.length === 1 ? initialData.children[0] : 'All'
//   );
//   const [category, setCategory] = useState(initialData?.category || 'Others');
//   const [startDate, setStartDate] = useState(initialData?.startDate ? formatForInput(initialData.startDate) : '');
//   const [endDate, setEndDate] = useState(initialData?.endDate ? formatForInput(initialData.endDate) : '');
//   const [alertTime, setAlertTime] = useState(initialData?.alert || 'At time of event');
//   const [notes, setNotes] = useState(initialData?.notes || '');
//   const [url, setUrl] = useState(initialData?.url || '');
//   const [attachments, setAttachments] = useState(
//     Array.isArray(initialData?.attachments)
//       ? initialData.attachments.join(', ')
//       : (initialData?.attachments || '')
//   );

//   // Time selection states
//   const [startTime, setStartTime] = useState(initialData?.startDate ? getTimeFromDate(initialData.startDate) : '12:00');
//   const [endTime, setEndTime] = useState(initialData?.endDate ? getTimeFromDate(initialData.endDate) : '13:00');
//   const [showTimePicker, setShowTimePicker] = useState(false);

//   // Category states
//   const [showCategoryPanel, setShowCategoryPanel] = useState(false);
//   const [showAddCategoryPanel, setShowAddCategoryPanel] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [newCategoryName, setNewCategoryName] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('Others');

//   // Date picker states - now as modal
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [tempStartDate, setTempStartDate] = useState(null);
//   const [tempEndDate, setTempEndDate] = useState(null);
//   const [currentMonth, setCurrentMonth] = useState(new Date());

//   // Alert panel states
//   const [showAlertPanel, setShowAlertPanel] = useState(false);
//   const [showCustomAlertPanel, setShowCustomAlertPanel] = useState(false);
//   const [customAlertText, setCustomAlertText] = useState('');

//   const [saving, setSaving] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [childrenList, setChildrenList] = useState([]);
//   const [showChildrenDropdown, setShowChildrenDropdown] = useState(false);

//   // Load categories and children
//   useEffect(() => {
//     if (!isOpen) return;

//     const loadData = async () => {
//       try {
//         const token = localStorage.getItem("accessToken");
//         if (!token) return;

//         // Load categories
//         const categoriesRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (categoriesRes.ok) {
//           const categoriesData = await categoriesRes.json();
//           setCategories(categoriesData.categories || []);
//         }

//         // Load children
//         const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (userRes.ok) {
//           const userData = await userRes.json();
//           console.log('User data with children:', userData);

//           if (userData.children && userData.children.length > 0) {
//             const detailedChildren = await Promise.all(
//               userData.children.map(async (childId) => {
//                 try {
//                   const childRes = await fetch(
//                     `${import.meta.env.VITE_BACKEND_URL}/api/users/${userData.id}/children/${childId}`,
//                     { headers: { Authorization: `Bearer ${token}` } }
//                   );

//                   if (childRes.ok) {
//                     const childData = await childRes.json();
//                     return childData.child || childData;
//                   }
//                   return null;
//                 } catch (error) {
//                   console.error(`Error fetching child ${childId}:`, error);
//                   return null;
//                 }
//               })
//             );

//             const validChildren = detailedChildren.filter(child => child !== null);
//             setChildrenList(validChildren);
//           } else {
//             setChildrenList([]);
//           }
//         }
//       } catch (error) {
//         console.error("Error loading data:", error);
//       }
//     };

//     loadData();
//   }, [isOpen]);

//   // Reset form when opening modal or when initialData changes
//   useEffect(() => {
//     if (initialData) {
//       setTitle(initialData.title || '');
//       setSelectedChild(
//         initialData.children && initialData.children.length === 1 ?
//           initialData.children[0] : 'All'
//       );
//       setCategory(initialData.category || 'Others');
//       setSelectedCategory(initialData.category || 'Others');
//       setStartDate(initialData.startDate ? formatForInput(initialData.startDate) : '');
//       setEndDate(initialData.endDate ? formatForInput(initialData.endDate) : '');
//       setStartTime(initialData.startDate ? getTimeFromDate(initialData.startDate) : '12:00');
//       setEndTime(initialData.endDate ? getTimeFromDate(initialData.endDate) : '13:00');
//       setAlertTime(initialData.alert || 'At time of event');
//       setNotes(initialData.notes || '');
//       setUrl(initialData.url || '');
//       setAttachments(
//         Array.isArray(initialData.attachments)
//           ? initialData.attachments.join(', ')
//           : (initialData.attachments || '')
//       );

//       if (initialData.startDate) {
//         setTempStartDate(new Date(initialData.startDate));
//       }
//       if (initialData.endDate) {
//         setTempEndDate(new Date(initialData.endDate));
//       }

//       setShowCategoryPanel(false);
//       setShowAddCategoryPanel(false);
//       setShowAlertPanel(false);
//       setShowCustomAlertPanel(false);
//       setSaving(false);
//       setDeleting(false);
//     } else if (isOpen) {
//       setTitle('');
//       setSelectedChild('All');
//       setCategory('Others');
//       setSelectedCategory('Others');
//       setStartDate('');
//       setEndDate('');
//       setStartTime('12:00');
//       setEndTime('13:00');
//       setAlertTime('At time of event');
//       setNotes('');
//       setUrl('');
//       setAttachments('');
//       setTempStartDate(null);
//       setTempEndDate(null);
//       setShowCategoryPanel(false);
//       setShowAddCategoryPanel(false);
//       setShowAlertPanel(false);
//       setShowCustomAlertPanel(false);
//       setSaving(false);
//       setDeleting(false);
//     }
//   }, [initialData, isOpen]);

//   // Helper functions
//   function getTimeFromDate(dateString) {
//     if (!dateString) return '12:00';
//     const date = new Date(dateString);
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     return `${hours}:${minutes}`;
//   }

//   const getSelectedChildName = () => {
//     if (selectedChild === 'All') return 'All Children';
//     const child = childrenList.find(c => c._id === selectedChild);
//     return child ? child.name : 'Select Child';
//   };



//   // Format time for display (03.00 am format)
//   const formatTimeForDisplay = (timeString) => {
//     if (!timeString) return '';
//     const [hours, minutes] = timeString.split(':');
//     const hourNum = parseInt(hours);
//     const period = hourNum >= 12 ? 'pm' : 'am';
//     const displayHour = hourNum % 12 || 12;
//     return `${String(displayHour).padStart(2, '0')}.${minutes} ${period}`;
//   };

//   // Format date for display
//   const formatDateForDisplay = (date) => {
//     if (!date) return '';
//     const d = new Date(date);
//     return d.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   // Calendar functions
//   const getDaysInMonth = (date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const daysInMonth = lastDay.getDate();
//     const startingDayOfWeek = firstDay.getDay();
//     return { daysInMonth, startingDayOfWeek };
//   };

//   const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

//   const calendarDays = [];
//   for (let i = 0; i < startingDayOfWeek; i++) {
//     calendarDays.push(null);
//   }
//   for (let day = 1; day <= daysInMonth; day++) {
//     calendarDays.push(day);
//   }

//   const handleDayClick = (day) => {
//     if (!day) return;
//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
//     const date = new Date(year, month, day);

//     if (!tempStartDate) {
//       setTempStartDate(date);
//     } else if (!tempEndDate && date >= tempStartDate) {
//       setTempEndDate(date);
//     } else {
//       setTempStartDate(date);
//       setTempEndDate(null);
//     }
//   };

//   const handlePrevMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
//   };

//   const handleNextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
//   };

//   const isDaySelected = (day) => {
//     if (!day) return false;
//     const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

//     if (tempStartDate && tempEndDate) {
//       return selectedDate >= tempStartDate && selectedDate <= tempEndDate;
//     } else if (tempStartDate) {
//       return selectedDate.getTime() === tempStartDate.getTime();
//     }
//     return false;
//   };

//   const isStartDate = (day) => {
//     if (!day || !tempStartDate) return false;
//     const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
//     return selectedDate.getTime() === tempStartDate.getTime();
//   };

//   const isEndDate = (day) => {
//     if (!day || !tempEndDate) return false;
//     const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
//     return selectedDate.getTime() === tempEndDate.getTime();
//   };

//   const handleSaveDate = () => {
//     if (tempStartDate) {
//       const [hours, minutes] = startTime.split(':').map(Number);
//       tempStartDate.setHours(hours, minutes, 0, 0);
//       setStartDate(formatForInput(tempStartDate));
//     }
//     if (tempEndDate) {
//       const [hours, minutes] = endTime.split(':').map(Number);
//       tempEndDate.setHours(hours, minutes, 0, 0);
//       setEndDate(formatForInput(tempEndDate));
//     }
//     setShowDatePicker(false);
//   };

//   // Format date display for the calendar header
//   const formatDateDisplay = (date) => {
//     if (!date) return null;
//     return {
//       day: date.getDate(),
//       month: date.toLocaleString('en-US', { month: 'short' }),
//       year: date.getFullYear(),
//       dayName: date.toLocaleString('en-US', { weekday: 'long' })
//     };
//   };

//   const startFormatted = tempStartDate ? formatDateDisplay(tempStartDate) : null;
//   const endFormatted = tempEndDate ? formatDateDisplay(tempEndDate) : null;

//   // Date Picker Component - Now as modal overlay
//   const DatePickerModal = () => {
//     return (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
//         <div className="bg-white rounded-lg w-[600px] p-6">
//           <h3 className="text-2xl font-semibold text-[#232527] mb-4 text-center">Date</h3>

//           {/* Date Display Header */}
//           <div className="flex justify-between items-center mb-6">
//             <div className="w-48">
//               <div className="text-[16px] font-dm-sans font-medium text-black mb-2">Starts</div>
//               {startFormatted ? (
//                 <div className="flex items-baseline gap-3">
//                   <div className="text-[60px] font-dm-sans font-bold text-black leading-[26px]">
//                     {startFormatted.day}
//                   </div>
//                   <div className="flex flex-col">
//                     <div className="text-[16px] font-dm-sans font-normal text-black">
//                       {startFormatted.month} {startFormatted.year}
//                     </div>
//                     <div className="text-[16px] font-dm-sans font-normal text-black">
//                       {startFormatted.dayName}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-gray-400">Select start date</div>
//               )}
//             </div>

//             <div className="w-48">
//               <div className={`text-[16px] font-dm-sans font-medium ${endFormatted ? 'text-black' : 'text-[#A0A0A0]'} mb-2`}>
//                 Ends
//               </div>
//               {endFormatted ? (
//                 <div className="flex items-baseline gap-3">
//                   <div className={`text-[60px] font-dm-sans font-bold ${endFormatted ? 'text-black' : 'text-[#A0A0A0]'} leading-[26px]`}>
//                     {endFormatted.day}
//                   </div>
//                   <div className="flex flex-col">
//                     <div className={`text-[16px] font-dm-sans font-normal ${endFormatted ? 'text-black' : 'text-[#777777]'}`}>
//                       {endFormatted.month} {endFormatted.year}
//                     </div>
//                     <div className={`text-[16px] font-dm-sans font-normal ${endFormatted ? 'text-black' : 'text-[#777777]'}`}>
//                       {endFormatted.dayName}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-gray-400">Select end date</div>
//               )}
//             </div>
//           </div>

//           {/* Calendar - Fixed container to prevent overflow */}
//           <div className="border border-[#A0A0A0] rounded-lg p-4 mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="text-[16px] font-dm-sans font-semibold text-[#202020]">
//                 {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
//               </div>
//               <div className="flex gap-2">
//                 <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
//                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//                     <path d="M15 19L8 12L15 5" stroke="#444444" strokeWidth="2" />
//                   </svg>
//                 </button>
//                 <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
//                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//                     <path d="M9 5L16 12L9 19" stroke="#444444" strokeWidth="2" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             {/* Weekday Headers */}
//             <div className="grid grid-cols-7 gap-1 mb-2">
//               {['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'].map((day) => (
//                 <div key={day} className="text-center text-[14px] font-dm-sans font-normal text-[#C1C1C1] py-1">
//                   {day}
//                 </div>
//               ))}
//             </div>

//             {/* Calendar Days - Fixed grid to prevent overflow */}
//             <div className="grid grid-cols-7 gap-1 min-h-[200px]">
//               {calendarDays.map((day, index) => (
//                 <div key={index} className="flex items-center justify-center min-h-[32px]">
//                   <button
//                     onClick={() => handleDayClick(day)}
//                     disabled={!day}
//                     className={`
//                       w-8 h-8 text-[14px] font-dm-sans font-semibold rounded transition-all flex items-center justify-center
//                       ${!day ? 'invisible' : ''}
//                       ${isStartDate(day) || isEndDate(day) ? 'bg-[#F3BE08] text-black' : ''}
//                       ${isDaySelected(day) && !isStartDate(day) && !isEndDate(day) ? 'bg-[#F3BE08] bg-opacity-30' : ''}
//                       ${!isDaySelected(day) ? 'hover:bg-gray-100 text-[#202020]' : ''}
//                     `}
//                   >
//                     {day}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex justify-center gap-8">
//             <button
//               onClick={() => setShowDatePicker(false)}
//               className="w-24 px-5 py-1 bg-white border border-gray-300 rounded text-[#444444] text-sm font-dm-sans font-normal leading-[26px] tracking-[0.3px]"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSaveDate}
//               className="w-24 px-5 py-1 bg-[#238D88] text-white rounded text-sm font-dm-sans font-semibold leading-[26px] tracking-[0.3px]"
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Time Picker Component - Updated to match sample design
//   const TimePicker = () => {
//     const [selectedHour, setSelectedHour] = useState('12');
//     const [selectedMinute, setSelectedMinute] = useState('00');
//     const [selectedPeriod, setSelectedPeriod] = useState('AM');
//     const [selectedEndHour, setSelectedEndHour] = useState('01');
//     const [selectedEndMinute, setSelectedEndMinute] = useState('00');
//     const [selectedEndPeriod, setSelectedEndPeriod] = useState('PM');

//     useEffect(() => {
//       // Set start time
//       const [startHours, startMinutes] = startTime.split(':');
//       const startHourNum = parseInt(startHours);
//       if (startHourNum >= 12) {
//         setSelectedPeriod('PM');
//         setSelectedHour(startHourNum === 12 ? '12' : String(startHourNum - 12).padStart(2, '0'));
//       } else {
//         setSelectedPeriod('AM');
//         setSelectedHour(startHourNum === 0 ? '12' : String(startHourNum).padStart(2, '0'));
//       }
//       setSelectedMinute(startMinutes);

//       // Set end time
//       const [endHours, endMinutes] = endTime.split(':');
//       const endHourNum = parseInt(endHours);
//       if (endHourNum >= 12) {
//         setSelectedEndPeriod('PM');
//         setSelectedEndHour(endHourNum === 12 ? '12' : String(endHourNum - 12).padStart(2, '0'));
//       } else {
//         setSelectedEndPeriod('AM');
//         setSelectedEndHour(endHourNum === 0 ? '12' : String(endHourNum).padStart(2, '0'));
//       }
//       setSelectedEndMinute(endMinutes);
//     }, [startTime, endTime]);

//     const handleSaveTime = () => {
//       // Convert start time to 24-hour format
//       let startHour24 = parseInt(selectedHour);
//       if (selectedPeriod === 'PM' && startHour24 !== 12) {
//         startHour24 += 12;
//       } else if (selectedPeriod === 'AM' && startHour24 === 12) {
//         startHour24 = 0;
//       }
//       const newStartTime = `${String(startHour24).padStart(2, '0')}:${selectedMinute}`;

//       // Convert end time to 24-hour format
//       let endHour24 = parseInt(selectedEndHour);
//       if (selectedEndPeriod === 'PM' && endHour24 !== 12) {
//         endHour24 += 12;
//       } else if (selectedEndPeriod === 'AM' && endHour24 === 12) {
//         endHour24 = 0;
//       }
//       const newEndTime = `${String(endHour24).padStart(2, '0')}:${selectedEndMinute}`;

//       setStartTime(newStartTime);
//       setEndTime(newEndTime);
//       setShowTimePicker(false);
//     };

//     const TimeColumn = ({
//       selectedValue,
//       setSelectedValue,
//       items,
//       isStart = true,
//       type
//     }) => {
//       const columnRef = useRef(null);

//       useEffect(() => {
//         // Scroll to selected item when component mounts
//         if (columnRef.current) {
//           const selectedElement = columnRef.current.querySelector(`[data-value="${selectedValue}"]`);
//           if (selectedElement) {
//             selectedElement.scrollIntoView({
//               block: 'center',
//               behavior: 'smooth'
//             });
//           }
//         }
//       }, [selectedValue]);

//       const handleItemClick = (item) => {
//         setSelectedValue(item);
//       };

//       return (
//         <div className="relative h-32 overflow-hidden">
//           {/* Selection highlight */}
//           <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-8 bg-[#F3BE08] opacity-20 rounded pointer-events-none"></div>

//           <div
//             ref={columnRef}
//             className="h-full overflow-y-auto"
//             style={{
//               msOverflowStyle: 'none',
//               scrollbarWidth: 'none',
//             }}
//           >
//             <div
//               className="py-12 space-y-1"
//               style={{
//                 WebkitOverflowScrolling: 'touch',
//               }}
//             >
//               {items.map((item, index) => (
//                 <div
//                   key={index}
//                   data-value={item}
//                   className={`h-8 flex items-center justify-center cursor-pointer text-[16px] font-nunito font-light leading-6 tracking-[0.05px] rounded transition-colors ${selectedValue === item
//                     ? 'text-[#238D88] font-semibold'
//                     : 'text-[#238D88] hover:bg-[#F3BE08] hover:bg-opacity-20'
//                     }`}
//                   onClick={() => handleItemClick(item)}
//                 >
//                   {item}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       );
//     };

//     // Generate minutes from 00 to 59
//     const minuteItems = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

//     return (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
//         <div className="bg-white rounded-[10px] w-full max-w-md p-6">
//           <div className="w-full flex flex-col justify-start items-start gap-2.5">
//             <div className="self-stretch flex flex-col justify-center items-center gap-6">
//               <div className="self-stretch flex flex-col justify-center items-center gap-5">
//                 <div className="self-stretch justify-start items-start gap-2.5 inline-flex">
//                   <div className="text-center flex flex-col justify-center text-[#232527] text-[24px] font-dm-sans font-semibold">
//                     Time
//                   </div>
//                 </div>

//                 <div className="w-full">
//                   <div className="self-stretch relative overflow-hidden">
//                     {/* Start Time Section */}
//                     <div className="mb-6">
//                       <div className="text-[16px] font-dm-sans font-medium text-[#232527] mb-3">Start Time</div>
//                       <div className="flex items-center justify-center gap-2 bg-white rounded-lg p-4">
//                         <div className="w-16">
//                           <TimeColumn
//                             selectedValue={selectedHour}
//                             setSelectedValue={setSelectedHour}
//                             items={Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))}
//                             isStart={true}
//                             type="hour"
//                           />
//                         </div>

//                         <div className="w-4 text-center text-[#219653] text-[16px] font-nunito font-light leading-6 tracking-[0.05px]">
//                           :
//                         </div>

//                         <div className="w-16">
//                           <TimeColumn
//                             selectedValue={selectedMinute}
//                             setSelectedValue={setSelectedMinute}
//                             items={minuteItems}
//                             isStart={true}
//                             type="minute"
//                           />
//                         </div>

//                         <div className="w-16">
//                           <TimeColumn
//                             selectedValue={selectedPeriod}
//                             setSelectedValue={setSelectedPeriod}
//                             items={['AM', 'PM']}
//                             isStart={true}
//                             type="period"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* End Time Section */}
//                     <div>
//                       <div className="text-[16px] font-dm-sans font-medium text-[#232527] mb-3">End Time</div>
//                       <div className="flex items-center justify-center gap-2 bg-white rounded-lg p-4">
//                         <div className="w-16">
//                           <TimeColumn
//                             selectedValue={selectedEndHour}
//                             setSelectedValue={setSelectedEndHour}
//                             items={Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))}
//                             isStart={false}
//                             type="hour"
//                           />
//                         </div>

//                         <div className="w-4 text-center text-[#219653] text-[16px] font-nunito font-light leading-6 tracking-[0.05px]">
//                           :
//                         </div>

//                         <div className="w-16">
//                           <TimeColumn
//                             selectedValue={selectedEndMinute}
//                             setSelectedValue={setSelectedEndMinute}
//                             items={minuteItems}
//                             isStart={false}
//                             type="minute"
//                           />
//                         </div>

//                         <div className="w-16">
//                           <TimeColumn
//                             selectedValue={selectedEndPeriod}
//                             setSelectedValue={setSelectedEndPeriod}
//                             items={['AM', 'PM']}
//                             isStart={false}
//                             type="period"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="w-full flex justify-center gap-4 mt-4">
//                 <button
//                   onClick={() => setShowTimePicker(false)}
//                   className="w-24 px-5 py-2 bg-white border border-gray-300 rounded text-[#444444] text-sm font-dm-sans font-normal leading-[26px] tracking-[0.3px] hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSaveTime}
//                   className="w-24 px-5 py-2 bg-[#238D88] text-white rounded text-sm font-dm-sans font-semibold leading-[26px] tracking-[0.3px] hover:bg-[#1d7470] transition-colors"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Category functions
//   const handleCategorySelect = (categoryName) => {
//     setSelectedCategory(categoryName);
//   };

//   const handleSaveCategory = () => {
//     setCategory(selectedCategory);
//     setShowCategoryPanel(false);
//   };

//   const handleAddCategory = async () => {
//     if (!newCategoryName.trim()) {
//       alert('Please enter a category name');
//       return;
//     }

//     try {
//       const token = localStorage.getItem("accessToken");
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({ category: newCategoryName })
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setCategories(prev => [...prev, data.category]);
//         setSelectedCategory(data.category.category);
//         setNewCategoryName('');
//         setShowAddCategoryPanel(false);
//       } else {
//         const error = await res.json();
//         alert(error.message || 'Failed to add category');
//       }
//     } catch (error) {
//       console.error('Error adding category:', error);
//       alert('Failed to add category');
//     }
//   };

//   // Alert functions
//   const handleAlertSelect = (alert) => {
//     setAlertTime(alert);
//     setShowAlertPanel(false);
//   };

//   const handleCustomAlertSave = () => {
//     if (customAlertText.trim()) {
//       setAlertTime(customAlertText);
//       setShowCustomAlertPanel(false);
//       setShowAlertPanel(false);
//     }
//   };

//   // Save event function
//   async function handleSave() {
//     // VALIDATION FOR REQUIRED FIELDS
//     if (!title || !title.trim()) {
//       window.alert('Please provide an event title.');
//       return;
//     }

//     if (!startDate) {
//       window.alert('Please provide a start date/time.');
//       return;
//     }

//     if (!category || category === '') {
//       window.alert('Please select a category.');
//       return;
//     }

//     // Build children payload
//     let childrenPayload = [];
//     if (selectedChild && selectedChild !== 'All') {
//       childrenPayload = [selectedChild];
//     } else if (childrenList.length > 0) {
//       childrenPayload = childrenList.map(child => child._id);
//     }

//     // VALIDATE: At least one child should be selected
//     if (childrenPayload.length === 0) {
//       window.alert('Please select at least one child or "All Children".');
//       return;
//     }

//     // Combine date and time for start date
//     let finalStartDate = new Date(startDate);
//     const [startHours, startMinutes] = startTime.split(':').map(Number);
//     finalStartDate.setHours(startHours, startMinutes, 0, 0);

//     // Combine date and time for end date (if provided)
//     let finalEndDate = null;
//     if (endDate && endDate.trim()) {
//       finalEndDate = new Date(endDate);
//       const [endHours, endMinutes] = endTime.split(':').map(Number);
//       finalEndDate.setHours(endHours, endMinutes, 0, 0);
//     }


//     // FIXED: Proper handling for attachments (can be string or array)
//     let attachmentsPayload = [];
//     if (Array.isArray(attachments)) {
//       attachmentsPayload = attachments.filter(a => a && a.trim && a.trim() !== '');
//     } else if (typeof attachments === 'string' && attachments.trim()) {
//       attachmentsPayload = [attachments.trim()];
//     }

//     const getChildSpecificColor = (childrenIds, childrenList) => {
//       // If multiple children or "All" selected, use default color
//       if (childrenIds.length !== 1 || childrenIds[0] === 'All') {
//         return '#006F69'; // Default color
//       }

//       // Find the specific child and use their background color
//       const child = childrenList.find(c => c._id === childrenIds[0]);
//       if (child && child.backgroundColor) {
//         return child.backgroundColor;
//       }

//       return '#006F69'; // Fallback to default
//     };


//     const payload = {
//       title: title.trim(),
//       children: childrenPayload,
//       color: getChildSpecificColor(childrenPayload, childrenList), // Use child-specific color
//       category: category,
//       startDate: finalStartDate.toISOString(),
//       alert: alertTime || '',
//       notes: notes || '',
//       url: url || '',
//       attachments: attachmentsPayload
//     };


//     // Add endDate only if provided
//     if (finalEndDate) {
//       payload.endDate = finalEndDate.toISOString();
//     }

//     const method = initialData?._id ? 'PUT' : 'POST';
//     const urlPath = initialData?._id
//       ? `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData._id}`
//       : `${import.meta.env.VITE_BACKEND_URL}/api/calendar`;

//     setSaving(true);
//     try {
//       const resp = await fetch(urlPath, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const responseText = await resp.text();

//       let data = {};
//       if (responseText) {
//         try {
//           data = JSON.parse(responseText);
//         } catch (parseError) {
//           console.error('❌ JSON parse error:', parseError);
//           throw new Error(`Server returned invalid JSON. Status: ${resp.status}`);
//         }
//       }

//       if (!resp.ok) {
//         const errorMessage = data.message ||
//           data.error ||
//           data.errors?.join(', ') ||
//           `HTTP ${resp.status}: ${resp.statusText}`;
//         throw new Error(errorMessage);
//       }

//       // Call onSaved callback if provided (parent handles modal close)
//       // Otherwise, close modal directly
//       if (onSaved) {
//         onSaved(data.event || data);
//       } else {
//         onClose();
//       }

//     } catch (err) {
//       console.error('❌ Save error:', err);
//       window.alert(`Could not save event: ${err.message}`);
//     } finally {
//       setSaving(false);
//     }
//   }

//   // Delete event function
//   async function handleDelete() {
//     if (!initialData?._id) {
//       window.alert('No event to delete.');
//       return;
//     }

//     // Confirm deletion
//     const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
//     if (!confirmed) {
//       return;
//     }

//     const urlPath = `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData._id}`;

//     setDeleting(true);
//     try {
//       const resp = await fetch(urlPath, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
//         },
//       });

//       const responseText = await resp.text();

//       let data = {};
//       if (responseText) {
//         try {
//           data = JSON.parse(responseText);
//         } catch (parseError) {
//           console.error('❌ JSON parse error:', parseError);
//           throw new Error(`Server returned invalid JSON. Status: ${resp.status}`);
//         }
//       }

//       if (!resp.ok) {
//         const errorMessage = data.message ||
//           data.error ||
//           data.errors?.join(', ') ||
//           `HTTP ${resp.status}: ${resp.statusText}`;
//         throw new Error(errorMessage);
//       }

//       // Call onSaved callback if provided (parent handles modal close)
//       // Otherwise, close modal directly
//       if (onSaved) {
//         onSaved(null); // Pass null to indicate deletion
//       } else {
//         onClose();
//       }

//     } catch (err) {
//       console.error('❌ Delete error:', err);
//       window.alert(`Could not delete event: ${err.message}`);
//     } finally {
//       setDeleting(false);
//     }
//   }

//   if (!isOpen) return null;

//   // Get display text for date and time inputs
//   const getDateDisplayText = () => {
//     if (tempStartDate && tempEndDate) {
//       return `${formatDateForDisplay(tempStartDate)} → ${formatDateForDisplay(tempEndDate)}`;
//     } else if (tempStartDate) {
//       return `${formatDateForDisplay(tempStartDate)} → Select end date`;
//     } else if (startDate) {
//       const start = new Date(startDate);
//       const end = endDate ? new Date(endDate) : null;
//       return end
//         ? `${formatDateForDisplay(start)} → ${formatDateForDisplay(end)}`
//         : `${formatDateForDisplay(start)} → Select end date`;
//     }
//     return 'Select Start and end Date';
//   };

//   const getTimeDisplayText = () => {
//     if (startTime && endTime) {
//       return `${formatTimeForDisplay(startTime)} → ${formatTimeForDisplay(endTime)}`;
//     }
//     return 'Select Start and End time';
//   };

//   // Main modal content
//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <h3 className="text-lg font-semibold mb-4 text-gray-800">
//             {initialData ? 'Edit Event' : 'Add Event'}
//           </h3>

//           {/* Title */}
//           <input
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Enter Event Title"
//             className="w-full border-b-2 border-gray-300 px-2 py-3 mb-4 focus:outline-none focus:border-[#238D88] text-gray-700 placeholder-gray-400"
//           />

//           {/* Category Panel - Now as inline panel */}
//           {showCategoryPanel && (
//             <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
//               <div className="flex justify-between items-center mb-4">
//                 <h4 className="text-lg font-semibold text-gray-800">Select Category</h4>
//                 <button
//                   onClick={() => {
//                     setShowCategoryPanel(false);
//                     setShowAddCategoryPanel(true);
//                   }}
//                   className="bg-[#F3BE08] text-black px-3 py-1 rounded text-sm font-medium hover:bg-amber-500 transition-colors"
//                 >
//                   Add Category +
//                 </button>
//               </div>

//               <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
//                 {categories.map(cat => (
//                   <div key={cat._id} className="flex items-center gap-3 py-2">
//                     <input
//                       type="radio"
//                       id={cat._id}
//                       name="category"
//                       checked={selectedCategory === cat.category}
//                       onChange={() => handleCategorySelect(cat.category)}
//                       className="w-4 h-4 text-[#F3BE08] focus:ring-[#F3BE08]"
//                       style={{ backgroundColor: selectedCategory === cat.category ? '#F3BE08' : 'white' }}
//                     />
//                     <label htmlFor={cat._id} className="text-gray-700">
//                       {cat.category}
//                     </label>
//                   </div>
//                 ))}
//               </div>

//               <div className="flex justify-end gap-3 pt-4 border-t">
//                 <button
//                   onClick={() => setShowCategoryPanel(false)}
//                   className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSaveCategory}
//                   className="px-4 py-2 bg-[#238D88] text-white rounded hover:bg-[#1d7470] transition-colors"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Select Category Button - Only show when panel is closed */}
//           {!showCategoryPanel && (
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
//               <button
//                 onClick={() => setShowCategoryPanel(true)}
//                 className="w-full bg-[#F3BE08] text-black rounded-lg px-4 py-3 font-medium flex justify-between items-center hover:bg-amber-500 transition-colors"
//               >
//                 <span>{category}</span>
//                 <span>▼</span>
//               </button>
//             </div>
//           )}

//           {/* Add Category Panel - Now as inline panel */}
//           {showAddCategoryPanel && (
//             <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
//               <h5 className="font-semibold text-gray-800 mb-3">Add New Category</h5>
//               <input
//                 type="text"
//                 value={newCategoryName}
//                 onChange={e => setNewCategoryName(e.target.value)}
//                 placeholder="Add New Category"
//                 className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:border-[#238D88] text-gray-700"
//               />
//               <p className="text-sm text-gray-500 mb-3">Suggestions: Medical, Stationary, etc.</p>
//               <div className="flex justify-end gap-2">
//                 <button
//                   onClick={() => {
//                     setShowAddCategoryPanel(false);
//                     setNewCategoryName('');
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddCategory}
//                   className="px-4 py-2 bg-[#238D88] text-white rounded hover:bg-[#1d7470] transition-colors"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Select Children Dropdown */}
//           <div className="mb-4 children-dropdown-container">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select the child that will be assigned to the event
//             </label>
//             <div className="relative">
//               <button
//                 onClick={() => setShowChildrenDropdown(!showChildrenDropdown)}
//                 className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-[#238D88] text-gray-700 flex justify-between items-center"
//               >
//                 <div className="flex items-center gap-2">
//                   {selectedChild !== 'All' ? (
//                     <>
//                       <ChildAvatar
//                         child={childrenList.find(c => c._id === selectedChild)}
//                         width={24}
//                         height={24}
//                       />
//                       <span>{getSelectedChildName()}</span>
//                     </>
//                   ) : (
//                     <span>{getSelectedChildName()}</span>
//                   )}
//                 </div>
//                 <span>▼</span>
//               </button>

//               {showChildrenDropdown && (
//                 <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
//                   <button
//                     onClick={() => {
//                       setSelectedChild('All');
//                       setShowChildrenDropdown(false);
//                     }}
//                     className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${selectedChild === 'All' ? 'bg-[#238D88] text-white' : 'text-gray-700'
//                       }`}
//                   >
//                     <span>All Children</span>
//                   </button>

//                   {childrenList.map(child => (
//                     <button
//                       key={child._id}
//                       onClick={() => {
//                         setSelectedChild(child._id);
//                         setShowChildrenDropdown(false);
//                       }}
//                       className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${selectedChild === child._id ? 'bg-[#238D88] text-white' : 'text-gray-700'
//                         }`}
//                     >
//                       <ChildAvatar child={child} width={24} height={24} />
//                       <span>{child.name}</span>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Date and Time Section */}
//           <h4 className="text-black font-semibold mb-3">Date and Time</h4>

//           {/* Select Start and End Date Input */}
//           <div className="mb-4">
//             {/* <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label> */}
//             <button
//               onClick={() => setShowDatePicker(true)}
//               className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-[#238D88] text-gray-700 flex justify-between items-center hover:bg-gray-50 transition-colors"
//             >
//               <span className={tempStartDate || startDate ? 'text-gray-800' : 'text-gray-500'}>
//                 {getDateDisplayText()}
//               </span>
//               {/* <span>📅</span> */}
//             </button>
//           </div>

//           {/* Select Time Input */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
//             <button
//               onClick={() => setShowTimePicker(true)}
//               className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-[#238D88] text-gray-700 flex justify-between items-center hover:bg-gray-50 transition-colors"
//             >
//               <span className={startTime && endTime ? 'text-gray-800' : 'text-gray-500'}>
//                 {getTimeDisplayText()}
//               </span>
//               {/* <span>🕒</span> */}
//             </button>
//           </div>

//           {/* Alert */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Alert</label>
//             <button
//               onClick={() => setShowAlertPanel(true)}
//               className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-[#238D88] text-gray-700 flex justify-between items-center"
//             >
//               <span>{alertTime}</span>
//               <span>▼</span>
//             </button>
//           </div>

//           {/* Alert Panel - Now as inline panel */}
//           {showAlertPanel && (
//             <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
//               <div className="flex justify-between items-center mb-4">
//                 <h4 className="text-2xl font-bold text-black">Alert</h4>
//                 <button
//                   onClick={() => {
//                     setShowAlertPanel(false);
//                     setShowCustomAlertPanel(true);
//                   }}
//                   className="bg-[#F3BE08] text-black px-3 py-2 rounded text-sm font-medium hover:bg-amber-500 transition-colors flex items-center gap-2"
//                 >
//                   <span>Custom</span>
//                   <span>+</span>
//                 </button>
//               </div>

//               <div className="space-y-2 mb-4">
//                 {ALERT_OPTIONS.map(option => (
//                   <button
//                     key={option}
//                     onClick={() => handleAlertSelect(option)}
//                     className="w-full px-4 py-3 text-left hover:bg-[#238D88] hover:text-white transition-colors rounded-lg"
//                   >
//                     {option}
//                   </button>
//                 ))}
//               </div>

//               <div className="flex justify-end gap-3 pt-4 border-t">
//                 <button
//                   onClick={() => setShowAlertPanel(false)}
//                   className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => setShowAlertPanel(false)}
//                   className="px-4 py-2 bg-[#238D88] text-white rounded hover:bg-[#1d7470] transition-colors"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Custom Alert Panel - Now as inline panel */}
//           {showCustomAlertPanel && (
//             <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
//               <h4 className="text-2xl font-bold text-black text-center mb-2">Customize your alert</h4>
//               <p className="text-center text-gray-600 mb-4">
//                 Write your own custom alert date for getting reminder for this item!
//               </p>

//               <div className="mb-6">
//                 <label className="block text-gray-700 mb-2">Alert</label>
//                 <input
//                   type="text"
//                   value={customAlertText}
//                   onChange={e => setCustomAlertText(e.target.value)}
//                   placeholder="Ex: before 5 days"
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#238D88] text-gray-700"
//                 />
//               </div>

//               <div className="flex justify-center gap-3">
//                 <button
//                   onClick={() => {
//                     setShowCustomAlertPanel(false);
//                     setCustomAlertText('');
//                   }}
//                   className="px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleCustomAlertSave}
//                   className="px-6 py-2 bg-[#238D88] text-white rounded hover:bg-[#1d7470] transition-colors"
//                 >
//                   Confirm
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Notes, URL, Attachments with Icons */}
//           <div className="space-y-3 mb-6">
//             <div className="flex items-center border-b-2 border-gray-300 px-2 py-3 focus-within:border-[#238D88]">
//               <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//               </svg>
//               <input
//                 value={notes}
//                 onChange={e => setNotes(e.target.value)}
//                 placeholder="Add notes"
//                 className="flex-1 focus:outline-none text-gray-700 placeholder-gray-400"
//               />
//             </div>

//             <div className="flex items-center border-b-2 border-gray-300 px-2 py-3 focus-within:border-[#238D88]">
//               <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
//               </svg>
//               <input
//                 value={url}
//                 onChange={e => setUrl(e.target.value)}
//                 placeholder="Add URL"
//                 className="flex-1 focus:outline-none text-gray-700 placeholder-gray-400"
//               />
//             </div>

//             <div className="flex items-center border-b-2 border-gray-300 px-2 py-3 focus-within:border-[#238D88]">
//               <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
//               </svg>
//               <input
//                 value={attachments}
//                 onChange={e => setAttachments(e.target.value)}
//                 placeholder="Add attachments"
//                 className="flex-1 focus:outline-none text-gray-700 placeholder-gray-400"
//               />
//             </div>
//           </div>

//           {/* Save, Cancel, and Delete Buttons */}
//           <div className="flex justify-between gap-3">
//             {initialData && (
//               <button
//                 onClick={handleDelete}
//                 disabled={deleting || saving}
//                 className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {deleting ? 'Deleting...' : 'Delete'}
//               </button>
//             )}
//             {initialData && <div className="flex-1"></div>}
//             <div className="flex gap-3">
//               <button
//                 onClick={onClose}
//                 disabled={saving || deleting}
//                 className="px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={saving || deleting}
//                 className="px-6 py-2 bg-[#238D88] text-white rounded hover:bg-[#1d7470] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {saving ? 'Saving...' : (initialData ? 'Save Changes' : 'Save')}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Date Picker Modal */}
//         {showDatePicker && <DatePickerModal />}

//         {/* Time Picker Modal */}
//         {showTimePicker && <TimePicker />}
//       </div>
//     </div>
//   );
// }

// function formatForInput(isoOrDate) {
//   if (!isoOrDate) return '';
//   const d = new Date(isoOrDate);
//   const pad = n => String(n).padStart(2, '0');
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
// }
