// // // frontend/src/Pages/Calendar.jsx
// import React, { useEffect, useState } from 'react';
// import AddEventModal from '../components/AddEventModal';


// export default function CalendarPage() {
//   const [selectedDate, setSelectedDate] = useState(dateISO(new Date())); // yyyy-mm-dd
//   const [events, setEvents] = useState([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingEvent, setEditingEvent] = useState(null);

//   // load events 
//   useEffect(() => {
//     fetchEventsForDate(selectedDate);
//   }, [selectedDate]);

//   async function fetchEventsForDate(yyyy_mm_dd) {
//     // compute start and end 
//     const start = new Date(`${yyyy_mm_dd}T00:00:00`).toISOString();
//     const end = new Date(`${yyyy_mm_dd}T23:59:59`).toISOString();

//     try {
//       const resp = await fetch(`/api/calendar?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
//         credentials: 'include'
//       });
//       const data = await resp.json();
//       if (!resp.ok) throw new Error(data?.message || 'Failed to fetch');
//       setEvents(data.events || []);
//     } catch (err) {
//       console.error('Failed to fetch events', err);
//       setEvents([]);
//     }
//   }

//   function handleOpenAdd() {
//     setEditingEvent(null);
//     setModalOpen(true);
//   }

//   function handleEdit(event) {
//     setEditingEvent(event);
//     setModalOpen(true);
//   }

//   async function handleDelete(id) {
//     if (!confirm('Delete this event?')) return;
//     try {
//       const resp = await fetch(`/api/calendar/${id}`, { method: 'DELETE', credentials: 'include' });
//       const data = await resp.json();
//       if (!resp.ok) throw new Error(data?.message || 'Delete failed');
//       // refresh
//       fetchEventsForDate(selectedDate);
//     } catch (err) {
//       console.error('Delete failed', err);
//       alert('Could not delete event.');
//     }
//   }

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-2xl font-semibold">Calendar & Reminders</h2>
//         <div className="flex gap-3 items-center">
//           <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
//                  className="border rounded px-2 py-1"/>
//           <button onClick={handleOpenAdd} className="px-3 py-1 bg-green-600 text-white rounded">Add Event</button>
//         </div>
//       </div>

//       {/* calendar grid */}
//       <div className="space-y-3">
//         {events.length === 0 && (
//           <div className="text-gray-500">No events for this date.</div>
//         )}
//         {events.map(ev => (
//           <div key={ev._id} className="flex items-start gap-3 p-3 border rounded">
//             <div className="w-3 h-12 rounded" style={{ background: ev.color || '#006F69' }}></div>
//             <div className="flex-1">
//               <div className="flex justify-between">
//                 <div>
//                   <div className="font-semibold">{ev.type}</div>
//                   <div className="text-sm text-gray-600">{formatDate(ev.startDate)} {ev.endDate ? `- ${formatDate(ev.endDate)}` : ''}</div>
//                   <div className="text-sm text-gray-600">Category: {ev.category}</div>
//                 </div>
//                 <div className="flex flex-col items-end gap-2">
//                   <button onClick={() => handleEdit(ev)} className="text-sm px-2 py-1 border rounded">Edit</button>
//                   <button onClick={() => handleDelete(ev._id)} className="text-sm px-2 py-1 border rounded text-red-600">Delete</button>
//                 </div>
//               </div>

//               {ev.notes && <div className="mt-2 text-sm">{ev.notes}</div>}
//               {ev.url && <div className="mt-1"><a className="text-blue-600 underline" href={ev.url} target="_blank" rel="noreferrer">{ev.url}</a></div>}
//             </div>
//           </div>
//         ))}
//       </div>

//       <AddEventModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         onSaved={() => fetchEventsForDate(selectedDate)}
//         initialData={editingEvent}
//       />
//     </div>
//   );
// }

// function dateISO(d) {
//   const dt = new Date(d);
//   const pad = n => String(n).padStart(2, '0');
//   return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
// }

// function formatDate(iso) {
//   if (!iso) return '';
//   const d = new Date(iso);
//   return d.toLocaleString();
// }


