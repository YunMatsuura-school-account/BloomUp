import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AvatarDropUpload from "../../components/AvatarDropUpload";
import personIcon from "../../icons/person_icon.png";
import AddEventModal from "../../components/AddEventModal";

export default function ChildDashboard() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const BASE = import.meta.env.VITE_BACKEND_URL;

  const [child, setChild] = useState(null);
  const [meId, setMeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [events, setEvents] = useState([]);
  const [eventErr, setEventErr] = useState("");
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) {
      return null;
    }
    const birth = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateMonth = (dateOfBirth) => {
    if (!dateOfBirth) {
      return null;
    }
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const month = today.getMonth() - birth.getMonth();
    return month;
  };

  const formatEventDate = (iso) => {
    if (!iso || isNaN(new Date(iso))) {
      return "";
    }
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeRange = (startIso, endIso) => {
    const start = startIso ? new Date(startIso) : null;
    const end = endIso ? new Date(endIso) : null;
    const t = (d) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (start && end) {
      return `${t(start)} ~ ${t(end)}`;
    }
    if (start) {
      return `${t(start)}`;
    }
    if (end) {
      return `~ ${t(end)}`;
    }
    return "";
  };

  const fetchEvents = async (userId, token) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fromIso = today.toISOString();
    const urls = [
      `${BASE}/api/calendar?childId=${childId}&from=${fromIso}`,
      `${BASE}/api/calendar?child=${childId}&start=${fromIso}`,
      `${BASE}/api/calendar`,
    ];

    let raw = [];

    for (const url of urls) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok || res.status === 204) continue;

      const body = await res.json().catch(() => null);
      const arr = Array.isArray(body)
        ? body
        : body?.events || body?.data || [];

      if (!Array.isArray(arr) || arr.length === 0) continue;

      raw = arr;
      break;
    }

    const cid = String(childId);
    const upcoming = (raw || [])
      .filter((e) => {
        const kids = Array.isArray(e.children)
          ? e.children.map((x) =>
              typeof x === "string" ? x : x && (x._id || String(x))
            )
          : [];
        const hasChild = kids.map(String).includes(cid);
        const start = e.startDate ? new Date(e.startDate) : null;
        return hasChild && start && start >= today;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    setEvents(upcoming);
  };

  useEffect(() => {
    let aborted = false; // avoid setState() to be called
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const meRes = await fetch(`${BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }, // include auth info in request header. Bearer is a type of token. It means "use the following token to authorize"
        });

        if (!meRes.ok) {
          if (meRes.status === 401 || meRes.status === 403) {
            localStorage.removeItem("accessToken");
            navigate("/login");
            return;
          }
          throw new Error("Auth failed");
        }
        const me = await meRes.json();
        if (!aborted) {
          setMeId(me.id);
        }

        const response = await fetch(
          `${BASE}/api/users/${me.id}/children/${childId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          throw new Error(`GET ${response.status}`);
        }
        const childData = await response.json();
        if (!aborted) {
          setChild(childData);
        }

        if (!aborted) {
          await fetchEvents(me.id, token);
        }
      } catch (e) {
        if (!aborted) {
          setErr("Failed to load child");
        }
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      aborted = true;
    };
  }, [BASE, childId, navigate]);

  const onEdit = () => {
    navigate("/add-child", {
      state: { child, childId: child?._id, userId: meId, returnPath: `/child-dashboard/${childId}` },
    });
  };

  if (loading) {
    return <p className="text-white p-6">Loading...</p>;
  }

  if (err) {
    return <p className="text-red-400 p-6">{err}</p>;
  }
  if (!child) {
    return <p className="text-red-400 p-6">Child not found</p>;
  }

  const age = calculateAge(child.dateOfBirth);
  const month = calculateMonth(child.dateOfBirth);

  return (
    <div className="page-surface space-y-6">
      <div className="flex items-center justify-center">
        <h1 className="text-[30px] text-black text-center">Child Dashboard</h1>
      </div>
      <hr className="mt-3 mb-10 border-black/20" />

      {/* Child Information Section */}
      <div className="flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <AvatarDropUpload
            mode="child"
            userId={meId}
            childId={childId}
            currentUrl={child?.imageUrl ?? null}
            onUploaded={(url) =>
              setChild((currentChildData) => ({
                ...(currentChildData || {}),
                imageUrl: url,
              }))
            }
            onEdit={onEdit}
          />
        </div>

        <div className="text-[20px] font-semibold text-black/90 tracking-wide">
          {child.name}
        </div>
        <div className="text-black/60 text-sm">
          {age !== null ? `${age} years` : ""}
          {child.dateOfBirth ? " " : ""}
          {child.dateOfBirth
            ? month == 1
              ? `${month} month`
              : `${month} months`
            : ""}
        </div>
      </div>

      {/* Upcoming Events */}
      <h2 className="mt-12 text-[20px] font-semibold text-black/90 text-center">
        Upcoming Events
      </h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center text-black/60 py-8">
            {eventErr ? eventErr : "No upcoming events"}
          </div>
        ) : (
          events.map((ev) => {
            const headerDate = formatEventDate(
              ev.startDate || ev.date || ev.start
            );
            const headerTime = formatTimeRange(
              ev.startDate || ev.start,
              ev.endDate || ev.end
            );
            const title =
              ev?.title || ev?.name || ev?.name || "Untiltled Event";
            const notes = ev?.notes || ev?.description || "";

            return (
              <div
                key={ev._id}
                className="rounded-2xl bg-black/5 px-6 py-5 shadow-sm cursor-pointer hover:bg-black/10 transition-colors"
                onClick={() => {
                  setSelectedEvent(ev);
                  setIsAddEventModalOpen(true);
                }}
              >
                <div className="flex items-center justify-between text-sm text-black/60">
                  <span className="font-medium">{headerDate}</span>
                  <span>{headerTime}</span>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <img src={personIcon} alt="person icon" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-black/90">{title}</div>
                  {notes && (
                    <p className="mt-1 text-sm text-black/60 line-blamp-2">
                      {notes}
                    </p>
                  )}
                </div>
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
            if (token && meId) {
              await fetchEvents(meId, token);
            }
          }}
          initialData={selectedEvent ? {
            _id: selectedEvent._id,
            title: selectedEvent.title || selectedEvent.name,
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
