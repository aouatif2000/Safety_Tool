import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  AlertTriangle
} from "lucide-react";
import * as api from "../services/api";

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  draft:    { label: "Draft",       bg: "#f3f4f6", color: "#374151", icon: FileText },
  review:   { label: "In Review",   bg: "#fef3c7", color: "#92400e", icon: Clock },
  approved: { label: "Approved",    bg: "#d1fae5", color: "#065f46", icon: CheckCircle }
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px",
      background: meta.bg,
      color: meta.color,
      borderRadius: 20,
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: 0.3
    }}>
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

const ACTION_LABELS = {
  created:          { label: "Document created",          color: "#6b7280" },
  content_edited:   { label: "Content edited",            color: "#2563eb" },
  review:           { label: "Submitted for review",      color: "#d97706" },
  approved:         { label: "Approved",                  color: "#059669" },
  rejected_to_draft:{ label: "Rejected — sent back",      color: "#dc2626" },
  signed:           { label: "Signed off",                color: "#7c3aed" }
};

function AuditTimeline({ log }) {
  if (!log || log.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "16px 0" }}>
        No audit events yet.
      </p>
    );
  }

  return (
    <div style={{ position: "relative", paddingLeft: 24 }}>
      {/* vertical line */}
      <div style={{
        position: "absolute", left: 7, top: 8, bottom: 8,
        width: 2, background: "var(--border-light)"
      }} />

      {[...log].reverse().map((entry, idx) => {
        const meta = ACTION_LABELS[entry.action] || { label: entry.action, color: "#6b7280" };
        return (
          <div key={idx} style={{ display: "flex", gap: 12, marginBottom: 18, position: "relative" }}>
            {/* dot */}
            <div style={{
              position: "absolute", left: -24,
              width: 14, height: 14, borderRadius: "50%",
              background: meta.color,
              border: "2px solid white",
              boxShadow: "0 0 0 2px " + meta.color + "33",
              top: 3
            }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: meta.color }}>
                {meta.label}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 3, fontSize: 12, color: "var(--text-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <User size={11} /> {entry.actor}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={11} />
                  {new Date(entry.timestamp).toLocaleString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </span>
                {entry.fromStatus && (
                  <span style={{ color: "#9ca3af" }}>
                    {entry.fromStatus} → {entry.toStatus}
                  </span>
                )}
              </div>
              {entry.note && (
                <div style={{ marginTop: 2, fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>
                  {entry.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function DocumentReview() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [isActing, setIsActing] = useState(false);

  const loadDocument = useCallback(async () => {
    try {
      const response = await api.getSession(documentId); // reuses getSession which hits /toolbox/documents/:id
      setDoc(response);
    } catch (err) {
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleApprove = async () => {
    // eslint-disable-next-line no-alert
    const actor = window.prompt("Enter your name to approve this document:", "");
    if (!actor || !actor.trim()) return;
    setIsActing(true);
    setActionError(null);
    try {
      await api.approveDocument(documentId, actor.trim());
      await loadDocument();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsActing(false);
    }
  };

  const handleReject = async () => {
    // eslint-disable-next-line no-alert
    const actor = window.prompt("Enter your name to reject and send back for rework:", "");
    if (!actor || !actor.trim()) return;
    setIsActing(true);
    setActionError(null);
    try {
      await api.rejectDocument(documentId, actor.trim());
      await loadDocument();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsActing(false);
    }
  };

  // ── render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="page">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => navigate("/toolbox")}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Document not found</h1>
        </div>
        <p style={{ color: "var(--text-muted)" }}>
          The document with ID <code>{documentId}</code> does not exist or has been deleted.
        </p>
        <Link to="/toolbox" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14 }}>
          ← Back to Toolbox
        </Link>
      </div>
    );
  }

  const status = doc.metadata?.status || doc.status || "draft";
  const auditLog = doc.auditLog || [];
  const isInReview = status === "review";
  const isApproved = status === "approved";

  return (
    <div className="page">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: 8, marginTop: 2 }}
            onClick={() => navigate("/toolbox")}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {doc.title}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
              Document ID: <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{doc.id}</span>
              {doc.metadata?.createdBy && ` · Created by ${doc.metadata.createdBy}`}
              {doc.metadata?.createdAt && ` · ${new Date(doc.metadata.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`}
            </p>
          </div>
        </div>

        {/* ── Action buttons (only in review state) ──────────────── */}
        {isInReview && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0, marginTop: 4 }}>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleReject}
              disabled={isActing}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <XCircle size={14} />
              {isActing ? "Processing…" : "Reject / Send back"}
            </button>
            <button
              className="btn btn-accent btn-sm"
              onClick={handleApprove}
              disabled={isActing}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#059669", color: "white", border: "none" }}
            >
              <CheckCircle size={14} />
              {isActing ? "Processing…" : "Approve"}
            </button>
          </div>
        )}
      </div>

      {/* ── Action error banner ──────────────────────────────────── */}
      {actionError && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px",
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "var(--radius-md)",
          marginBottom: 16,
          fontSize: 13, fontWeight: 600, color: "#b91c1c"
        }}>
          <AlertTriangle size={14} />
          {actionError}
        </div>
      )}

      {/* ── Approved confirmation banner ─────────────────────────── */}
      {isApproved && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          background: "#d1fae5",
          border: "1px solid #6ee7b7",
          borderRadius: "var(--radius-md)",
          marginBottom: 20,
          fontSize: 13, fontWeight: 600, color: "#065f46"
        }}>
          <CheckCircle size={15} />
          This document has been approved by <strong style={{ marginLeft: 4 }}>{doc.metadata?.approvedBy}</strong>
          {doc.metadata?.approvedAt && (
            <span style={{ fontWeight: 400, marginLeft: 4 }}>
              on {new Date(doc.metadata.approvedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      )}

      {/* ── Two-column layout ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
        {/* Document content */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-muted)", marginBottom: 16 }}>
            Document Content
          </h3>
          <div style={{
            fontFamily: "inherit",
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--text-dark)",
            maxHeight: 600,
            overflowY: "auto"
          }}>
            {(doc.rawMarkdown || "").split("\n").map((line, idx) => {
              if (line.match(/^#{1,3}\s/)) {
                const level = line.match(/^#+/)[0].length;
                return (
                  <div key={idx} style={{
                    fontSize: 16 - (level - 1) * 2,
                    fontWeight: 700,
                    marginTop: idx > 0 ? 14 : 0,
                    marginBottom: 6,
                    color: level === 1 ? "var(--text-dark)" : level === 2 ? "var(--primary)" : "var(--text-dark)"
                  }}>
                    {line.replace(/^#+\s/, "")}
                  </div>
                );
              }
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return <div key={idx} style={{ paddingLeft: 16, marginBottom: 3 }}>• {line.slice(2)}</div>;
              }
              if (line.trim() === "") return <div key={idx} style={{ height: 8 }} />;
              return <div key={idx} style={{ marginBottom: 4 }}>{line}</div>;
            })}
          </div>
        </div>

        {/* Audit trail sidebar */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-muted)", marginBottom: 20 }}>
            Audit Trail
          </h3>
          <AuditTimeline log={auditLog} />
        </div>
      </div>
    </div>
  );
}
