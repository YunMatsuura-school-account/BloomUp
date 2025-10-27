import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AvatarDropUpload from "../../components/AvatarDropUpload";

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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const fromIso = today.toISOString();
        const urls = [
          `${BASE}/api/calendar?childId=${childId}&from=${fromIso}`,
          `${BASE}/api/calendar?child=${childId}&start=${fromIso}`,
          `${BASE}/api/calendar`,
        ];

        let raw = [];
        let usedUrl = "";

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
          usedUrl = res.url;
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
          if (!aborted) setEvents(upcoming);

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
      state: { child, childId: child?._id, userId: meId },
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

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[30px] text-white text-center">Child Dashboard</h1>
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
            ? new Date(child.dateOfBirth).toLocaleDateString()
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
          events.map((ev) => (
            <div
              key={ev._id}
              className="rounded-2xl bg-black/5 px-6 py-5 shadow-sm"
            >
              <div className="flex items-start justify-between text-sm text-black/60">
                <span>
                  {new Date(ev.startDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ~{" "}
                  {new Date(ev.endDate || ev.startDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="mt-2 font-semibold text-black/90">
                {ev.type || ev.title || ev.name || "Untitled Event"}
              </div>
              {ev.notes && (
                <p className="mt-1 text-sm text-black/60 line-clamp-2">
                  {ev.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
