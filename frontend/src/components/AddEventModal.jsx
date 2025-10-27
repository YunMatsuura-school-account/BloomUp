// // // // frontend/src/components/AddEventModal.jsx
// // import React, { useState, useEffect } from 'react';

// // const COLOR_OPTIONS = [
// //   '#006F69','#6CC31F','#02955F','#8CD8AC','#0CC6B0',
// //   '#F3BE08','#F39D08','#F35E08','#C5A70C','#8D4900'
// // ];

// // const CATEGORY_OPTIONS = ['General', 'Shopping', 'School Function', 'Others'];

// // export default function AddEventModal({ isOpen, onClose, onSaved, initialData = null, apiBaseUrl = '' }) {

// //   const [type, setType] = useState(initialData?.type || '');
// //   const [children, setChildren] = useState(initialData?.children || []);
// //   const [color, setColor] = useState(initialData?.color || COLOR_OPTIONS[0]);
// //   const [category, setCategory] = useState(initialData?.category || CATEGORY_OPTIONS[0]);
// //   const [startDate, setStartDate] = useState(initialData?.startDate ? formatForInput(initialData.startDate) : '');
// //   const [endDate, setEndDate] = useState(initialData?.endDate ? formatForInput(initialData.endDate) : '');
// //   const [alert, setAlert] = useState(initialData?.alert || 'At time of event');
// //   const [notes, setNotes] = useState(initialData?.notes || '');
// //   const [url, setUrl] = useState(initialData?.url || '');
// //   const [showColorPicker, setShowColorPicker] = useState(false);
// //   const [showCategoryPicker, setShowCategoryPicker] = useState(false);
// //   const [saving, setSaving] = useState(false);

// //   useEffect(() => {

// //     if (initialData) {
// //       setType(initialData.type || '');
// //       setChildren(initialData.children || []);
// //       setColor(initialData.color || COLOR_OPTIONS[0]);
// //       setCategory(initialData.category || CATEGORY_OPTIONS[0]);
// //       setStartDate(initialData.startDate ? formatForInput(initialData.startDate) : '');
// //       setEndDate(initialData.endDate ? formatForInput(initialData.endDate) : '');
// //       setAlert(initialData.alert || 'At time of event');
// //       setNotes(initialData.notes || '');
// //       setUrl(initialData.url || '');
// //     } else {
// //       // reset on new
// //       setType('');
// //       setChildren([]);
// //       setColor(COLOR_OPTIONS[0]);
// //       setCategory(CATEGORY_OPTIONS[0]);
// //       setStartDate('');
// //       setEndDate('');
// //       setAlert('At time of event');
// //       setNotes('');
// //       setUrl('');
// //     }
// //   }, [initialData, isOpen]);

// //   if (!isOpen) return null;

// //   async function handleSave() {
// //     // basic validation
// //     if (!type || !startDate) {
// //       alert('Please provide at least an event title and start date/time.');
// //       return;
// //     }

// //     const payload = {
// //       type,
// //       children,
// //       color,
// //       category,
// //       startDate: new Date(startDate).toISOString(),
// //       endDate: endDate ? new Date(endDate).toISOString() : null,
// //       alert,
// //       notes,
// //       url
// //     };

// //     setSaving(true);
// //     try {
// //       const method = initialData?. _id ? 'PUT' : 'POST';
// //       const urlPath = initialData?._id ? `${apiBaseUrl}/api/calendar/${initialData._id}` : `${apiBaseUrl}/api/calendar`;
// //       const resp = await fetch(urlPath, {
// //         method,
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(payload),
// //         credentials: 'include' 
// //       });
// //       const data = await resp.json();
// //       if (!resp.ok) throw new Error(data?.message || 'Failed to save');

// //       // notify user to refresh events
// //       if (onSaved) onSaved(data.event || data);
// //       onClose();
// //     } catch (err) {
// //       console.error('Save error', err);
// //       alert('Could not save event. Check console for details.');
// //     } finally {
// //       setSaving(false);
// //     }
// //   }

