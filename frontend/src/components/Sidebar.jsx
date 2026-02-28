import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FolderOpen, ClipboardList, Send,
  Calendar, Truck, HardHat, Camera, Building2, FileText,
  CheckSquare, Award, Library, Moon, Settings, LogOut, Shield
} from "lucide-react";
import "../styles/sidebar.css";

const navGroups = [
  {
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { id: "projects", label: "Projects", icon: FolderOpen, path: "/projects" },
      { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/tasks" },
      { id: "requests", label: "Requests", icon: Send, path: "/requests" },
    ]
  },
  {
    label: "Site Operations",
    items: [
      { id: "planning", label: "Planning", icon: Calendar, path: "/planning" },
      { id: "traffic", label: "Traffic Planning", icon: Truck, path: "/traffic" },
      { id: "site-ops", label: "Site Operations", icon: HardHat, path: "/site-operations" },
      { id: "inspection", label: "AI Photo Inspection", icon: Camera, path: "/inspection" },
      { id: "subcontractors", label: "Subcontractors", icon: Building2, path: "/subcontractors" },
      { id: "toolbox", label: "Toolbox", icon: FileText, path: "/toolbox" },
    ]
  },
  {
    label: "Quality",
    items: [
      { id: "quality", label: "Quality Control", icon: CheckSquare, path: "/quality" },
    ]
  },
  {
    label: "Compliance",
    items: [
      { id: "certificates", label: "Certificates", icon: Award, path: "/certificates" },
      { id: "library", label: "Global Library", icon: Library, path: "/library" },
    ]
  }
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`sidebar ${expanded ? "expanded" : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <div className="sidebar-logo-icon">
          <Shield size={22} color="white" strokeWidth={2.5} />
        </div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">SafetyTool</div>
          <div className="sidebar-logo-sub">Smart Safety Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map(group => (
          <div key={group.label} className="sidebar-group">
            <div className="sidebar-group-label">{group.label}</div>
            {group.items.map(item => (
              <button
                key={item.id}
                className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                <item.icon className="sidebar-item-icon" size={20} />
                <span className="sidebar-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item" title="Dark Mode">
          <Moon className="sidebar-item-icon" size={20} />
          <span className="sidebar-item-label">Dark Mode</span>
        </button>
        <button className="sidebar-item" title="Settings">
          <Settings className="sidebar-item-icon" size={20} />
          <span className="sidebar-item-label">Settings</span>
        </button>
        <div className="sidebar-user">
          <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 11 }}>AT</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Aouatif</div>
            <div className="sidebar-user-role">AI Developer</div>
          </div>
          <LogOut size={15} style={{ marginLeft: "auto", opacity: expanded ? 0.5 : 0, color: "var(--text-muted)" }} />
        </div>
      </div>
    </aside>
  );
}
