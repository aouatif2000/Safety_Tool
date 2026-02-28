import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Globe, Bell } from "lucide-react";

const breadcrumbMap = {
  "/": "Dashboard",
  "/toolbox": "Toolbox",
  "/inspection": "Inspection",
  "/projects": "Projects",
};

export default function Header({ onNewRequest }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageName = () => {
    for (const [path, name] of Object.entries(breadcrumbMap)) {
      if (location.pathname.startsWith(path) && path !== "/") return name;
    }
    return breadcrumbMap["/"];
  };

  return (
    <header className="app-header">
      <div className="header-breadcrumb">
        <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Dashboard</span>
        {location.pathname !== "/" && (
          <>
            <span style={{ color: "var(--border)" }}>/</span>
            <strong>{getPageName()}</strong>
          </>
        )}
      </div>

      <div className="header-actions">
        <button className="btn-new-request" onClick={onNewRequest}>
          <Plus size={16} />
          New request
        </button>
        <div className="header-org">
          apex <span className="badge">Pro</span>
        </div>
        <Globe size={18} color="var(--text-muted)" style={{ cursor: "pointer" }} />
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>EN</span>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell size={18} color="var(--text-muted)" />
          <span style={{
            position: "absolute", top: -3, right: -3,
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent)", border: "2px solid white"
          }} />
        </div>
        <div className="user-avatar">AT</div>
      </div>
    </header>
  );
}
