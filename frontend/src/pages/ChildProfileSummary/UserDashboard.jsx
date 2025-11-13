import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AvatarDropUpload from "../../components/AvatarDropUpload";
import AddEventModal from "../../components/AddEventModal";
import ChildAvatar from "../../components/ChildAvatar";
import "../../styles/articles.css";

export default function UserDashboard() {
  const BASE = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [children, setChildren] = useState([]);
  const [events, setEvents] = useState([]);
  const [evErr, setEvErr] = useState("");
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    let aborted = false;
    (async () => {
        const token = localStorage.getItem("accessToken");
        let childIds = [];
      try {
        
        if (!token) {
          return navigate("/login");
        }

        const response = await fetch(`${BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("accessToken");
          return navigate("/login");
        }

        const userData = await response.json();
        if (!aborted) {
          setMe(userData);
        }

        // Fetch children data
        if (userData.id) {
          const childrenRes = await fetch(`${BASE}/api/users/${userData.id}/children`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (childrenRes.ok) {
            const childrenData = await childrenRes.json();
            if (!aborted) {
              setChildren(Array.isArray(childrenData) ? childrenData : []);
            }
            if (Array.isArray(childrenData) && childrenData.length > 0) {
              childIds = childrenData.map((x) =>
                typeof x === "string" ? x : x?._id || String(x)
              );
            }
          }
        }

        if (Array.isArray(userData.children) && userData.children.length > 0 && childIds.length === 0) {
          childIds = userData.children.map((x) =>
            typeof x === "string" ? x : x?._id || String(x)
          );
        }
      } catch (e) {
        if (!aborted) {
          setErr("Failed to load user data");
          console.error(e);
        }
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }

      const calRes = await fetch(`${BASE}/api/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!calRes.ok) {
        if (!aborted) {
          setEvErr("Failed to load calendar");
        }
      } else {
        const body = await calRes.json().catch(() => null);
        const raw = Array.isArray(body)
          ? body
          : body?.events || body?.data || [];
        const now = new Date(); // Use current date and time instead of today at 00:00
        const childSet = new Set(childIds.map(String));

        const upcoming = (raw || [])
          .filter((e) => {
            const kids = Array.isArray(e.children)
              ? e.children.map((x) =>
                  typeof x === "string" ? x : x && (x._id || String(x))
                )
              : [];
            const hasAnyChild = kids.some((k) => childSet.has(String(k)));
            const start = e.startDate ? new Date(e.startDate) : null;
            return hasAnyChild && start && start > now; // Use > instead of >= to exclude current/past events
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        //   .slice(0, 8);

        if (!aborted) setEvents(upcoming);
      }

      // Fetch saved articles
      try {
        const savedRes = await fetch(`${BASE}/api/articles/saved/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          if (!aborted && savedData.success) {
            setSavedArticles(Array.isArray(savedData.data) ? savedData.data : []);
          }
        }
      } catch (error) {
        console.error("Error fetching saved articles:", error);
        if (!aborted) {
          setSavedArticles([]);
        }
      }
    })();

    return () => {
      // unmount
      aborted = true;
    };
  }, [BASE, navigate]);

  if (loading) {
    return <p className="text-white p-6">Loading...</p>;
  }

  if (err) {
    return <p className="text-red-400 p-6">{err}</p>;
  }
  if (!me) {
    return <p className="text-red-400 p-6">User not found</p>;
  }

  const onEdit = () => {
    navigate("/settings", {
      state: { user: me, userId: me?.id },
    });
  };

  const formatDateTimeRange = (startIso, endIso) => {
    const start = startIso ? new Date(startIso) : null;
    const end = endIso ? new Date(endIso) : null;
    
    if (!start) return "";
    
    const formatDate = (d) => {
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    };
    
    const formatTime = (d) => {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };
    
    if (start && end) {
      const startDate = formatDate(start);
      const startTime = formatTime(start);
      const endDate = formatDate(end);
      const endTime = formatTime(end);
      
      // If same day, show: "Oct 03 10:00 ~ 14:30"
      if (startDate === endDate) {
        return `${startDate} ${startTime} ~ ${endTime}`;
      }
      // If different days, show: "Oct 03 10:00 ~ Oct 06 14:30"
      return `${startDate} ${startTime} ~ ${endDate} ${endTime}`;
    }
    
    if (start) {
      return `${formatDate(start)} ${formatTime(start)}`;
    }
    
    return "";
  };

  return (
    <div className=" page-surface page-container p-6 space-y-4">
      <div className="flex items-center justify-center">
        <h1 className="text-[30px] text-black/100 text-center">User Dashboard</h1>
      </div>
      <hr className="mt-3 mb-10 border-black/20" />

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        {/* Avatar */}

        <div className="relative">
            <AvatarDropUpload 
                mode="user"
                userId={me?.id || me?._id}
                currentUrl={me?.imageUrl ?? null}
                onUploaded={(url) => 
                    setMe((m) => ({ ...(m || {}), imageUrl: url }))
            }
            onEdit={onEdit}
            />
        </div>

        <div className="text-[20px] font-semibold text-black/90 tracking-wide">
          {me.name}
        </div>
        <div className="text-black/60 text-sm">
          address
          {/* To be revised  */}
        </div>
      </div>

      {/* Upcoming Events */}
      <h2 className="mt-12 text-[20px] font-semibold text-black/90 text-center">
        Family Upcoming Events
      </h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center text-black/60 py-8">
            {evErr ? evErr : "No upcoming events"}
          </div>
        ) : (
          events.flatMap((ev) => {
            const kids = Array.isArray(ev.children) ? ev.children : [];
            const dateTimeRange = formatDateTimeRange(
              ev.startDate || ev.start,
              ev.endDate || ev.end
            );
            const title = ev?.title || ev?.name || ev?.type || "Untitled Event";
            const notes = ev?.notes || ev?.description || "";

            // Create a card for each child associated with this event
            return kids.map((kidRef) => {
              const kidId = String(
                typeof kidRef === "string" ? kidRef : kidRef?._id || kidRef
              );
              const child = children.find(
                (c) => String(c._id || c.id) === kidId
              );

              // Only show card if child exists
              if (!child) return null;

              return (
                <div
                  key={`${ev._id}-${kidId}`}
                  className="rounded-2xl px-6 py-5 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ backgroundColor: "#FFFFFF" }}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setIsAddEventModalOpen(true);
                  }}
                >
                  <div className="text-sm text-black/60 text-right">
                    <span className="font-semibold">{dateTimeRange}</span>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <ChildAvatar child={child} width={40} height={40} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-black/90">{title}</div>
                      {notes && (
                        <p className="mt-1 text-sm text-black/60 line-clamp-2">
                          {notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean); // Remove null entries
          })
        )}
      </div>

      {/* Saved Articles Section */}
      <h2 className="mt-12 text-[20px] font-semibold text-black/90 text-center">
        Saved Articles
      </h2>
      <div className="mt-6">
        {savedArticles.length === 0 ? (
          <div className="text-center text-black/60 py-8">
            No saved articles
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedArticles.map((article) => (
              <div
                key={article._id}
                className="saved-article-card-wireframe fade-in cursor-pointer"
                onClick={() => navigate(`/articles/${article._id}`, {
                  state: { article, fromPage: 'saved' }
                })}
              >
                <img 
                  src={article.image} 
                  alt={article.title} 
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                  }}
                />
                <div className="saved-article-card-content">
                  <p className="text-xs text-gray-600 font-medium uppercase mb-1">
                    {article.category}
                  </p>
                  <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {article.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {isAddEventModalOpen && (
        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => {
            setIsAddEventModalOpen(false);
            setSelectedEvent(null);
          }}
          onSaved={async () => {
            setIsAddEventModalOpen(false);
            setSelectedEvent(null);
            // Reload events after saving
            const token = localStorage.getItem("accessToken");
            if (token) {
              try {
                const calRes = await fetch(`${BASE}/api/calendar`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (calRes.ok) {
                  const body = await calRes.json().catch(() => null);
                  const raw = Array.isArray(body)
                    ? body
                    : body?.events || body?.data || [];
                  const now = new Date(); // Use current date and time
                  const childIds = children.map((x) =>
                    typeof x === "string" ? x : x?._id || String(x)
                  );
                  const childSet = new Set(childIds.map(String));

                  const upcoming = (raw || [])
                    .filter((e) => {
                      const kids = Array.isArray(e.children)
                        ? e.children.map((x) =>
                            typeof x === "string" ? x : x && (x._id || String(x))
                          )
                        : [];
                      const hasAnyChild = kids.some((k) => childSet.has(String(k)));
                      const start = e.startDate ? new Date(e.startDate) : null;
                      return hasAnyChild && start && start > now; // Use > instead of >=
                    })
                    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                  setEvents(upcoming);
                }
              } catch (error) {
                console.error("Error reloading events:", error);
              }
            }
          }}
          initialData={selectedEvent ? {
            _id: selectedEvent._id,
            title: selectedEvent.title || selectedEvent.name || selectedEvent.type,
            children: Array.isArray(selectedEvent.children) 
              ? selectedEvent.children.map(child => 
                  typeof child === 'string' ? child : (child?._id || String(child))
                )
              : [],
            category: selectedEvent.category || 'Others',
            startDate: selectedEvent.startDate || selectedEvent.start,
            endDate: selectedEvent.endDate || selectedEvent.end,
            alert: selectedEvent.alert,
            notes: selectedEvent.notes || selectedEvent.description,
            url: selectedEvent.url,
            attachments: Array.isArray(selectedEvent.attachments) 
              ? selectedEvent.attachments.join(', ') 
              : (selectedEvent.attachments || '')
          } : null}
        />
      )}
    </div>
  );
}
