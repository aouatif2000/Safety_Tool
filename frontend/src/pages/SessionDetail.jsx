import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share2, Users, XCircle, CheckSquare, Trash2, FileText, UserCheck, FileSignature, QrCode, MapPin } from "lucide-react";
import * as api from "../services/api";

export default function SessionDetail() {
  const { projectId, sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("document");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSession(sessionId).then(s => { setSession(s); setLoading(false); }).catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}><div className="spinner" /></div>;
  if (!session) return <div className="page"><p>Session not found.</p></div>;

  const handleStatusChange = async (status) => {
    try { const updated = await api.updateSessionStatus(session.id, status); setSession(updated); } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this session?")) { await api.deleteSession(session.id); navigate(`/toolbox/${projectId}`); }
  };

  const tabs = [
    { id: "document", label: "Document", icon: FileText },
    { id: "attendance", label: "Attendance", icon: UserCheck },
    { id: "signatures", label: "Signatures", icon: FileSignature },
    { id: "qrcode", label: "QR Code", icon: QrCode }
  ];

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <button className="btn btn-ghost" style={{ padding: 8, marginTop: 2 }} onClick={() => navigate(`/toolbox/${projectId}`)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{session.title}</h1>
              <span className={`badge-status badge-${session.status.toLowerCase()}`}>{session.status}</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>{session.location} • Version {session.version}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Download</button>
          <button className="btn btn-outline btn-sm"><Share2 size={14} /> Share</button>
          <button className="btn btn-outline btn-sm"><Users size={14} /> Delegate</button>
          <button className="btn btn-accent btn-sm" onClick={() => handleStatusChange("Closed")}><CheckSquare size={14} /> Close</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={14} /> Delete</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 24, fontSize: 14, color: "var(--text-secondary)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckSquare size={14} /> {new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> {session.location}</span>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "document" && session.document && (
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
            <FileText size={18} color="var(--primary)" /> Toolbox Document
          </h3>
          <div className="document-content">
            <h1>{session.document.title}</h1>
            {session.document.sections.map((section, i) => (
              <div key={i}>
                <h2>{section.heading}</h2>
                {section.content.split("\n").map((line, j) => {
                  if (line.startsWith("**") && line.endsWith("**")) return <h3 key={j}>{line.replace(/\*\*/g, "")}</h3>;
                  if (line.startsWith("**")) {
                    const parts = line.split("**");
                    return <p key={j}>{parts.map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}</p>;
                  }
                  if (line.startsWith("•") || line.startsWith("✅") || line.startsWith("-")) return <p key={j} style={{ paddingLeft: 16 }}>{line}</p>;
                  if (line.trim() === "") return <br key={j} />;
                  return <p key={j}>{line}</p>;
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="card" style={{ textAlign: "center", padding: 56, color: "var(--text-muted)" }}>
          <UserCheck size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>Attendance tracking</p>
          <p style={{ fontSize: 13 }}>{session.attendees} attendee(s) registered</p>
        </div>
      )}

      {activeTab === "signatures" && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Signatures ({session.signatures})</h3>
          {session.signatureList?.length > 0 ? session.signatureList.map(sig => (
            <div key={sig.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 500 }}>{sig.name}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(sig.signedAt).toLocaleString()}</span>
            </div>
          )) : <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 36 }}>No signatures yet. Share the QR code to collect signatures.</p>}
        </div>
      )}

      {activeTab === "qrcode" && (
        <div className="card" style={{ textAlign: "center", padding: 56 }}>
          <div style={{ width: 140, height: 140, borderRadius: 16, background: "var(--bg-subtle)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <QrCode size={80} color="var(--text)" />
          </div>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Scan to Sign</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20, maxWidth: 360, margin: "0 auto 20px" }}>
            Workers can scan this QR code on their phone to sign the document digitally.
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 20 }}>
            {session.qrCode || "N/A"}
          </p>
          <button className="btn btn-outline">Regenerate QR Code</button>
        </div>
      )}
    </div>
  );
}
