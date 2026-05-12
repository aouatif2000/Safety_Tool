import React, { useState } from "react";
import { FileText, Plus, X, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const PERMIT_TYPES = ["Hot Work", "Working at Heights", "Confined Space Entry", "Electrical Isolation", "Excavation", "Other"];

const STATUS_META = {
  Active:   { color: "#059669", bg: "#d1fae5", icon: CheckCircle },
  Pending:  { color: "#d97706", bg: "#fef3c7", icon: Clock },
  Expired:  { color: "#dc2626", bg: "#fee2e2", icon: AlertTriangle },
  Closed:   { color: "#6b7280", bg: "#f3f4f6", icon: X },
};

const EMPTY_FORM = {
  type: "Hot Work",
  location: "",
  description: "",
  requestedBy: "",
  validFrom: new Date().toISOString().split("T")[0],
  validUntil: "",
  status: "Pending",
};

export default function Permits() {
  const [permits, setPermits] = useState([
    { id: 1, type: "Hot Work", location: "Workshop B", description: "Welding of structural beams", requestedBy: "J. Bakker", validFrom: "2026-05-10", validUntil: "2026-05-11", status: "Active" },
    { id: 2, type: "Working at Heights", location: "Roof Level 3", description: "Inspection and repair of roof cladding", requestedBy: "A. Taha", validFrom: "2026-05-11", validUntil: "2026-05-12", status: "Pending" },
    { id: 3, type: "Electrical Isolation", location: "Main Panel Room", description: "Panel replacement works", requestedBy: "P. Smit", validFrom: "2026-05-08", validUntil: "2026-05-09", status: "Expired" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState("All");

  const handleAdd = () => {
    if (!form.location || !form.requestedBy || !form.validUntil) return;
    setPermits(prev => [...prev, { ...form, id: Date.now() }]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleStatusChange = (id, status) => {
    setPermits(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleDelete = (id) => {
    if (window.confirm("Cancel and remove this permit?")) {
      setPermits(prev => prev.filter(p => p.id !== id));
    }
  };

  const filtered = filter === "All" ? permits : permits.filter(p => p.status === filter);

  const counts = Object.fromEntries(
    ["Active", "Pending", "Expired", "Closed"].map(s => [s, permits.filter(p => p.status === s).length])
  );

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#e8f4fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={24} color="#0e4a6e" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Permit System</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Manage work permits and approvals</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> New Permit
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Active",   value: counts.Active,   ...STATUS_META.Active },
          { label: "Pending",  value: counts.Pending,  ...STATUS_META.Pending },
          { label: "Expired",  value: counts.Expired,  ...STATUS_META.Expired },
          { label: "Closed",   value: counts.Closed,   ...STATUS_META.Closed },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", cursor: "pointer", outline: filter === s.label ? "2px solid var(--primary)" : undefined }} onClick={() => setFilter(f => f === s.label ? "All" : s.label)}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: "2px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>New Permit Request</h3>
            <button className="modal-close" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}><X size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Permit Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {PERMIT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. Workshop B" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Work Description</label>
              <input className="form-input" placeholder="Brief description of work..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Requested By <span className="required">*</span></label>
              <input className="form-input" placeholder="Name" value={form.requestedBy} onChange={e => setForm({ ...form, requestedBy: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Valid From</label>
              <input className="form-input" type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Valid Until <span className="required">*</span></label>
              <input className="form-input" type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.location || !form.requestedBy || !form.validUntil}>Submit Request</button>
          </div>
        </div>
      )}

      {/* Permits List */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Permits {filter !== "All" ? `— ${filter}` : ""} ({filtered.length})</span>
          {filter !== "All" && <button className="btn btn-ghost btn-sm" onClick={() => setFilter("All")}>Show all</button>}
        </div>
        {filtered.map((p, i) => {
          const meta = STATUS_META[p.status] || STATUS_META.Closed;
          const Icon = meta.icon;
          return (
            <div key={p.id} style={{ padding: "16px 20px", borderTop: i > 0 ? "1px solid var(--border-light)" : undefined, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <Icon size={18} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{p.type}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: meta.bg, color: meta.color }}>{p.status}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{p.description || "—"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span>📍 {p.location}</span>
                  <span>👤 {p.requestedBy}</span>
                  <span>📅 {p.validFrom} → {p.validUntil}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {p.status === "Pending" && (
                  <button className="btn btn-accent btn-sm" onClick={() => handleStatusChange(p.id, "Active")}>Approve</button>
                )}
                {p.status === "Active" && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleStatusChange(p.id, "Closed")}>Close</button>
                )}
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent)" }} onClick={() => handleDelete(p.id)}><X size={14} /></button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <FileText size={36} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No permits found</div>
            <div style={{ fontSize: 13 }}>Click "New Permit" to create a work permit.</div>
          </div>
        )}
      </div>
    </div>
  );
}
