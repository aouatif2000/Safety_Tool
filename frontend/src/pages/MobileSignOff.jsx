import React, { useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ─── Inline styles (no sidebar/header, mobile-first) ─────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 0 40px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  banner: {
    width: "100%",
    background: "#1a56db",
    color: "#fff",
    padding: "18px 20px 14px",
    textAlign: "center",
  },
  bannerTitle: { fontSize: 20, fontWeight: 700, margin: 0 },
  bannerSub: { fontSize: 13, opacity: 0.85, marginTop: 4 },
  card: {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "28px 24px",
    width: "100%",
    maxWidth: 440,
    marginTop: 28,
  },
  label: {
    display: "block",
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    fontSize: 17,
    padding: "14px 14px",
    borderRadius: 10,
    border: "2px solid #d1d5db",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: "16px 0",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
  },
  checkBox: (checked) => ({
    flexShrink: 0,
    width: 28,
    height: 28,
    borderRadius: 8,
    border: `2.5px solid ${checked ? "#1a56db" : "#d1d5db"}`,
    background: checked ? "#1a56db" : "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    transition: "all 0.15s",
  }),
  checkLabel: { fontSize: 15, color: "#111827", lineHeight: 1.45 },
  checkSub: { fontSize: 13, color: "#6b7280", marginTop: 3 },
  submitBtn: (disabled) => ({
    width: "100%",
    padding: "16px",
    fontSize: 17,
    fontWeight: 700,
    background: disabled ? "#d1d5db" : "#1a56db",
    color: disabled ? "#9ca3af" : "#fff",
    border: "none",
    borderRadius: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    marginTop: 24,
    transition: "background 0.15s",
  }),
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "14px 16px",
    color: "#991b1b",
    fontSize: 14,
    marginTop: 16,
  },
  // ── Success screen ──
  successPage: {
    minHeight: "100vh",
    background: "#f0fdf4",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    textAlign: "center",
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    background: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: 700, color: "#14532d", margin: "0 0 10px" },
  successSub: { fontSize: 15, color: "#166534", maxWidth: 320 },
};

// Checkmark SVG
const Tick = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5L6.5 12L13 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function MobileSignOff() {
  const { token } = useParams();

  const [name, setName] = useState("");
  const [attended, setAttended] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [willApply, setWillApply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [signedName, setSignedName] = useState("");

  const canSubmit = name.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/toolbox/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), attended, understood, willApply }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Sign-off failed. Please try again.");
      }
      setSignedName(name.trim());
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={s.successPage}>
        <div style={s.successCircle}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M10 22L18.5 31L34 13" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={s.successTitle}>Signed successfully!</h1>
        <p style={s.successSub}>
          Thank you, <strong>{signedName}</strong>. Your sign-off has been recorded. You can now close this page.
        </p>
      </div>
    );
  }

  // ── Sign-Off Form ───────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Header banner */}
      <div style={s.banner}>
        <p style={s.bannerTitle}>ApexSentinel</p>
        <p style={s.bannerSub}>Toolbox Talk — Digital Sign-Off</p>
      </div>

      {/* Name field */}
      <div style={s.card}>
        <label style={s.label} htmlFor="signer-name">Your full name</label>
        <input
          id="signer-name"
          type="text"
          placeholder="e.g. Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={s.input}
          autoFocus
          autoComplete="name"
        />
      </div>

      {/* Acknowledgement checkboxes */}
      <div style={{ ...s.card, marginTop: 16 }}>
        <p style={{ ...s.label, marginBottom: 4 }}>Acknowledgements</p>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          Tap each statement that applies to you.
        </p>

        {[
          {
            key: "attended",
            value: attended,
            toggle: () => setAttended(v => !v),
            title: "I attended this toolbox talk",
            sub: "I was present for the full safety briefing",
          },
          {
            key: "understood",
            value: understood,
            toggle: () => setUnderstood(v => !v),
            title: "I understood the content",
            sub: "The risks and controls explained are clear to me",
          },
          {
            key: "willApply",
            value: willApply,
            toggle: () => setWillApply(v => !v),
            title: "I will apply these controls",
            sub: "I commit to following the safety measures on site",
          },
        ].map(({ key, value, toggle, title, sub }) => (
          <div key={key} style={s.checkRow} onClick={toggle} role="checkbox" aria-checked={value}>
            <div style={s.checkBox(value)}>
              {value && <Tick />}
            </div>
            <div>
              <div style={s.checkLabel}>{title}</div>
              <div style={s.checkSub}>{sub}</div>
            </div>
          </div>
        ))}

        {error && <div style={s.errorBox}>{error}</div>}

        <button
          style={s.submitBtn(!canSubmit)}
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-busy={submitting}
        >
          {submitting ? "Submitting…" : "Submit Sign-Off"}
        </button>
      </div>
    </div>
  );
}
