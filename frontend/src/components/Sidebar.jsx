import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [displayName, setDisplayName] = useState("Dashboard");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) return;
        const me = await res.json();
        setDisplayName(
          me.familyName && me.familyName.trim()
            ? me.familyName
            : me.name || "Dashboard"
        );
      } catch {}
    })();
  }, []);

  return (
    <div
      style={{
        width: "200px",
        background: "#222",
        color: "white",
        padding: "20px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>{displayName}</h2>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <Link to="/dashboard/budget" style={{ color: "white" }}>
              Budget
            </Link>
          </li>
          <li>
            <Link to="/dashboard/calendar" style={{ color: "white" }}>
              Calendar
            </Link>
          </li>
          <li>
            <Link to="/dashboard/articles" style={{ color: "white" }}>
              Articles
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
