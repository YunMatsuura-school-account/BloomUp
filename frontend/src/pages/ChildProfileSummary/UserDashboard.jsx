import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AvatarDropUpload from "../../components/AvatarDropUpload";
import AddEventModal from "../../components/AddEventModal";

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

        if (Array.isArray(userData.children) && userData.children.length > 0) {
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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
            return hasAnyChild && start && start >= today;
          })
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        //   .slice(0, 8);

        if (!aborted) setEvents(upcoming);
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
          events.map((ev) => {
            const start = new Date(ev.startDate);
            const end = new Date(ev.endDate || ev.startDate);

            const kids = Array.isArray(ev.children) ? ev.children : [];
            const firstKidId = kids.length
              ? String(
                  typeof kids[0] === "string" ? kids[0] : kids[0]?._id || kids[0]
                )
              : null;
            const kidName =
              children.find((c) => String(c._id || c.id) === firstKidId)?.name ||
              "";
            return (
              <div
                key={ev._id}
                className="rounded-2xl px-6 py-5 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: "#FFFFFF" }}
                onClick={() => {
                  setSelectedEvent(ev);
                  setIsAddEventModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between text-sm text-black/60">
                  <span>
                    {start.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span>
                    {start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ~{" "}
                    {end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="mt-2 font-semibold text-black/90">
                  {ev.title || ev.name || ev.type || "Untitled Event"}
                </div>
                {kidName && (
                  <div className="text-sm text-black/50 mt-1">for {kidName}</div>
                )}
                {ev.description && (
                  <p className="mt-1 text-sm text-black/60 line-clamp-2">
                    {ev.description}
                  </p>
                )}
              </div>
            );
          })
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
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const childIds = me?.children
                    ? me.children.map((x) =>
                        typeof x === "string" ? x : x?._id || String(x)
                      )
                    : [];
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
                      return hasAnyChild && start && start >= today;
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
