import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, MapPin, Users, FileSignature, Play, ChevronDown,
  FolderOpen
} from "lucide-react";
import * as api from "../services/api";

export default function ToolboxSessions() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [project, setProject] = useState(null);

  useEffect(() => {
    api.getSessions(projectId).then(setSessions).catch(console.error);
    api.getProject(projectId).then(setProject).catch(console.error);
  }, [projectId]);

  return (
    <div className="page">
      {/* Sub-header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => navigate("/toolbox")}
          >
            <FolderOpen size={16} /> {project?.name || "Project"} <ChevronDown size={14} />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Toolbox Meetings</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm">
            <Calendar size={16} /> Schedule
          </button>
          <button className="btn btn-primary btn-sm">
            <Play size={16} /> Hold Live Toolbox
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>
        All Sessions
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
        {sessions.map(session => (
          <div
            key={session.id}
            className="card card-hover"
            style={{ cursor: "pointer", padding: 20 }}
            onClick={() => navigate(`/toolbox/${projectId}/session/${session.id}`)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{session.title}</h3>
              <span className={`badge-status badge-${session.status.toLowerCase()}`}>
                {session.status}
              </span>
            </div>

            <span className="badge-category">{session.category}</span>

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                <Calendar size={14} />
                {new Date(session.date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                <MapPin size={14} />
                {session.location}
              </div>
            </div>

            <div style={{
              marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-light)",
              display: "flex", gap: 20, fontSize: 13, color: "var(--text-secondary)"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={14} /> {session.attendees} attendees
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FileSignature size={14} /> {session.signatures} signatures
              </span>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--text-secondary)" }}>
          No sessions yet. Create a new document request to generate your first Toolbox Talk.
        </div>
      )}
    </div>
  );
}