// //   function handleColorSelect(c) {
// //     setColor(c);
// //     setShowColorPicker(false);
// //   }
// //   function handleCategorySelect(cat) {
// //     setCategory(cat);
// //     setShowCategoryPicker(false);
// //   }

// //   return (
 
// //     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
// //       <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-5">
// //         <h3 className="text-lg font-semibold mb-3">{initialData ? 'Edit Event' : 'Add Event'}</h3>

// //         {/* Title */}
// //         <label className="block text-sm">Title</label>
// //         <input value={type} onChange={e => setType(e.target.value)} placeholder="Event title"
// //                className="w-full border rounded px-2 py-1 mb-3" />

// //         {/* Color and Category pickers */}
// //         <div className="flex gap-3 mb-3">
// //           <div>
// //             <label className="block text-sm">Color</label>
// //             <div className="flex items-center gap-2">
// //               <div style={{ background: color }} className="w-8 h-8 rounded border"></div>
// //               <button type="button" onClick={() => setShowColorPicker(v => !v)}
// //                       className="px-2 py-1 border rounded text-sm">Choose</button>
// //             </div>
// //             {showColorPicker && (
// //               <div className="mt-2 p-2 border rounded bg-gray-50">
// //                 <div className="grid grid-cols-5 gap-2">
// //                   {COLOR_OPTIONS.map(c => (
// //                     <button key={c} onClick={() => handleColorSelect(c)}
// //                             className="w-full h-8 rounded" style={{ background: c }} aria-label={c}/>
// //                   ))}
// //                 </div>
// //                 <div className="flex justify-end gap-2 mt-2">
// //                   <button onClick={() => setShowColorPicker(false)} className="px-3 py-1">Cancel</button>
// //                 </div>
// //               </div>
// //             )}
// //           </div>

// //           <div>
// //             <label className="block text-sm">Category</label>
// //             <div className="flex items-center gap-2">
// //               <div className="px-2 py-1 border rounded text-sm">{category}</div>
// //               <button onClick={() => setShowCategoryPicker(v => !v)} className="px-2 py-1 border rounded text-sm">Choose</button>
// //             </div>
// //             {showCategoryPicker && (
// //               <div className="mt-2 p-2 border rounded bg-gray-50">
// //                 {CATEGORY_OPTIONS.map(cat => (
// //                   <div key={cat} className="flex items-center justify-between py-1">
// //                     <span>{cat}</span>
// //                     <button onClick={() => handleCategorySelect(cat)} className="px-2 py-1 text-sm border rounded">Save</button>
// //                   </div>
// //                 ))}
// //                 <div className="flex justify-end mt-2">
// //                   <button onClick={() => setShowCategoryPicker(false)} className="px-3 py-1">Cancel</button>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Date/time */}
// //         <div className="grid grid-cols-2 gap-3 mb-3">
// //           <div>
// //             <label className="block text-sm">Start</label>
// //             <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
// //                    className="w-full border rounded px-2 py-1" />
// //           </div>
// //           <div>
// //             <label className="block text-sm">End (optional)</label>
// //             <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
// //                    className="w-full border rounded px-2 py-1" />
// //           </div>
// //         </div>

// //         {/* Alert */}
// //         <div className="mb-3">
// //           <label className="block text-sm">Alert</label>
// //           <select value={alert} onChange={e => setAlert(e.target.value)} className="border rounded px-2 py-1">
// //             <option>At time of event</option>
// //             <option>5 minutes before</option>
// //             <option>15 minutes before</option>
// //             <option>1 hour before</option>
// //             <option>1 day before</option>
// //           </select>
// //         </div>

// //         {/* Notes and URL */}
// //         <div className="mb-3">
// //           <label className="block text-sm">Notes</label>
// //           <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3"
// //                     className="w-full border rounded px-2 py-1"></textarea>
// //         </div>

// //         <div className="mb-3">
// //           <label className="block text-sm">URL (optional)</label>
// //           <input value={url} onChange={e => setUrl(e.target.value)} className="w-full border rounded px-2 py-1" />
// //         </div>

