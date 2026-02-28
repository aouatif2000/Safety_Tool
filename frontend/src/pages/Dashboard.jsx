import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, FileText, FolderPlus, Layout,
  ArrowUpRight, Calendar, CheckCircle, AlertCircle, Shield, Camera,
  TrendingUp, Clock
} from "lucide-react";
import * as api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { api.getDashboard().then(setData).catch(console.error); }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="page">
      {/* Welcome */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
            {greeting}, Aouatif
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{dateStr}</p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 16px", background: "var(--success-light)",
          borderRadius: 24, fontSize: 13, fontWeight: 600, color: "var(--success)",
          border: "1px solid rgba(16,185,129,0.15)"
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
          Fully Compliant
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Projects", value: data?.stats?.projects || 0, icon: FolderPlus, color: "#0e4a6e", bg: "#e8f4fc" },
          { label: "Documents", value: data?.stats?.documents || 0, icon: FileText, color: "#7c3aed", bg: "#ede9fe" },
          { label: "Active Sessions", value: data?.stats?.active || 0, icon: Clock, color: "#ea580c", bg: "#fff7ed" },
          { label: "Inspections", value: data?.stats?.inspections || 0, icon: Camera, color: "#0891b2", bg: "#ecfeff" },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--text-muted)", marginBottom: 14 }}>
          Quick Actions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "AI Document", icon: Sparkles, color: "#7c3aed", bg: "#ede9fe", path: "/toolbox" },
            { label: "Toolbox Sessions", icon: FileText, color: "#0e4a6e", bg: "#e8f4fc", path: "/toolbox" },
            { label: "New Project", icon: FolderPlus, color: "#059669", bg: "#d1fae5", path: "/projects" },
            { label: "AI Inspection", icon: Camera, color: "#0891b2", bg: "#ecfeff", path: "/inspection" },
          ].map(action => (
            <div
              key={action.label}
              className="card card-hover"
              style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", padding: "16px 18px" }}
              onClick={() => navigate(action.path)}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: action.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <action.icon size={18} color={action.color} />
              </div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} color="var(--primary)" /> Recent Activity
            </h3>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>View all →</button>
          </div>
          {data?.recentActivity?.length > 0 ? (
            data.recentActivity.map(item => (
              <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
              <Clock size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
              <div style={{ fontSize: 13 }}>No recent activity</div>
            </div>
          )}
        </div>

        {/* Overview */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Layout size={16} color="var(--primary)" /> Overview
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Complete", value: data?.stats?.complete || 0, color: "#059669", bg: "#d1fae5" },
              { label: "In Review", value: data?.stats?.inReview || 0, color: "#d97706", bg: "#fef3c7" },
              { label: "Active", value: data?.stats?.active || 0, color: "#dc2626", bg: "#fee2e2" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", padding: 14, background: s.bg, borderRadius: 10 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 14 }}>
            {[
              { label: "View Planning", icon: Calendar },
              { label: "Compliance Center", icon: CheckCircle },
            ].map(link => (
              <div key={link.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", cursor: "pointer" }}>
                <span style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}>
                  <link.icon size={14} /> {link.label}
                </span>
                <ArrowUpRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>

        {/* Safety AI Chat */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, var(--primary), #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                Safety Q&A
                <span style={{ fontSize: 10, background: "var(--primary-light)", color: "var(--primary)", padding: "2px 7px", borderRadius: 6, marginLeft: 6, fontWeight: 700 }}>AI</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Safety expert assistant</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.6 }}>
            Ask questions about workplace safety, PPE requirements, VCA regulations, and legislation.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {["Which PPE is required...", "How often should a tool..."].map(q => (
              <div key={q} style={{ padding: "7px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
                {q}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width: "100%", marginTop: "auto" }}>
            <Sparkles size={16} /> Start a Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
