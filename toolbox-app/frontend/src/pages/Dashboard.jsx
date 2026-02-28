import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, FileText, FolderPlus, Layout,
  ArrowUpRight, Calendar, CheckCircle, Clock, AlertCircle, Zap
} from "lucide-react";
import * as api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error);
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="page">
      {/* Welcome Section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>{greeting}, Saad</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            {dateStr}
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 14px", background: "var(--success-light)",
          borderRadius: 20, fontSize: 13, fontWeight: 600, color: "var(--success)"
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
          Fully Compliant
        </div>
      </div>

      {/* Top Row: Getting Started + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Getting Started Card */}
        <div className="card" style={{ gridColumn: "1", background: "var(--bg-white)", cursor: "pointer" }} onClick={() => navigate("/projects")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={22} color="var(--text)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Get Started</div>
              <div style={{ fontWeight: 600 }}>Configure your first project</div>
            </div>
            <ArrowUpRight size={18} color="var(--text-light)" />
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
            Add work activities to start compliance tracking
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Work Activities", "Documents", "Compliance"].map(tag => (
              <span key={tag} style={{
                padding: "3px 10px", background: "var(--bg)", borderRadius: 12,
                fontSize: 12, color: "var(--text-secondary)"
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Projects Count */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <FolderPlus size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{data?.stats?.projects || 0}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Projects</div>
        </div>

        {/* Documents Count */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ede7f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <FileText size={20} color="#7c4dff" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{data?.stats?.documents || 0}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Documents</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary)", marginBottom: 12 }}>
          Quick Actions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "AI Document", icon: Sparkles, color: "#7c4dff", bg: "#ede7f6", path: "/toolbox" },
            { label: "Toolbox", icon: FileText, color: "#e74c3c", bg: "#fdecea", path: "/toolbox" },
            { label: "New Project", icon: FolderPlus, color: "#27ae60", bg: "#eafaf1", path: "/projects" },
            { label: "Documents", icon: Layout, color: "#3498db", bg: "#ebf5fb", path: "/toolbox" },
          ].map(action => (
            <div
              key={action.label}
              className="card card-hover"
              style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: 14 }}
              onClick={() => navigate(action.path)}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: action.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <action.icon size={18} color={action.color} />
              </div>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={16} /> Recent Activity
            </h3>
            <button className="btn btn-ghost btn-sm">All →</button>
          </div>
          {data?.recentActivity?.length > 0 ? (
            data.recentActivity.map(item => (
              <div key={item.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border-light)" }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: 24, color: "var(--text-light)" }}>
              No recent activity
            </div>
          )}
        </div>

        {/* Overview */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Layout size={16} /> Overview
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Complete", value: data?.stats?.complete || 0, color: "var(--success)", bg: "var(--success-light)" },
              { label: "In Review", value: data?.stats?.inReview || 0, color: "var(--warning)", bg: "var(--warning-light)" },
              { label: "Active", value: data?.stats?.active || 0, color: "var(--danger)", bg: "var(--danger-light)" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", padding: 12, background: s.bg, borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={14} /> View Planning
              </span>
              <ArrowUpRight size={14} color="var(--text-light)" />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={14} /> Compliance Center
              </span>
              <ArrowUpRight size={14} color="var(--text-light)" />
            </div>
          </div>
        </div>

        {/* Safety Q&A */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                Safety Q&A <span style={{ fontSize: 11, background: "var(--accent-light)", color: "var(--accent)", padding: "1px 6px", borderRadius: 8, marginLeft: 4 }}>AI</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Safety expert assistant</div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "12px 0" }}>
            Ask questions about workplace safety, PPE requirements, VCA regulations, and legislation.
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {["Which PPE is required...", "How often should a tool..."].map(q => (
              <div key={q} style={{
                padding: "6px 12px", background: "var(--bg)", borderRadius: 8,
                fontSize: 12, color: "var(--text-secondary)", cursor: "pointer"
              }}>
                💬 {q}
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }}>
            <Sparkles size={16} /> Start a Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
