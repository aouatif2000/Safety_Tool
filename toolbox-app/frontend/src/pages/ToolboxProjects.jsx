import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, ChevronRight, MapPin } from "lucide-react";
import * as api from "../services/api";

export default function ToolboxProjects() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getProjects().then(setProjects).catch(console.error);
  }, []);

  return (
    <div className="page">
      <div style={{ textAlign: "center", padding: "40px 0 32px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16, background: "var(--bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px"
        }}>
          <FolderOpen size={32} color="var(--text-secondary)" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Select a Project</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Choose a project to view or start toolbox sessions
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {projects.map(project => (
          <div
            key={project.id}
            className="card card-hover"
            style={{
              display: "flex", alignItems: "center", padding: "18px 24px",
              marginBottom: 12, cursor: "pointer"
            }}
            onClick={() => navigate(`/toolbox/${project.id}`)}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: "var(--bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginRight: 16, flexShrink: 0
            }}>
              <FolderOpen size={20} color="var(--text-secondary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{project.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>
                <MapPin size={13} /> {project.location}
              </div>
            </div>
            <ChevronRight size={20} color="var(--text-light)" />
          </div>
        ))}

        {projects.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-secondary)" }}>
            No projects found. Create a project first.
          </div>
        )}
      </div>
    </div>
  );
}
