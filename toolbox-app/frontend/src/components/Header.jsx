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
            <span>/</span>
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
          Apex Strategies <span className="badge">Zekerheid</span>
        </div>
        <Globe size={18} color="var(--text-secondary)" />
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>EN</span>
        <Bell size={18} color="var(--text-secondary)" />
        <div className="user-avatar">SS</div>
      </div>
    </header>
  );
}
