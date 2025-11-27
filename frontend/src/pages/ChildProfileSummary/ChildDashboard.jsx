import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ChildAvatar from "../../components/ChildAvatar";
import AddEventModal from "../../components/AddEventModal";
import Loader from "../../components/Loader";

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

  const formatDateTimeRange = (startIso, endIso) => {
    const start = startIso ? new Date(startIso) : null;
    const end = endIso ? new Date(endIso) : null;
    
    if (!start) return [];
    
    const formatDate = (d) => {
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    };
    
    const formatTime = (d) => {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    };
    
    if (start && end) {
      const startDate = formatDate(start);
      const startTime = formatTime(start);
      const endDate = formatDate(end);
      const endTime = formatTime(end);
      
      // If same day, show: "Oct 03 10:00 ~ 14:30"
      if (startDate === endDate) {
        return [
          { type: "date", text: startDate },
          { type: "time", text: startTime },
          { type: "separator", text: " ~ " },
          { type: "time", text: endTime }
        ];
      }
      // If different days, show: "Oct 03 10:00 ~ Oct 06 14:30"
      return [
        { type: "date", text: startDate },
        { type: "time", text: startTime },
        { type: "separator", text: " ~ " },
        { type: "date", text: endDate },
        { type: "time", text: endTime }
      ];
    }
    
    if (start) {
      return [
        { type: "date", text: formatDate(start) },
        { type: "time", text: formatTime(start) }
      ];
    }
    
    return [];
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
      const arr = Array.isArray(body) ? body : body?.events || body?.data || [];

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
      state: {
        child,
        childId: child?._id,
        userId: meId,
        returnPath: `/child-dashboard/${childId}`,
      },
    });
  };


  if (loading) {
    return <Loader />;
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
    <div className="page-surface" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="p-6">
        {/* Child Dashboard Title and HR - hidden on mobile */}
        <div className="hidden md:flex items-center justify-center">
          <h1 className="text-[30px] text-black text-center mt-3">Child Dashboard</h1>
        </div>
        <hr className="hidden md:block mt-3 border-black/100" style={{ borderWidth: "2px", marginBottom: "60px" }} />

      {/* Child Information Section */}
      <div className="flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-32 w-32 md:h-[140px] md:w-[140px] items-center justify-center rounded-full overflow-hidden">
            <div className="md:hidden">
              <ChildAvatar child={child} width={128} height={128} />
            </div>
            <div className="hidden md:block">
              <ChildAvatar child={child} width={140} height={140} />
            </div>
          </div>
          {/* Edit Button - Pencil Icon */}
          <button
            onClick={onEdit}
            className="absolute -bottom-1 -right-1 w-10 h-10 md:w-[44px] md:h-[44px] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity border border-black"
            style={{
              backgroundColor: "#238D88",
            }}
            aria-label="Edit child profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M13.9999 4.00038L17.9999 8.00038M20.1739 5.81238C20.7026 5.2838 20.9997 4.56685 20.9998 3.81923C20.9999 3.07162 20.703 2.35459 20.1744 1.82588C19.6459 1.29717 18.9289 1.00009 18.1813 1C17.4337 0.999906 16.7166 1.2968 16.1879 1.82538L2.84193 15.1744C2.60975 15.4059 2.43805 15.6909 2.34193 16.0044L1.02093 20.3564C0.99509 20.4429 0.993138 20.5347 1.01529 20.6222C1.03743 20.7097 1.08285 20.7896 1.14673 20.8534C1.21061 20.9172 1.29055 20.9624 1.37809 20.9845C1.46563 21.0065 1.55749 21.0044 1.64393 20.9784L5.99693 19.6584C6.3101 19.5631 6.59511 19.3925 6.82693 19.1614L20.1739 5.81238Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="font-semibold text-black tracking-wide md:text-[28px] md:leading-[28px]" style={{ fontSize: "20px", lineHeight: "20px" }}>
          {child.name}
        </div>
        <div className="text-black font-medium -mt-2 md:text-[18px] md:leading-[18px]" style={{ fontSize: "14px", lineHeight: "14px" }}>
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
      <h2 className="text-left md:text-center md:text-[28px] font-semibold text-black/90 md:mt-[60px]" style={{ fontSize: "20px", marginTop: "48px" }}>
        Upcoming Events
      </h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center text-black/60 py-8">
            {eventErr ? eventErr : "No upcoming events"}
          </div>
        ) : (
          events.map((ev) => {
            const dateTimeRange = formatDateTimeRange(
              ev.startDate || ev.start,
              ev.endDate || ev.end
            );
            const title =
              ev?.title || ev?.name || ev?.name || "Untiltled Event";
            const notes = ev?.notes || ev?.description || "";

            return (
              <div
                key={ev._id}
                className="rounded-2xl px-6 py-5 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: "#FFFFFF", height: "187px" }}
                onClick={() => {
                  setSelectedEvent(ev);
                  setIsAddEventModalOpen(true);
                }}
              >
                <div className="text-sm text-right">
                  {dateTimeRange.map((part, index) => {
                    if (part.type === "date") {
                      return (
                        <span key={index} className="text-black font-semibold">
                          {part.text}
                        </span>
                      );
                    } else if (part.type === "time") {
                      const prevPart = index > 0 ? dateTimeRange[index - 1] : null;
                      const needsSpace = prevPart && prevPart.type === "date";
                      return (
                        <span key={index} className="text-black/60 font-normal">
                          {needsSpace ? " " : ""}
                          {part.text}
                        </span>
                      );
                    } else {
                      return (
                        <span key={index} className="text-black/60 font-normal">
                          {part.text}
                        </span>
                      );
                    }
                  })}
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <div className="w-[76px] h-[76px] rounded-full overflow-hidden flex-shrink-0">
                    <ChildAvatar child={child} width={76} height={76} />
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
          })
        )}
      </div>

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
          initialData={
            selectedEvent
              ? {
                  _id: selectedEvent._id,
                  title: selectedEvent.title || selectedEvent.name,
                  children: Array.isArray(selectedEvent.children)
                    ? selectedEvent.children.map((child) =>
                        typeof child === "string"
                          ? child
                          : child?._id || String(child)
                      )
                    : [],
                  category: selectedEvent.category || "Others",
                  startDate: selectedEvent.startDate || selectedEvent.start,
                  endDate: selectedEvent.endDate || selectedEvent.end,
                  alert: selectedEvent.alert,
                  notes: selectedEvent.notes || selectedEvent.description,
                  url: selectedEvent.url,
                  attachments: Array.isArray(selectedEvent.attachments)
                    ? selectedEvent.attachments.join(", ")
                    : selectedEvent.attachments || "",
                }
              : null
          }
        />
      )}
    </div>
  );
}