// frontend/src/Pages/Calendar.jsx
import React, { useEffect, useState } from 'react';
import AddEventModal from '../components/AddEventModal';

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(dateISO(new Date())); // yyyy-mm-dd
    const [events, setEvents] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        fetchEventsForDate(selectedDate);
    }, [selectedDate]);

    async function fetchEventsForDate(yyyy_mm_dd) {
        const start = new Date(`${yyyy_mm_dd}T00:00:00`).toISOString();
        const end = new Date(`${yyyy_mm_dd}T23:59:59`).toISOString();

        try {
            const resp = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/calendar?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            let data = {};
            try {
                data = await resp.json();
            } catch (err) {
                console.error('Failed to parse JSON', err);
            }

            if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`);
            setEvents(data.events || []);
        } catch (err) {
            console.error('Failed to fetch events', err);
            setEvents([]);
        }
    }

    function handleOpenAdd() {
        setEditingEvent(null);
        setModalOpen(true);
    }

    function handleEdit(event) {
        setEditingEvent(event);
        setModalOpen(true);
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this event?')) return;
        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/calendar/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            let data = {};
            try {
                data = await resp.json();
            } catch { }

            if (!resp.ok) throw new Error(data?.message || 'Delete failed');
            fetchEventsForDate(selectedDate);
        } catch (err) {
            console.error('Delete failed', err);
            window.alert('Could not delete event.');
        }
    }

    //   return (
    //       <div className="p-6 bg-white min-h-screen">
    //       <div className="flex items-center justify-between mb-4">
    //         <h2 className="text-2xl font-semibold">Calendar & Reminders</h2>
    //         <div className="flex gap-3 items-center">
    //           <input
    //             type="date"
    //             value={selectedDate}
    //             onChange={e => setSelectedDate(e.target.value)}
    //             className="border rounded px-2 py-1"
    //           />
    //           <button onClick={handleOpenAdd} className="px-3 py-1 bg-green-600 text-white rounded">
    //             Add Event
    //           </button>
    //         </div>
    //       </div>

    //       <div className="space-y-3">
    //         {events.length === 0 && <div className="text-gray-500">No events for this date.</div>}
    //         {events.map(ev => (
    //           <div key={ev._id} className="flex items-start gap-3 p-3 border rounded">
    //             <div className="w-3 h-12 rounded" style={{ background: ev.color || '#006F69' }}></div>
    //             <div className="flex-1">
    //               <div className="flex justify-between">
    //                 <div>
    //                   <div className="font-semibold">{ev.type}</div>
    //                   <div className="text-sm text-gray-600">
    //                     {formatDate(ev.startDate)} {ev.endDate ? `- ${formatDate(ev.endDate)}` : ''}
    //                   </div>
    //                   <div className="text-sm text-gray-600">Category: {ev.category}</div>
    //                 </div>
    //                 <div className="flex flex-col items-end gap-2">
    //                   <button onClick={() => handleEdit(ev)} className="text-sm px-2 py-1 border rounded">
    //                     Edit
    //                   </button>
    //                   <button
    //                     onClick={() => handleDelete(ev._id)}
    //                     className="text-sm px-2 py-1 border rounded text-red-600"
    //                   >
    //                     Delete
    //                   </button>
    //                 </div>
    //               </div>
    //               {ev.notes && <div className="mt-2 text-sm">{ev.notes}</div>}
    //               {ev.url && (
    //                 <div className="mt-1">
    //                   <a className="text-blue-600 underline" href={ev.url} target="_blank" rel="noreferrer">
    //                     {ev.url}
    //                   </a>
    //                 </div>
    //               )}
    //             </div>
    //           </div>
    //         ))}
    //       </div>

    //       <AddEventModal
    //         isOpen={modalOpen}
    //         onClose={() => setModalOpen(false)}
    //         onSaved={() => fetchEventsForDate(selectedDate)}
    //         initialData={editingEvent}
    //       />
    //     </div>
    //   );
    return (
        <div className="p-6 bg-white min-h-screen">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Calendar & Reminders</h2>
                <div className="flex gap-3 items-center">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="border rounded px-2 py-1"
                    />
                    <button onClick={handleOpenAdd} className="px-3 py-1 bg-green-600 text-white rounded">
                        Add Event
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {events.length === 0 && <div className="text-gray-500">No events for this date.</div>}
                {events.map(ev => (
                    <div key={ev._id} className="flex items-start gap-3 p-3 border rounded">
                        <div className="w-3 h-12 rounded" style={{ background: ev.color || '#006F69' }}></div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <div>
                                    <div className="font-semibold">{ev.type}</div>
                                    <div className="text-sm text-gray-600">
                                        {formatDate(ev.startDate)} {ev.endDate ? `- ${formatDate(ev.endDate)}` : ''}
                                    </div>
                                    <div className="text-sm text-gray-600">Category: {ev.category}</div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <button onClick={() => handleEdit(ev)} className="text-sm px-2 py-1 border rounded">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ev._id)}
                                        className="text-sm px-2 py-1 border rounded text-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            {ev.notes && <div className="mt-2 text-sm">{ev.notes}</div>}
                            {ev.url && (
                                <div className="mt-1">
                                    <a className="text-blue-600 underline" href={ev.url} target="_blank" rel="noreferrer">
                                        {ev.url}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AddEventModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={() => fetchEventsForDate(selectedDate)}
                initialData={editingEvent}
            />
        </div>
    );

}

function dateISO(d) {
    const dt = new Date(d);
    const pad = n => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
}