// //         {/* Actions */}
// //         <div className="flex justify-end gap-3">
// //           <button onClick={onClose} disabled={saving} className="px-4 py-1 border rounded">Cancel</button>
// //           <button onClick={handleSave} disabled={saving} className="px-4 py-1 bg-blue-600 text-white rounded">
// //             {saving ? 'Saving...' : (initialData ? 'Save changes' : 'Confirm')}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // will convert an ISO date (or Date) into string for input[type=datetime-local]
// // function formatForInput(isoOrDate) {
// //   if (!isoOrDate) return '';
// //   const d = new Date(isoOrDate);
// //   // will create YYYY-MM-DDTHH:mm for input value
// //   const pad = (n) => String(n).padStart(2, '0');
// //   const YYYY = d.getFullYear();
// //   const MM = pad(d.getMonth() + 1);
// //   const DD = pad(d.getDate());
// //   const hh = pad(d.getHours());
// //   const mm = pad(d.getMinutes());
// //   return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
// // }

// //-----------------------------------------------------------------

// // frontend/src/components/AddEventModal.jsx
// import React, { useState, useEffect } from 'react';

// const COLOR_OPTIONS = [
//   '#006F69','#6CC31F','#02955F','#8CD8AC','#0CC6B0',
//   '#F3BE08','#F39D08','#F35E08','#C5A70C','#8D4900'
// ];

// const CATEGORY_OPTIONS = ['General', 'Shopping', 'School Function', 'Others'];

// export default function AddEventModal({ isOpen, onClose, onSaved, initialData = null }) {
//   const [type, setType] = useState(initialData?.type || '');
//   const [children, setChildren] = useState(initialData?.children || []);
//   const [color, setColor] = useState(initialData?.color || COLOR_OPTIONS[0]);
//   const [category, setCategory] = useState(initialData?.category || CATEGORY_OPTIONS[0]);
//   const [startDate, setStartDate] = useState(initialData?.startDate ? formatForInput(initialData.startDate) : '');
//   const [endDate, setEndDate] = useState(initialData?.endDate ? formatForInput(initialData.endDate) : '');
//   const [alertTime, setAlertTime] = useState(initialData?.alert || 'At time of event');
//   const [notes, setNotes] = useState(initialData?.notes || '');
//   const [url, setUrl] = useState(initialData?.url || '');
//   const [showColorPicker, setShowColorPicker] = useState(false);
//   const [showCategoryPicker, setShowCategoryPicker] = useState(false);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (initialData) {
//       setType(initialData.type || '');
//       setChildren(initialData.children || []);
//       setColor(initialData.color || COLOR_OPTIONS[0]);
//       setCategory(initialData.category || CATEGORY_OPTIONS[0]);
//       setStartDate(initialData.startDate ? formatForInput(initialData.startDate) : '');
//       setEndDate(initialData.endDate ? formatForInput(initialData.endDate) : '');
//       setAlertTime(initialData.alert || 'At time of event');
//       setNotes(initialData.notes || '');
//       setUrl(initialData.url || '');
//     } else {
//       setType('');
//       setChildren([]);
//       setColor(COLOR_OPTIONS[0]);
//       setCategory(CATEGORY_OPTIONS[0]);
//       setStartDate('');
//       setEndDate('');
//       setAlertTime('At time of event');
//       setNotes('');
//       setUrl('');
//     }
//   }, [initialData, isOpen]);

//   if (!isOpen) return null;

//   async function handleSave() {
//     if (!type || !startDate) {
//       window.alert('Please provide at least an event title and start date/time.');
//       return;
//     }

//     const payload = {
//       type,
//       children,
//       color,
//       category,
//       startDate: new Date(startDate).toISOString(),
//       endDate: endDate ? new Date(endDate).toISOString() : null,
//       alert: alertTime,
//       notes,
//       url
//     };

