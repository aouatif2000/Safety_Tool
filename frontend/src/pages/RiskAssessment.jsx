import React, { useState } from "react";
import { TrendingUp, Plus, X, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";

const LIKELIHOODS = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
const SEVERITIES  = ["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"];

function riskScore(likelihood, severity) {
  return (LIKELIHOODS.indexOf(likelihood) + 1) * (SEVERITIES.indexOf(severity) + 1);
}

function riskLevel(score) {
  if (score <= 4)  return { label: "Low",      color: "#059669", bg: "#d1fae5" };
  if (score <= 9)  return { label: "Medium",   color: "#d97706", bg: "#fef3c7" };
  if (score <= 16) return { label: "High",     color: "#ea580c", bg: "#fff7ed" };
  return               { label: "Critical",  color: "#dc2626", bg: "#fee2e2" };
}

const EMPTY_FORM = { title: "", hazard: "", likelihood: "Possible", severity: "Moderate", control: "", owner: "" };

export default function RiskAssessment() {
  const [risks, setRisks] = useState([
    { id: 1, title: "Working at Heights", hazard: "Fall from scaffold", likelihood: "Possible", severity: "Major", control: "Full harness, safety nets, edge barriers", owner: "Site Supervisor" },
    { id: 2, title: "Electrical Work", hazard: "Electric shock / arc flash", likelihood: "Unlikely", severity: "Major", control: "Isolation, LOTO, PPE (insulated gloves)", owner: "Electrician" },
    { id: 3, title: "Manual Handling", hazard: "Musculoskeletal injury", likelihood: "Likely", severity: "Minor", control: "Mechanical aids, team lifts, training", owner: "All Workers" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleAdd = () => {
    if (!form.title || !form.hazard) return;
    setRisks(prev => [...prev, { ...form, id: Date.now() }]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this risk assessment?")) {
      setRisks(prev => prev.filter(r => r.id !== id));
    }
  };

  const stats = {
    low:      risks.filter(r => riskScore(r.likelihood, r.severity) <= 4).length,
    medium:   risks.filter(r => { const s = riskScore(r.likelihood, r.severity); return s > 4 && s <= 9; }).length,
    high:     risks.filter(r => { const s = riskScore(r.likelihood, r.severity); return s > 9 && s <= 16; }).length,
    critical: risks.filter(r => riskScore(r.likelihood, r.severity) > 16).length,
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={24} color="#059669" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Risk Assessment</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Identify, evaluate and control workplace hazards</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> New Risk Assessment
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Low",      value: stats.low,      color: "#059669", bg: "#d1fae5", icon: CheckCircle },
          { label: "Medium",   value: stats.medium,   color: "#d97706", bg: "#fef3c7", icon: Info },
          { label: "High",     value: stats.high,     color: "#ea580c", bg: "#fff7ed", icon: AlertCircle },
          { label: "Critical", value: stats.critical, color: "#dc2626", bg: "#fee2e2", icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{s.label} Risk</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: "2px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>New Risk Assessment</h3>
            <button className="modal-close" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}><X size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Activity / Title <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. Working at Heights" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Responsible Person</label>
              <input className="form-input" placeholder="e.g. Site Supervisor" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Hazard Description <span className="required">*</span></label>
              <input className="form-input" placeholder="Describe the hazard..." value={form.hazard} onChange={e => setForm({ ...form, hazard: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Likelihood</label>
              <select className="form-input" value={form.likelihood} onChange={e => setForm({ ...form, likelihood: e.target.value })}>
                {LIKELIHOODS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select className="form-input" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Control Measures</label>
              <input className="form-input" placeholder="List control measures..." value={form.control} onChange={e => setForm({ ...form, control: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.title || !form.hazard}>Add Risk</button>
          </div>
        </div>
      )}

      {/* Risk Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)", fontWeight: 700, fontSize: 14 }}>
          Risk Register ({risks.length})
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-subtle)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: "var(--text-muted)" }}>
              {["Activity", "Hazard", "Likelihood", "Severity", "Risk Level", "Controls", "Owner", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {risks.map((r, i) => {
              const score = riskScore(r.likelihood, r.severity);
              const level = riskLevel(score);
              return (
                <tr key={r.id} style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : undefined }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600, fontSize: 14 }}>{r.title}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-secondary)", maxWidth: 160 }}>{r.hazard}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{r.likelihood}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{r.severity}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: level.bg, color: level.color, borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      {level.label} ({score})
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-secondary)", maxWidth: 200 }}>{r.control}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>{r.owner}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent)" }} onClick={() => handleDelete(r.id)}><X size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {risks.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <TrendingUp size={36} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No risk assessments yet</div>
            <div style={{ fontSize: 13 }}>Click "New Risk Assessment" to get started.</div>
          </div>
        )}
      </div>
    </div>
  );
}
