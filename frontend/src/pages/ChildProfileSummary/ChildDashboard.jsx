import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function ChildDashboard() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const BASE = import.meta.env.VITE_BACKEND_URL;

  const [child, setChild] = useState(null);
  const [meId, setMeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
        <div className="space-x-2">
          <button
            className="px-3 py-2 rounded bg-sky-500 text-white"
            onClick={onEdit}
          >
            Edit
          </button>
          <Link
            to="/account"
            className="px-3 py-2 rounded bg-slate-600 text-white"
          >
            ← Back to Your Family
          </Link>
        </div>
      </div>
      <hr className="mt-3 mb-10 border-black/20" />

      {/* Child Information Section */}
      <div className="flex flex-col item-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-32 w-32 item-center justify-center rounded-full bg-gray-500 text-white text-3xl">
            📷
          </div>
          <button
            type="button"
            className="absolute -buttom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-white shadow text-xl"
            aria-label="Edit avatar"
          >
            ✏️
          </button>
        </div>

        <div className="text-[20px] font-semibold text-black/90 tracking-wide">
          {child.name}
        </div>
        <div className="text-black/60 text-sm">
            {age !== null ? `${age} years` : ""}
            {child.dateOfBirth ? " " : ""}
            {child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : ""}
        </div>
      </div>

      {/* Upcoming Events */}
        <h2 className="mt-12 text-[20px] font-senibold text-black/90 text-center">
        Upcoming Events</h2>
    </div>
  );
}
