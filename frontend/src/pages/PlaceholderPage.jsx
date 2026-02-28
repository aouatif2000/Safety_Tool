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
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: "var(--bg-subtle)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px"
        }}>
          <Construction size={32} color="var(--text-muted)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{name}</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 360, fontSize: 14, lineHeight: 1.6 }}>
          This module is under development and will be available soon.
        </p>
      </div>
    </div>
  );
}