//     setSaving(true);
//     try {
//       const method = initialData?._id ? 'PUT' : 'POST';
//       const urlPath = initialData?._id
//         ? `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData._id}`
//         : `${import.meta.env.VITE_BACKEND_URL}/api/calendar`;

//       const resp = await fetch(urlPath, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       let data = {};
//       try {
//         data = await resp.json();
//       } catch {}

//       if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`);
//       if (onSaved) onSaved(data.event || data);
//       onClose();
//     } catch (err) {
//       console.error('Save error', err);
//       window.alert('Could not save event. Check console for details.');
//     } finally {
//       setSaving(false);
//     }
//   }

//   function handleColorSelect(c) {
//     setColor(c);
//     setShowColorPicker(false);
//   }
//   function handleCategorySelect(cat) {
//     setCategory(cat);
//     setShowCategoryPicker(false);
//   }

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-5">
//         <h3 className="text-lg font-semibold mb-3">{initialData ? 'Edit Event' : 'Add Event'}</h3>

//         <label className="block text-sm">Title</label>
//         <input value={type} onChange={e => setType(e.target.value)} placeholder="Event title"
//                className="w-full border rounded px-2 py-1 mb-3" />

//         <div className="flex gap-3 mb-3">
//           <div>
//             <label className="block text-sm">Color</label>
//             <div className="flex items-center gap-2">
//               <div style={{ background: color }} className="w-8 h-8 rounded border"></div>
//               <button type="button" onClick={() => setShowColorPicker(v => !v)}
//                       className="px-2 py-1 border rounded text-sm">Choose</button>
//             </div>
//             {showColorPicker && (
//               <div className="mt-2 p-2 border rounded bg-gray-50">
//                 <div className="grid grid-cols-5 gap-2">
//                   {COLOR_OPTIONS.map(c => (
//                     <button key={c} onClick={() => handleColorSelect(c)}
//                             className="w-full h-8 rounded" style={{ background: c }} aria-label={c}/>
//                   ))}
//                 </div>
//                 <div className="flex justify-end gap-2 mt-2">
//                   <button onClick={() => setShowColorPicker(false)} className="px-3 py-1">Cancel</button>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm">Category</label>
//             <div className="flex items-center gap-2">
//               <div className="px-2 py-1 border rounded text-sm">{category}</div>
//               <button onClick={() => setShowCategoryPicker(v => !v)} className="px-2 py-1 border rounded text-sm">Choose</button>
//             </div>
//             {showCategoryPicker && (
//               <div className="mt-2 p-2 border rounded bg-gray-50">
//                 {CATEGORY_OPTIONS.map(cat => (
//                   <div key={cat} className="flex items-center justify-between py-1">
//                     <span>{cat}</span>
//                     <button onClick={() => handleCategorySelect(cat)} className="px-2 py-1 text-sm border rounded">Save</button>
//                   </div>
//                 ))}
//                 <div className="flex justify-end mt-2">
//                   <button onClick={() => setShowCategoryPicker(false)} className="px-3 py-1">Cancel</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-3 mb-3">
//           <div>
//             <label className="block text-sm">Start</label>
//             <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
//                    className="w-full border rounded px-2 py-1" />
//           </div>
//           <div>
//             <label className="block text-sm">End (optional)</label>
//             <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
//                    className="w-full border rounded px-2 py-1" />
//           </div>
//         </div>

//         <div className="mb-3">
//           <label className="block text-sm">Alert</label>
//           <select value={alertTime} onChange={e => setAlertTime(e.target.value)} className="border rounded px-2 py-1">
//             <option>At time of event</option>
//             <option>5 minutes before</option>
//             <option>15 minutes before</option>
//             <option>1 hour before</option>
//             <option>1 day before</option>
//           </select>
//         </div>

//         <div className="mb-3">
//           <label className="block text-sm">Notes</label>
//           <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3"
//                     className="w-full border rounded px-2 py-1"></textarea>
//         </div>

//         <div className="mb-3">
//           <label className="block text-sm">URL (optional)</label>
//           <input value={url} onChange={e => setUrl(e.target.value)} className="w-full border rounded px-2 py-1" />
//         </div>

