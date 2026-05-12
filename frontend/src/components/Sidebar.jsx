import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Wrench, AlertCircle, TrendingUp,
  FileText, Lock, Moon, Settings, LogOut, Shield, Plus, BookOpen, ClipboardCheck, QrCode
} from "lucide-react";
import "../styles/sidebar.css";

const navGroups = [
  {
    label: "Services",
    items: [
      { id: "dashboard",      label: "Dashboard",          icon: LayoutDashboard, path: "/" },
      { id: "toolbox",        label: "  Toolbox Service",  icon: Wrench,           path: "/toolbox" },
      { id: "create-project", label: "New Project",         icon: Plus,             path: "/toolbox/create" },
      { id: "incidents",      label: "  Incident Reporting", icon: AlertCircle,     path: "/incidents" },
      { id: "risk",           label: "  Risk Assessment",  icon: TrendingUp,       path: "/risk-assessment" },
      { id: "permits",        label: "  Permit System",    icon: FileText,         path: "/permits" },
      { id: "access",         label: "  Access Control",   icon: Lock,             path: "/access-control" },
    ]
  },
  {
    label: "Administration",
    items: [
      { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
    ]
  }
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const quickAccessItems = [
    { id: "to-approve",   label: "To Approve",   icon: ClipboardCheck, path: "/toolbox/review/DOC-0001" },
    { id: "sign-qr",      label: "Sign QR Code", icon: QrCode,         path: "/toolbox/proj-1778011972910/session/DOC-0001" },
  ];

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("dark-mode", next);
  };

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
          <div className="sidebar-logo-name">Safety Tool</div>
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

      {/* Quick Access — static links */}
      <div className="sidebar-group">
        <div className="sidebar-group-label">Quick Access</div>
        {quickAccessItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
            title={item.label}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="sidebar-item-icon" size={20} />
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-item" title="Dark Mode" onClick={toggleDarkMode}>
          <Moon className="sidebar-item-icon" size={20} style={{ color: darkMode ? "var(--primary)" : undefined }} />
          <span className="sidebar-item-label">{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button className="sidebar-item" title="Settings" onClick={() => navigate("/settings")}>
          <Settings className="sidebar-item-icon" size={20} />
          <span className="sidebar-item-label">Settings</span>
        </button>
        <div className="sidebar-user">
          <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 11 }}>AT</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Abdelali</div>
            <div className="sidebar-user-role">User</div>
          </div>
          <LogOut size={15} style={{ marginLeft: "auto", opacity: expanded ? 0.5 : 0, color: "var(--text-muted)" }} />
        </div>
      </div>
    </aside>
  );
}
