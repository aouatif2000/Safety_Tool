import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, ChevronRight, MapPin } from "lucide-react";
import * as api from "../services/api";

export default function ToolboxProjects() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { api.getProjects().then(setProjects).catch(console.error); }, []);

  return (
    <div className="page">
      <div style={{ textAlign: "center", padding: "48px 0 36px" }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: "linear-gradient(135deg, var(--primary-light), #dbeafe)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", border: "1px solid rgba(14,74,110,0.08)"
        }}>
          <FolderOpen size={34} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>Select a Project</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Choose a project to view or start toolbox sessions</p>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {projects.map(project => (
          <div
            key={project.id}
            className="card card-hover"
            style={{ display: "flex", alignItems: "center", padding: "20px 24px", marginBottom: 12, cursor: "pointer" }}
            onClick={() => navigate(`/toolbox/${project.id}`)}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 18, flexShrink: 0 }}>
              <FolderOpen size={22} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>{project.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 13, marginTop: 3 }}>
                <MapPin size={13} /> {project.location}
              </div>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        ))}
        {projects.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>No projects found.</div>
        )}
      </div>
    </div>
  );
}
