import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const BASE = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[30px] text-white text-center">User Dashboard</h1>
        <div className="space-x-2">
          <button
            className="px-3 py-2 rounded bg-sky-500 text-white"
            onClick={onEdit}
          >
            Edit
          </button>
        </div>
      </div>
      <hr className="mt-3 mb-10 border-black/20" />

      {/* Avatar Section - 全体をコンテナで囲む */}
      <div className="flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-500 text-white text-3xl">
            📷
          </div>
          <button
            type="button"
            className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-white shadow text-xl"
            aria-label="Edit avatar"
          >
            ✏️
          </button>
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
    </div>
  );
}
