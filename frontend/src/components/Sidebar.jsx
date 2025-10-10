import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "200px",
        background: "#222",
        color: "white",
        padding: "20px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Dashboard</h2>
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
