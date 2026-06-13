import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        background: "#111827",
        padding: "20px 40px",
        borderBottom: "1px solid #1f2937",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h2>Carbon Marketplace</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/">Dashboard</Link>
        <Link to="/create">Create</Link>
        <Link to="/manage">Manage</Link>
        <Link to="/registry">Registry</Link>
      </div>
    </nav>
  );
}