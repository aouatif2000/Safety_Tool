import React, { useState } from "react";
import { Lock, Plus, X, CheckCircle, UserX, Shield, Key } from "lucide-react";

const ROLES   = ["Worker", "Supervisor", "HSEQ Manager", "Contractor", "Visitor"];
const ZONES   = ["Site Entrance", "Workshop A", "Workshop B", "Roof Access", "Electrical Room", "Chemical Storage"];
const EMPTY_PERSON = { name: "", role: "Worker", zones: [], badgeId: "" };

function ZoneTag({ zone, onRemove }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: 5, fontSize: 12, fontWeight: 600 }}>
      {zone}
      {onRemove && <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 0, color: "var(--primary)" }}><X size={10} /></button>}
    </span>
  );
}

export default function AccessControl() {
  const [personnel, setPersonnel] = useState([
    { id: 1, name: "Abdelali Taha",   role: "HSEQ Manager",  zones: ["Site Entrance", "Workshop A", "Workshop B", "Roof Access"], badgeId: "B-001", active: true },
    { id: 2, name: "Jan Bakker",       role: "Supervisor",    zones: ["Site Entrance", "Workshop A", "Workshop B"],               badgeId: "B-002", active: true },
    { id: 3, name: "Peter Smit",       role: "Electrician",   zones: ["Site Entrance", "Electrical Room"],                        badgeId: "B-003", active: true },
    { id: 4, name: "Sara Kowalski",    role: "Contractor",    zones: ["Site Entrance", "Workshop B"],                             badgeId: "B-004", active: false },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_PERSON });
  const [filterZone, setFilterZone] = useState("All");

  const toggleZone = (zone) => {
    setForm(prev => ({
      ...prev,
      zones: prev.zones.includes(zone) ? prev.zones.filter(z => z !== zone) : [...prev.zones, zone],
    }));
  };

  const handleAdd = () => {
    if (!form.name) return;
    setPersonnel(prev => [...prev, { ...form, id: Date.now(), active: true }]);
    setForm({ ...EMPTY_PERSON });
    setShowForm(false);
  };

  const toggleActive = (id) => {
    setPersonnel(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleRemove = (id) => {
    if (window.confirm("Remove this person from access control?")) {
      setPersonnel(prev => prev.filter(p => p.id !== id));
    }
  };

  const filtered = filterZone === "All" ? personnel : personnel.filter(p => p.zones.includes(filterZone));
  const activeCount = personnel.filter(p => p.active).length;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#ecfeff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={24} color="#0891b2" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Access Control</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Manage personnel access to site zones</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> Add Person
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Active Personnel",  value: activeCount,                  color: "#059669", bg: "#d1fae5", icon: CheckCircle },
          { label: "Inactive / Revoked", value: personnel.length - activeCount, color: "#dc2626", bg: "#fee2e2", icon: UserX },
          { label: "Access Zones",      value: ZONES.length,                 color: "#0891b2", bg: "#ecfeff", icon: Key },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px" }}>
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

      {/* Zone filter chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["All", ...ZONES].map(z => (
          <button
            key={z}
            onClick={() => setFilterZone(z)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border-light)",
              background: filterZone === z ? "var(--primary)" : "var(--bg-subtle)",
              color:      filterZone === z ? "white"          : "var(--text-secondary)",
            }}
          >{z}</button>
        ))}
      </div>

      {/* Add Person Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: "2px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Add Person</h3>
            <button className="modal-close" onClick={() => { setShowForm(false); setForm({ ...EMPTY_PERSON }); }}><X size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Badge ID</label>
              <input className="form-input" placeholder="e.g. B-005" value={form.badgeId} onChange={e => setForm({ ...form, badgeId: e.target.value })} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Permitted Zones</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {ZONES.map(z => (
                <button
                  key={z}
                  type="button"
                  onClick={() => toggleZone(z)}
                  style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid",
                    borderColor: form.zones.includes(z) ? "var(--primary)" : "var(--border-light)",
                    background:  form.zones.includes(z) ? "var(--primary-light)" : "var(--bg-subtle)",
                    color:       form.zones.includes(z) ? "var(--primary)"       : "var(--text-secondary)",
                  }}
                >{z}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={() => { setShowForm(false); setForm({ ...EMPTY_PERSON }); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name}>Add Person</button>
          </div>
        </div>
      )}

      {/* Personnel List */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)", fontWeight: 700, fontSize: 14 }}>
          Personnel — {filterZone === "All" ? "All Zones" : filterZone} ({filtered.length})
        </div>
        {filtered.map((p, i) => (
          <div key={p.id} style={{ padding: "14px 20px", borderTop: i > 0 ? "1px solid var(--border-light)" : undefined, display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: p.active ? "var(--primary-light)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: 14, color: p.active ? "var(--primary)" : "#9ca3af" }}>
              {p.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.role}</span>
                {p.badgeId && <span style={{ fontSize: 11, padding: "2px 7px", background: "var(--bg-subtle)", borderRadius: 5, color: "var(--text-muted)", fontFamily: "monospace" }}>{p.badgeId}</span>}
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: p.active ? "#d1fae5" : "#fee2e2", color: p.active ? "#059669" : "#dc2626" }}>
                  {p.active ? "Active" : "Revoked"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {p.zones.length > 0 ? p.zones.map(z => <ZoneTag key={z} zone={z} />) : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No zones assigned</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm" title={p.active ? "Revoke access" : "Restore access"} onClick={() => toggleActive(p.id)}>
                {p.active ? <UserX size={14} color="#ea580c" /> : <CheckCircle size={14} color="#059669" />}
              </button>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent)" }} onClick={() => handleRemove(p.id)}><X size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <Shield size={36} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No personnel found</div>
            <div style={{ fontSize: 13 }}>Click "Add Person" to grant site access.</div>
          </div>
        )}
      </div>
    </div>
  );
}
