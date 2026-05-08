import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share2, Users, CheckSquare, Trash2, FileText, UserCheck, FileSignature, QrCode, MapPin, ClipboardList } from "lucide-react";
import * as api from "../services/api";
import { API_BASE } from "../services/api";

export default function SessionDetail() {
  const { projectId, sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("document");
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

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
    { id: "document",   label: "Document",    icon: FileText },
    { id: "attendance", label: "Attendance",   icon: UserCheck },
    { id: "signatures", label: "Signatures",   icon: FileSignature },
    { id: "qrcode",     label: "QR Code",      icon: QrCode },
    { id: "audit",      label: "Audit Trail",  icon: ClipboardList },
  ];

  const loadQr = () => {
    if (qrData || qrLoading) return;
    setQrLoading(true);
    fetch(`${API_BASE}/toolbox/documents/${session.id}/qr`)
      .then(r => r.json())
      .then(d => { if (d.success) setQrData(d); })
      .catch(() => {})
      .finally(() => setQrLoading(false));
  };

  const loadAudit = () => {
    if (auditData || auditLoading) return;
    setAuditLoading(true);
    fetch(`${API_BASE}/toolbox/documents/${session.id}/audit`)
      .then(r => r.json())
      .then(d => { if (d.success) setAuditData(d); })
      .catch(() => {})
      .finally(() => setAuditLoading(false));
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    if (id === "qrcode") loadQr();
    if (id === "audit")  loadAudit();
  };

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
          <button
            className="btn btn-outline btn-sm"
            title="Download as PDF"
            onClick={() => window.open(`${API_BASE}/toolbox/export/${session.id}?format=pdf`)}
          >
            <Download size={14} /> Download PDF
          </button>
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
          <button key={tab.id} className={`tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => handleTabChange(tab.id)}>
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
        <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
          {qrLoading && (
            <div style={{ padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
          )}
          {!qrLoading && qrData && (
            <>
              <img
                src={qrData.qrDataUrl}
                alt="QR Code for digital sign-off"
                width={220}
                height={220}
                style={{ borderRadius: 12, border: "2px solid var(--border)", marginBottom: 20 }}
              />
              <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Scan to Sign</p>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16, maxWidth: 360, margin: "0 auto 16px" }}>
                Workers scan this QR code on their phone to sign off digitally. Link expires in 24 h.
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", wordBreak: "break-all", maxWidth: 400, margin: "0 auto 20px" }}>
                {qrData.signUrl}
              </p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setQrData(null); loadQr(); }}
              >
                <QrCode size={14} /> Regenerate
              </button>
            </>
          )}
          {!qrLoading && !qrData && (
            <>
              <QrCode size={56} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p style={{ color: "var(--text-muted)" }}>Could not load QR code.</p>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => { setQrData(null); loadQr(); }}>Retry</button>
            </>
          )}
        </div>
      )}

      {activeTab === "audit" && (
        <div>
          {auditLoading && (
            <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
          )}
          {!auditLoading && auditData && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Audit Log */}
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Audit Log</h3>
                <div style={{ position: "relative", paddingLeft: 24 }}>
                  {[...auditData.auditLog].reverse().map((entry, i) => {
                    const dotColor = {
                      created:          "#6b7280",
                      content_edited:   "#f97316",
                      review:           "#3b82f6",
                      rejected_to_draft:"#ef4444",
                      approved:         "#16a34a",
                      signed:           "#8b5cf6",
                    }[entry.action] || "#9ca3af";
                    return (
                      <div key={i} style={{ position: "relative", paddingBottom: 20 }}>
                        {/* vertical line */}
                        {i < auditData.auditLog.length - 1 && (
                          <span style={{ position: "absolute", left: -18, top: 20, bottom: 0, width: 2, background: "#e5e7eb" }} />
                        )}
                        {/* dot */}
                        <span style={{ position: "absolute", left: -24, top: 4, width: 12, height: 12, borderRadius: "50%", background: dotColor, border: "2px solid #fff", boxShadow: "0 0 0 2px " + dotColor + "40" }} />
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", textTransform: "capitalize" }}>
                          {entry.action.replace(/_/g, " ")}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>
                          by <strong>{entry.actor}</strong>
                          {entry.fromStatus && entry.fromStatus !== entry.toStatus && (
                            <span> &nbsp;·&nbsp; {entry.fromStatus} → {entry.toStatus}</span>
                          )}
                        </div>
                        {entry.note && (
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{entry.note}</div>
                        )}
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sign-Offs */}
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>
                  Sign-Offs ({auditData.signoffs.length})
                </h3>
                {auditData.signoffs.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "32px 0" }}>No sign-offs yet. Share the QR code to collect signatures.</p>
                ) : (
                  auditData.signoffs.map((sig, i) => (
                    <div key={sig.id || i} style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{sig.name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(sig.signedAt).toLocaleString()}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        {sig.attended   && <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", borderRadius: 4, padding: "2px 7px" }}>Attended</span>}
                        {sig.understood && <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", borderRadius: 4, padding: "2px 7px" }}>Understood</span>}
                        {sig.willApply  && <span style={{ fontSize: 11, background: "#ede9fe", color: "#5b21b6", borderRadius: 4, padding: "2px 7px" }}>Will Apply</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {!auditLoading && !auditData && (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: "var(--text-muted)" }}>Could not load audit data.</p>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => { setAuditData(null); loadAudit(); }}>Retry</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
