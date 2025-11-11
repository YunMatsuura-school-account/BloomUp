
// frontend/src/components/AddEventModal.jsx
import React, { useState, useEffect } from 'react';

// const COLOR_OPTIONS = [
//   '#006F69', '#6CC31F', '#02955F', '#8CD8AC', '#0CC6B0',
//   '#F3BE08', '#F39D08', '#F35E08', '#C5A70C', '#8D4900'


const ALERT_OPTIONS = [
  'At time of event',
  '5 minutes before',
  '15 minutes before',
  '1 hour before',
  '1 day before'
];

export default function AddEventModal({ isOpen, onClose, onSaved, initialData = null }) {
  const [title, setTitle] = useState(initialData?.title || '');

  const [children, setChildren] = useState(initialData?.children || []);

  //const [selectedChild, setSelectedChild] = useState(
  //initialData?.children && initialData.children.length === 1 ? initialData.children[0] : (initialData?.children && initialData.children.includes('All') ? 'All' : '')

  const [selectedChild, setSelectedChild] = useState(
    initialData?.children && initialData.children.length === 1 ? initialData.children[0] : 'All'
  );
  const [category, setCategory] = useState(initialData?.category || 'Others');
  const [startDate, setStartDate] = useState(initialData?.startDate ? formatForInput(initialData.startDate) : '');
  const [endDate, setEndDate] = useState(initialData?.endDate ? formatForInput(initialData.endDate) : '');
  const [alertTime, setAlertTime] = useState(initialData?.alert || 'At time of event');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [url, setUrl] = useState(initialData?.url || '');

  // const [showColorPicker, setShowColorPicker] = useState(false);
  // const [showCategoryPicker, setShowCategoryPicker] = useState(false);


  const [attachments, setAttachments] = useState(initialData?.attachments || '');

  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showAddCategoryPanel, setShowAddCategoryPanel] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Others');


  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [childrenList, setChildrenList] = useState([]);

  // Load categories and children
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;


        // const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${token}`,
        //   },

        // Load categories
        const categoriesRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }

        // const userData = await res.json();
        // console.log('User data received:', userData);

        // if (userData.children && userData.children.length > 0) {
        //   const childDetailsPromises = userData.children.map(async (childId) => {
        //     try {
        //       const childRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userData.id}/children/${childId}`, {
        //         headers: {
        //           "Authorization": `Bearer ${token}`,
        //         },
        //       });
        //       if (childRes.ok) {
        //         return await childRes.json();
        //       }
        //       return null;
        //     } catch (error) {
        //       console.error(`Error fetching child ${childId}:`, error);
        //       return null;
        //     }
        //   });

        //   const childDetails = await Promise.all(childDetailsPromises);
        //   const validChildren = childDetails.filter(child => child !== null);
        //   setChildrenList(validChildren);
        // } else {
        //   setChildrenList([]);

        // Load children
        const childrenRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/children`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          setChildrenList(childrenData.children || []);

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
      console.log('Initial data for editing:', initialData);
      setTitle(initialData.title || '');

      // setChildren(initialData.children || []);

      // if (initialData.children && initialData.children.length > 0) {
      //   const hasAllChildren = childrenList.length > 0 &&
      //     initialData.children.length === childrenList.length &&
      //     initialData.children.every(childId =>
      //       childrenList.some(child => child._id === childId)
      //     );

      //   if (hasAllChildren) {
      //     setSelectedChild('All');
      //   } else if (initialData.children.length === 1) {
      //     setSelectedChild(initialData.children[0]);
      //   } else {
      //     setSelectedChild(initialData.children[0]);
      //   }
      // } else {
      //   setSelectedChild('All');
      // }

      // setColor(initialData.color || COLOR_OPTIONS[0]);
      // setCategory(initialData.category || CATEGORY_OPTIONS[0]);

      setSelectedChild(
        initialData.children && initialData.children.length === 1 ?
          initialData.children[0] : 'All'
      );
      setCategory(initialData.category || 'Others');
      setSelectedCategory(initialData.category || 'Others');

      setStartDate(initialData.startDate ? formatForInput(initialData.startDate) : '');
      setEndDate(initialData.endDate ? formatForInput(initialData.endDate) : '');
      setAlertTime(initialData.alert || 'At time of event');
      setNotes(initialData.notes || '');
      setUrl(initialData.url || '');
      setAttachments(initialData.attachments || '');
    } else if (isOpen) {
      setTitle('');

      // setChildren([]);
      // setSelectedChild('All');
      // setColor(COLOR_OPTIONS[0]);
      // setCategory(CATEGORY_OPTIONS[0]);

      setSelectedChild('All');
      setCategory('Others');
      setSelectedCategory('Others');

      setStartDate('');
      setEndDate('');
      setAlertTime('At time of event');
      setNotes('');
      setUrl('');
      setAttachments('');
    }

    //}, [initialData, isOpen, childrenList]);

  }, [initialData, isOpen]);


  // Test backend connection first
  // Enhanced backend connection test with diagnostics
  // const testBackendConnection = async () => {
  //   try {
  //     console.log('=== TESTING BACKEND CONNECTION ===');
  //     const token = localStorage.getItem('accessToken');


  //     // Function to map event alert to reminder alert and create reminder
  //     const createReminderForEvent = async (eventId, eventData) => {
  //       try {
  //         // Don't create reminder if alert is "At time of event"
  //         if (eventData.alert === 'At time of event') {
  //           console.log('⚠️ No reminder needed - alert is "At time of event"');
  //           return;
  //         }

  //         // Map all event alerts to custom reminders with specific days/hours
  //         let reminderAlert = 'Custom';
  //         let customDays = null;

  //         switch (eventData.alert) {
  //           case '5 minutes before':
  //             customDays = 0.0035; // ~5 minutes in days (5/1440)
  //             break;
  //           case '15 minutes before':
  //             customDays = 0.0104; // ~15 minutes in days (15/1440)
  //             break;
  //           case '1 hour before':
  //             customDays = 0.0417; // ~1 hour in days (1/24)
  //             break;
  //           case '1 day before':
  //             reminderAlert = '1 day before';
  //             customDays = null;
  //             break;
  //           default:
  //             console.log('⚠️ Unknown alert type:', eventData.alert);
  //             return;
  //         }

  //         const token = localStorage.getItem('accessToken');
  //         if (!token) {
  //           console.error('❌ No access token - cannot create reminder');
  //           return;
  //         }

  //         const reminderData = {
  //           eventId: eventId,
  //           eventTitle: eventData.title,
  //           eventDate: eventData.startDate,
  //           alert: reminderAlert,
  //           customAlert: reminderAlert === 'Custom',
  //           customDays: customDays
  //         };

  //         console.log('🔔 Creating reminder for all alert types:', reminderData);

  //         const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reminders`, {
  //           method: 'POST',
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             'Content-Type': 'application/json'
  //           },
  //           body: JSON.stringify(reminderData)
  //         });

  //         const data = await resp.json();

  //         if (resp.ok) {
  //           console.log('✅ Reminder created successfully:', data);
  //         } else {
  //           console.error('❌ Failed to create reminder:', data);
  //         }
  //       } catch (err) {
  //         console.error('❌ Error creating reminder:', err);
  //       }
  //     };


  //     if (!token) {
  //       console.error('❌ No access token found in localStorage');
  //       return false;
  //     }

  //     console.log('✅ Token found');
  //     console.log('✅ Backend URL:', import.meta.env.VITE_BACKEND_URL);

  //     // Test multiple endpoints to see what works
  //     const testEndpoints = [
  //       '/api/calendar/debug-update',  // Our custom debug route
  //       '/api/calendar',               // Main calendar route
  //       '/api/auth/me',                // Auth route (should work)
  //       '/api/children',               // Children route
  //       '/api/categories'              // Categories route
  //     ];

  //     for (const endpoint of testEndpoints) {
  //       const testUrl = `${import.meta.env.VITE_BACKEND_URL}${endpoint}`;
  //       console.log(`\n--- Testing endpoint: ${endpoint} ---`);
  //       console.log('Full URL:', testUrl);

  //       try {
  //         const resp = await fetch(testUrl, {
  //           method: 'GET',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${token}`,
  //           },
  //         });

  //         console.log(`Status for ${endpoint}:`, resp.status, resp.statusText);

  //         const responseText = await resp.text();
  //         console.log(`Response type for ${endpoint}:`, responseText.substring(0, 100));

  //         if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
  //           console.error(`❌ ${endpoint} returned HTML instead of JSON`);
  //           console.error('This usually means:');
  //           console.error('1. The route does not exist');
  //           console.error('2. The server is returning an error page');
  //           console.error('3. The URL is wrong');
  //         } else {
  //           console.log(`✅ ${endpoint} returned non-HTML response`);
  //           try {
  //             const jsonData = JSON.parse(responseText);
  //             console.log(`✅ ${endpoint} returned valid JSON:`, jsonData);
  //             return true; // If any endpoint works, we're good
  //           } catch (e) {
  //             console.error(`❌ ${endpoint} returned invalid JSON:`, e.message);
  //           }
  //         }
  //       } catch (error) {
  //         console.error(`❌ Error testing ${endpoint}:`, error.message);
  //       }
  //     }

  //     return false;

  //   } catch (error) {
  //     console.error('❌ Backend test failed with error:', error);
  //     return false;
  //   }
  // };

  // FIXED: Save event function with comprehensive debugging
  // async function handleSave() {
  //   console.log('=== HANDLE SAVE STARTED ===');

  //   if (!title || !title.trim()) {
  //     window.alert('Please provide an event title.');
  //     return;
  //   }

  //   if (!startDate) {
  //     window.alert('Please provide a start date/time.');
  //     return;
  //   }

  //   // First test backend connection
  //   const backendTest = await testBackendConnection();
  //   if (!backendTest) {
  //     window.alert('Backend connection test failed. Check console for details.');
  //     return;
  //   }

  //   let childrenPayload = [];

  //   if (selectedChild) {
  //     if (selectedChild === 'All') {
  //       childrenPayload = childrenList.map(child => child._id);
  //     } else {
  //       childrenPayload = [selectedChild];
  //     }
  //   }

  //   if (childrenPayload.length === 0 && children && children.length > 0) {
  //     childrenPayload = children;
  //   }

  //   console.log('💾 Saving event with children:', childrenPayload);
  //   console.log('💾 Alert time selected:', alertTime);


  //   if (selectedChild && selectedChild !== 'All') {
  //     childrenPayload = [selectedChild];
  //   } else if (childrenList.length > 0) {
  //     childrenPayload = childrenList.map(child => child._id);
  //   }

  //   // Build payload with all required fields
  //   const payload = {
  //     title: title.trim(),
  //     children: childrenPayload,
  //     color: '#006F69',
  //     category: category || 'Others',
  //     startDate: new Date(startDate).toISOString(),
  //     alert: alertTime || 'At time of event',
  //     notes: notes || '',
  //     url: url || '',
  //     attachments: attachments ? [attachments] : []
  //   };

  //   // Add endDate only if provided
  //   if (endDate) {
  //     payload.endDate = new Date(endDate).toISOString();
  //   }

  //   console.log('=== SAVE EVENT DEBUG ===');
  //   console.log('Initial Data:', initialData);
  //   console.log('Event ID:', initialData?._id);
  //   console.log('Payload to send:', payload);
  //   console.log('Method:', initialData?._id ? 'PUT' : 'POST');

  //   const method = initialData?._id ? 'PUT' : 'POST';
  //   const urlPath = initialData?._id
  //     ? `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData._id}`
  //     : `${import.meta.env.VITE_BACKEND_URL}/api/calendar`;

  //   console.log('Request URL:', urlPath);
  //   console.log('Full URL for testing:', `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData?._id}`);

  //   setSaving(true);
  //   try {
  //     console.log('Making fetch request...');

  //     const resp = await fetch(urlPath, {
  //       method,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     console.log('Response received. Status:', resp.status, resp.statusText);

  //     // Get raw response text first
  //     const responseText = await resp.text();
  //     console.log('Raw response text:', responseText);

  //     let data = {};
  //     if (responseText) {
  //       try {
  //         data = JSON.parse(responseText);
  //         console.log('Parsed response data:', data);
  //       } catch (parseError) {
  //         console.error('JSON parse error:', parseError);
  //         console.error('Raw response that failed to parse:', responseText);
  //         throw new Error(`Server returned invalid JSON. Status: ${resp.status}. Response: ${responseText.substring(0, 200)}`);
  //       }
  //     } else {
  //       console.log('Empty response body');
  //       throw new Error(`Server returned empty response. Status: ${resp.status}`);
  //     }

  //     if (!resp.ok) {
  //       console.error('Server returned error status:', resp.status);
  //       console.error('Error response data:', data);

  //       // Extract error message from various possible locations
  //       const errorMessage =
  //         data?.message ||
  //         data?.error ||
  //         data?.errors?.join?.(', ') ||
  //         data?.details ||
  //         data?.msg ||
  //         `HTTP ${resp.status}: ${resp.statusText}`;

  //       console.error('Extracted error message:', errorMessage);
  //       throw new Error(errorMessage);
  //     }

  //     const savedEvent = data.event || data;
  //     console.log('✅ Event saved:', savedEvent);

  //     // Always create or update reminder if alert is set (backend will update existing)
  //     if (savedEvent._id && alertTime !== 'At time of event') {
  //       console.log('🔔 Alert is set, creating/updating reminder...');
  //       console.log('   Alert type:', alertTime);
  //       console.log('   Event ID:', savedEvent._id);
  //       await createReminderForEvent(savedEvent._id, {
  //         title: savedEvent.title,
  //         startDate: savedEvent.startDate,
  //         alert: alertTime
  //       });
  //     } else if (savedEvent._id && alertTime === 'At time of event' && initialData) {
  //       // If editing and removing alert, try to delete reminder
  //       console.log('🗑️ Alert removed, attempting to delete reminder...');
  //       try {
  //         const token = localStorage.getItem('accessToken');
  //         const remindersResp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reminders`, {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             'Content-Type': 'application/json'
  //           },
  //         });
  //         if (remindersResp.ok) {
  //           const remindersData = await remindersResp.json();
  //           const existingReminder = remindersData.reminders?.find(r => r.eventId === savedEvent._id);
  //           if (existingReminder) {
  //             await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reminders/${existingReminder._id}`, {
  //               method: 'DELETE',
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             });
  //             console.log('✅ Reminder deleted');
  //           }
  //         }
  //       } catch (err) {
  //         console.error('❌ Error deleting reminder:', err);
  //       }
  //     } else {
  //       console.log('⚠️ No reminder action needed');
  //     }

  //     if (onSaved) onSaved(savedEvent);

  //     if (data.success === false) {
  //       console.error('Server returned success: false', data);
  //       throw new Error(data.message || 'Operation failed on server');
  //     }

  //     console.log('✅ Save successful! Response:', data);
  //     if (onSaved) onSaved(data.event || data);

  //     onClose();

  //   } catch (err) {

  //     // console.error('❌ Save error', err);
  //     // window.alert('Could not save event: ' + err.message);

  //     console.error('❌ Save error details:', err);
  //     console.error('❌ Error name:', err.name);
  //     console.error('❌ Error message:', err.message);
  //     console.error('❌ Error stack:', err.stack);

  //     let userMessage = err.message;
  //     if (err.message.includes('Failed to fetch')) {
  //       userMessage = 'Network error: Cannot connect to server. Check if backend is running.';
  //     } else if (err.message.includes('JSON')) {
  //       userMessage = 'Server returned invalid response. Check backend logs.';
  //     } else if (err.message.includes('401')) {
  //       userMessage = 'Authentication failed. Please log in again.';
  //     } else if (err.message.includes('403')) {
  //       userMessage = 'You do not have permission to update this event.';
  //     } else if (err.message.includes('404')) {
  //       userMessage = 'Event not found. It may have been deleted.';
  //     }

  //     window.alert(`Could not save event: ${userMessage}`);

  //   } finally {
  //     setSaving(false);
  //   }
  // }


  // Function to map event alert to reminder alert and create reminder - MOVED OUTSIDE
  const createReminderForEvent = async (eventId, eventData) => {
    try {
      // Don't create reminder if alert is "At time of event"
      if (eventData.alert === 'At time of event') {
        console.log('⚠️ No reminder needed - alert is "At time of event"');
        return;
      }

      // Map all event alerts to custom reminders with specific days/hours
      let reminderAlert = 'Custom';
      let customDays = null;

      switch (eventData.alert) {
        case '5 minutes before':
          customDays = 0.0035; // ~5 minutes in days (5/1440)
          break;
        case '15 minutes before':
          customDays = 0.0104; // ~15 minutes in days (15/1440)
          break;
        case '1 hour before':
          customDays = 0.0417; // ~1 hour in days (1/24)
          break;
        case '1 day before':
          reminderAlert = '1 day before';
          customDays = null;
          break;
        default:
          console.log('⚠️ Unknown alert type:', eventData.alert);
          return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No access token - cannot create reminder');
        return;
      }

      const reminderData = {
        eventId: eventId,
        eventTitle: eventData.title,
        eventDate: eventData.startDate,
        alert: reminderAlert,
        customAlert: reminderAlert === 'Custom',
        customDays: customDays
      };

      console.log('🔔 Creating reminder for all alert types:', reminderData);

      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reminders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData)
      });

      const data = await resp.json();

      if (resp.ok) {
        console.log('✅ Reminder created successfully:', data);
      } else {
        console.error('❌ Failed to create reminder:', data);
      }
    } catch (err) {
      console.error('❌ Error creating reminder:', err);
    }
  };

  // Test backend connection first
  // Enhanced backend connection test with diagnostics
  const testBackendConnection = async () => {
    try {
      console.log('=== TESTING BACKEND CONNECTION ===');
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('❌ No access token found in localStorage');
        return false;
      }

      console.log('✅ Token found');
      console.log('✅ Backend URL:', import.meta.env.VITE_BACKEND_URL);

      // Test multiple endpoints to see what works
      const testEndpoints = [
        '/api/calendar/debug-update',  // Our custom debug route
        '/api/calendar',               // Main calendar route
        '/api/auth/me',                // Auth route (should work)
        '/api/children',               // Children route
        '/api/categories'              // Categories route
      ];

      for (const endpoint of testEndpoints) {
        const testUrl = `${import.meta.env.VITE_BACKEND_URL}${endpoint}`;
        console.log(`\n--- Testing endpoint: ${endpoint} ---`);
        console.log('Full URL:', testUrl);

        try {
          const resp = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          console.log(`Status for ${endpoint}:`, resp.status, resp.statusText);

          const responseText = await resp.text();
          console.log(`Response type for ${endpoint}:`, responseText.substring(0, 100));

          if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
            console.error(`❌ ${endpoint} returned HTML instead of JSON`);
            console.error('This usually means:');
            console.error('1. The route does not exist');
            console.error('2. The server is returning an error page');
            console.error('3. The URL is wrong');
          } else {
            console.log(`✅ ${endpoint} returned non-HTML response`);
            try {
              const jsonData = JSON.parse(responseText);
              console.log(`✅ ${endpoint} returned valid JSON:`, jsonData);
              return true; // If any endpoint works, we're good
            } catch (e) {
              console.error(`❌ ${endpoint} returned invalid JSON:`, e.message);
            }
          }
        } catch (error) {
          console.error(`❌ Error testing ${endpoint}:`, error.message);
        }
      }

      return false;

    } catch (error) {
      console.error('❌ Backend test failed with error:', error);
      return false;
    }
  };





  if (!isOpen) return null;

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


  //new code
  // In frontend/src/components/AddEventModal.jsx - Update the handleSave function

  // In frontend/src/components/AddEventModal.jsx - Update the handleSave function

  async function handleSave() {
    console.log('=== HANDLE SAVE STARTED ===');

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

    // FIXED: Proper handling for empty attachments
    const payload = {
      title: title.trim(),
      children: childrenPayload,
      color: '#006F69',
      category: category,
      startDate: new Date(startDate).toISOString(),
      alert: alertTime || '',
      notes: notes || '', // Empty string is fine
      url: url || '', // Empty string is fine
      attachments: attachments && attachments.trim() ? [attachments.trim()] : [] // FIXED: Check if string has content
    };

    // Add endDate only if provided
    if (endDate && endDate.trim()) {
      payload.endDate = new Date(endDate).toISOString();
    }

    console.log('💾 Saving event - ID:', initialData?._id);
    console.log('📦 Payload:', payload);

    const method = initialData?._id ? 'PUT' : 'POST';
    const urlPath = initialData?._id
      ? `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData._id}`
      : `${import.meta.env.VITE_BACKEND_URL}/api/calendar`;

    console.log('🌐 Request URL:', urlPath);
    console.log('🔧 Method:', method);

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

      console.log('📨 Response status:', resp.status);

      const responseText = await resp.text();
      console.log('📄 Raw response:', responseText);

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

      console.log('✅ Event saved successfully:', data);

      if (onSaved) onSaved(data.event || data);
      onClose();

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
    console.log('🗑️ Deleting event - ID:', initialData._id);
    console.log('🌐 Request URL:', urlPath);

    setDeleting(true);
    try {
      const resp = await fetch(urlPath, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      console.log('📨 Response status:', resp.status);

      const responseText = await resp.text();
      console.log('📄 Raw response:', responseText);

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

      console.log('✅ Event deleted successfully:', data);

      if (onSaved) onSaved(null); // Pass null to indicate deletion
      onClose();

    } catch (err) {
      console.error('❌ Delete error:', err);
      window.alert(`Could not delete event: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  // Save event
  // async function handleSave() {
  //   if (!title || !title.trim()) {
  //     window.alert('Please provide an event title.');
  //     return;
  //   }

  //   if (!startDate) {
  //     window.alert('Please provide a start date/time.');
  //     return;
  //   }

  //   let childrenPayload = [];
  //   if (selectedChild && selectedChild !== 'All') {
  //     childrenPayload = [selectedChild];
  //   } else if (childrenList.length > 0) {
  //     childrenPayload = childrenList.map(child => child._id);
  //   }

  //   // Build payload with all required fields
  //   const payload = {
  //     title: title.trim(),
  //     children: childrenPayload,
  //     color: '#006F69', // 
  //     category: category || 'Others',
  //     startDate: new Date(startDate).toISOString(),
  //     alert: alertTime || 'At time of event',
  //     notes: notes || '',
  //     url: url || '',
  //     attachments: attachments ? [attachments] : []
  //   };

  //   // Add endDate only if provided
  //   if (endDate) {
  //     payload.endDate = new Date(endDate).toISOString();
  //   }

  //   console.log(' Sending payload to server:', payload);

  //   setSaving(true);
  //   try {
  //     const method = initialData?._id ? 'PUT' : 'POST';
  //     const urlPath = initialData?._id
  //       ? `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData._id}`
  //       : `${import.meta.env.VITE_BACKEND_URL}/api/calendar`;

  //     const resp = await fetch(urlPath, {
  //       method,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     let data = {};
  //     try {
  //       data = await resp.json();
  //     } catch (parseError) {
  //       console.error(' Failed to parse response:', parseError);
  //       throw new Error('Invalid response from server');
  //     }

  //     console.log(' Server response:', { status: resp.status, data });

  //     if (!resp.ok) {
  //       // Handle specific error messages from server
  //       const errorMessage = data.message ||
  //         data.errors?.join(', ') ||
  //         `HTTP ${resp.status}: ${data.error || 'Unknown error'}`;
  //       throw new Error(errorMessage);
  //     }

  //     if (onSaved) onSaved(data.event || data);
  //     onClose();

  //   } catch (err) {
  //     console.error('❌ Save error details:', err);
  //     window.alert(`Could not save event: ${err.message}`);
  //   } finally {
  //     setSaving(false);
  //   }
  // }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
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

        {/* Select Child Dropdown */}
        <div className="mb-4">
          <select
            value={selectedChild}
            onChange={e => setSelectedChild(e.target.value)}
            className="w-full bg-[#238D88] text-white rounded-lg px-4 py-3 focus:outline-none"
          >
            <option value="All">All Children</option>
            {childrenList.map(child => (
              <option key={child._id} value={child._id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time Heading */}
        <h4 className="text-black font-semibold mb-3">Date and Time</h4>

        {/* Start and End Date */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <input
              type="datetime-local"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#238D88] text-gray-700"
            />
          </div>
          <div>
            <input
              type="datetime-local"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#238D88] text-gray-700"
            />
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Category</h4>
                <button
                  onClick={() => setShowAddCategoryPanel(true)}
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

              {/* Add Category Panel */}
              {showAddCategoryPanel && (
                <div className="border-t pt-4 mt-4">
                  <h5 className="font-semibold text-gray-800 mb-3">Add Category</h5>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-[#238D88] text-gray-700 placeholder-gray-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddCategoryPanel(false)}
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
              )}

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
