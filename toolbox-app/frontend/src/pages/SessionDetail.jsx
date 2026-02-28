import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Share2, Users, XCircle, CheckSquare, Trash2,
  FileText, UserCheck, FileSignature, QrCode, Calendar, MapPin
} from "lucide-react";
import * as api from "../services/api";

export default function SessionDetail() {
  const { projectId, sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("document");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSession(sessionId)
      .then(s => { setSession(s); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page">
        <p>Session not found.</p>
      </div>
    );
  }

  const handleStatusChange = async (status) => {
    try {
      const updated = await api.updateSessionStatus(session.id, status);
      setSession(updated);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      await api.deleteSession(session.id);
      navigate(`/toolbox/${projectId}`);
    }
  };

  const tabs = [
    { id: "document", label: "Document", icon: FileText },
    { id: "attendance", label: "Attendance", icon: UserCheck },
    { id: "signatures", label: "Signatures", icon: FileSignature },
    { id: "qrcode", label: "QR Code", icon: QrCode }
  ];

  return (
    <div className="page">
      {/* Back + Title */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: 8, marginTop: 2 }}
            onClick={() => navigate(`/toolbox/${projectId}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>{session.title}</h1>
              <span className={`badge-status badge-${session.status.toLowerCase()}`}>
                {session.status}
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 2 }}>
              {session.location} • Version {session.version}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Download with signatures</button>
          <button className="btn btn-outline btn-sm"><Share2 size={14} /> Share</button>
          <button className="btn btn-outline btn-sm"><Users size={14} /> Delegate</button>
          <button className="btn btn-outline btn-sm"><XCircle size={14} /> Cancel Session</button>
          <button className="btn btn-accent btn-sm" onClick={() => handleStatusChange("Closed")}>
            <CheckSquare size={14} /> Close Session
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <Trash2 size={14} /> Delete Session
          </button>
        </div>
      </div>

      {/* Meta Info */}
      <div style={{ display: "flex", gap: 24, marginBottom: 20, fontSize: 14, color: "var(--text-secondary)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CheckSquare size={14} /> Started: {new Date(session.date).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
          })}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={14} /> Location: {session.location}
        </span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "document" && session.document && (
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            <FileText size={18} /> Toolbox Document
          </h3>
          <div className="document-content">
            <h1>{session.document.title}</h1>
            {session.document.sections.map((section, i) => (
              <div key={i}>
                <h2>{section.heading}</h2>
                {section.content.split("\n").map((line, j) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <h3 key={j}>{line.replace(/\*\*/g, "")}</h3>;
                  }
                  if (line.startsWith("**")) {
                    const parts = line.split("**");
                    return (
                      <p key={j}>
                        {parts.map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}
                      </p>
                    );
                  }
                  if (line.startsWith("•") || line.startsWith("✅") || line.startsWith("-")) {
                    return <p key={j} style={{ paddingLeft: 16 }}>{line}</p>;
                  }
                  if (line.trim() === "") return <br key={j} />;
                  return <p key={j}>{line}</p>;
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--text-secondary)" }}>
          <UserCheck size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <p>Attendance tracking</p>
          <p style={{ fontSize: 13 }}>{session.attendees} attendee(s) registered</p>
        </div>
      )}

      {activeTab === "signatures" && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Signatures ({session.signatures})</h3>
          {session.signatureList?.length > 0 ? (
            session.signatureList.map(sig => (
              <div key={sig.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 500 }}>{sig.name}</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {new Date(sig.signedAt).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: 32 }}>
              No signatures collected yet. Share the QR code to collect signatures.
            </p>
          )}
        </div>
      )}

      {activeTab === "qrcode" && (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <QrCode size={120} style={{ margin: "0 auto 20px", color: "var(--text)" }} />
          <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Scan to Sign</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
            Workers can scan this QR code with their phone to sign the document.
          </p>
          <p style={{ fontSize: 12, color: "var(--text-light)", fontFamily: "monospace", marginBottom: 20 }}>
            Code: {session.qrCode || "N/A"}
          </p>
          <button className="btn btn-outline">Regenerate QR Code</button>
        </div>
      )}
    </div>
  );
}