//         <div className="flex justify-end gap-3">
//           <button onClick={onClose} disabled={saving} className="px-4 py-1 border rounded">Cancel</button>
//           <button onClick={handleSave} disabled={saving} className="px-4 py-1 bg-blue-600 text-white rounded">
//             {saving ? 'Saving...' : (initialData ? 'Save changes' : 'Confirm')}
//           </button>
//         </div>
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

// frontend/src/components/AddEventModal.jsx
import React, { useState, useEffect } from 'react';

// color and category options kept the same
const COLOR_OPTIONS = [
  '#006F69','#6CC31F','#02955F','#8CD8AC','#0CC6B0',
  '#F3BE08','#F39D08','#F35E08','#C5A70C','#8D4900'
];
const CATEGORY_OPTIONS = ['General', 'Shopping', 'School Function', 'Others'];

export default function AddEventModal({ isOpen, onClose, onSaved, initialData = null }) {
  // variable names
  const [title, setTitle] = useState(initialData?.title || '');
  const [children, setChildren] = useState(initialData?.children || []); // array of strings
  const [selectedChild, setSelectedChild] = useState(

    initialData?.children && initialData.children.length === 1 ? initialData.children[0] : (initialData?.children && initialData.children.includes('All') ? 'All' : '')
  );
  const [color, setColor] = useState(initialData?.color || COLOR_OPTIONS[0]);
  const [category, setCategory] = useState(initialData?.category || CATEGORY_OPTIONS[0]);
  const [startDate, setStartDate] = useState(initialData?.startDate ? formatForInput(initialData.startDate) : '');
  const [endDate, setEndDate] = useState(initialData?.endDate ? formatForInput(initialData.endDate) : '');
  const [alertTime, setAlertTime] = useState(initialData?.alert || 'At time of event');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const [childrenList, setChildrenList] = useState([]); 

  useEffect(() => {
    // when modal opens, fetch the userid's children
    if (!isOpen) return;

    async function loadChildren() {
      try {
        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/children`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const data = await resp.json();
        if (resp.ok) {
          setChildrenList(data.children || []);
        } else {
          console.error('Could not fetch children', data);
          setChildrenList([]);
        }
      } catch (err) {
        console.error('Fetch children failed', err);
        setChildrenList([]);
      }
    }
    loadChildren();
  }, [isOpen]);

  useEffect(() => {
    // reset when initialData changes or modal is closed/opened
    if (initialData) {
      setTitle(initialData.title || '');
      setChildren(initialData.children || []);
      setSelectedChild(
        initialData.children && initialData.children.length === 1 ? initialData.children[0] :
        (initialData.children && initialData.children.includes('All') ? 'All' : '')
      );
      setColor(initialData.color || COLOR_OPTIONS[0]);
      setCategory(initialData.category || CATEGORY_OPTIONS[0]);
      setStartDate(initialData.startDate ? formatForInput(initialData.startDate) : '');
      setEndDate(initialData.endDate ? formatForInput(initialData.endDate) : '');
      setAlertTime(initialData.alert || 'At time of event');
      setNotes(initialData.notes || '');
      setUrl(initialData.url || '');
    } else if (isOpen) {

      setTitle('');
      setChildren([]);
      setSelectedChild('All'); // default to All so event is visible for all children if userId wants
      setColor(COLOR_OPTIONS[0]);
      setCategory(CATEGORY_OPTIONS[0]);
      setStartDate('');
      setEndDate('');
      setAlertTime('At time of event');
      setNotes('');
      setUrl('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!title || !startDate) {
      window.alert('Please provide at least an event title and start date/time.');
      return;
    }

    let childrenPayload = [];
    if (selectedChild) {
      // When "All" selected
      if (selectedChild === 'All') {
        childrenPayload = ['All'];
      } else {
        childrenPayload = [selectedChild]; // store the child ID
      }
    } else if (children && children.length > 0) {
      childrenPayload = children;
    }

    const payload = {
      title,
      children: childrenPayload,
      color,
      category,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      alert: alertTime,
      notes,
      url
    };

    setSaving(true);
    try {
      const method = initialData?._id ? 'PUT' : 'POST';
      const urlPath = initialData?._id
        ? `${import.meta.env.VITE_BACKEND_URL}/api/calendar/${initialData._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/calendar`;

      const resp = await fetch(urlPath, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try { data = await resp.json(); } catch {}

      if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`);
      if (onSaved) onSaved(data.event || data);
      onClose();
    } catch (err) {
      console.error('Save error', err);
      window.alert('Could not save event. Check console for details.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-5">
        <h3 className="text-lg font-semibold mb-3">{initialData ? 'Edit Event' : 'Add Event'}</h3>

        <label className="block text-sm">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title"
               className="w-full border rounded px-2 py-1 mb-3" />

        {/* Child selector */}
        <div className="mb-3">
          <label className="block text-sm">Select Child</label>
          <div className="border rounded px-2 py-1">
            <select
              value={selectedChild || 'All'}
              onChange={e => setSelectedChild(e.target.value)}
              className="w-full bg-transparent"
            >
              <option value="All">All</option>
              {childrenList.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {/* show a small preview of selected child */}
            <div className="mt-2 flex items-center gap-2">
              {selectedChild === 'All' ? (
                <div className="text-sm text-gray-600">Applies to all children</div>
              ) : (
                (() => {
                  const found = childrenList.find(x => x._id === selectedChild);
                  return found ? (
                    <>
                      {found.avatar ? <img src={found.avatar} alt={found.name} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-gray-200" />}
                      <div className="text-sm">{found.name}</div>
                    </>
                  ) : <div className="text-sm text-gray-600">Selected child (not found)</div>;
                })()
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <div>
            <label className="block text-sm">Color</label>
            <div className="flex items-center gap-2">
              <div style={{ background: color }} className="w-8 h-8 rounded border"></div>
              <button type="button" onClick={() => setShowColorPicker(v => !v)}
                      className="px-2 py-1 border rounded text-sm">Choose</button>
            </div>
            {showColorPicker && (
              <div className="mt-2 p-2 border rounded bg-gray-50">
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => { setColor(c); setShowColorPicker(false); }}
                            className="w-full h-8 rounded" style={{ background: c }} aria-label={c}/>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setShowColorPicker(false)} className="px-3 py-1">Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm">Category</label>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 border rounded text-sm">{category}</div>
              <button onClick={() => setShowCategoryPicker(v => !v)} className="px-2 py-1 border rounded text-sm">Choose</button>
            </div>
            {showCategoryPicker && (
              <div className="mt-2 p-2 border rounded bg-gray-50">
                {CATEGORY_OPTIONS.map(cat => (
                  <div key={cat} className="flex items-center justify-between py-1">
                    <span>{cat}</span>
                    <button onClick={() => { setCategory(cat); setShowCategoryPicker(false); }} className="px-2 py-1 text-sm border rounded">Save</button>
                  </div>
                ))}
                <div className="flex justify-end mt-2">
                  <button onClick={() => setShowCategoryPicker(false)} className="px-3 py-1">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm">Start</label>
            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
                   className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm">End (optional)</label>
            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
                   className="w-full border rounded px-2 py-1" />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm">Alert</label>
          <select value={alertTime} onChange={e => setAlertTime(e.target.value)} className="border rounded px-2 py-1">
            <option>At time of event</option>
            <option>5 minutes before</option>
            <option>15 minutes before</option>
            <option>1 hour before</option>
            <option>1 day before</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3"
                    className="w-full border rounded px-2 py-1"></textarea>
        </div>

        <div className="mb-3">
          <label className="block text-sm">URL (optional)</label>
          <input value={url} onChange={e => setUrl(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-1 border rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-1 bg-blue-600 text-white rounded">
            {saving ? 'Saving...' : (initialData ? 'Save changes' : 'Confirm')}
          </button>
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
