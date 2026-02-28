import React from "react";
import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const nameMap = {
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/requests": "Requests",
  "/planning": "Planning",
  "/traffic": "Traffic Planning",
  "/site-operations": "Site Operations",
  "/subcontractors": "Subcontractors",
  "/quality": "Quality Control",
  "/certificates": "Certificates",
  "/library": "Global Library",
};

export default function PlaceholderPage() {
  const location = useLocation();
  const name = nameMap[location.pathname] || "Page";

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <Construction size={48} color="var(--text-light)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{name}</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 400 }}>
          This module is under development. Check back soon for updates.
        </p>
      </div>
    </div>
  );
}
