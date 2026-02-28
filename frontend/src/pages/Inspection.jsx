import React, { useState, useRef } from "react";
import { Camera, AlertTriangle, AlertCircle, Info, Sparkles, Shield } from "lucide-react";
import * as api from "../services/api";

const severityConfig = {
  High: { color: "#dc2626", bg: "#fee2e2", icon: AlertTriangle },
  Medium: { color: "#d97706", bg: "#fef3c7", icon: AlertCircle },
  Low: { color: "#0284c7", bg: "#e0f2fe", icon: Info },
};

export default function Inspection() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setLoading(true);
    setReport(null);
    try { const result = await api.analyzePhoto(file); setReport(result); } catch (err) { alert("Inspection failed: " + err.message); }
    setLoading(false);
  };

  const reset = () => { setReport(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--primary), #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={24} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
            AI Photo Inspection
            <span style={{ fontSize: 11, background: "var(--warning-light)", color: "var(--warning)", padding: "3px 10px", borderRadius: 8, marginLeft: 10, fontWeight: 700 }}>Beta</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Automated safety hazard detection powered by AI vision</p>
        </div>
      </div>

      {!report && !loading && (
        <div style={{
          background: "var(--bg-white)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "72px 40px",
          textAlign: "center", maxWidth: 620, margin: "0 auto",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{
            width: 110, height: 110, borderRadius: 28,
            background: "linear-gradient(135deg, var(--primary-light), #dbeafe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", position: "relative",
            border: "1px solid rgba(14,74,110,0.08)"
          }}>
            <Camera size={48} color="var(--primary)" />
            <div style={{
              position: "absolute", top: -4, right: -4,
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(245,158,11,0.4)"
            }}>
              <Sparkles size={15} color="white" />
            </div>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10 }}>Start AI Inspection</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32, maxWidth: 380, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Upload a site photo to automatically detect safety hazards or quality defects using AI vision.
          </p>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileSelect} />
          <button className="btn btn-primary btn-lg" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 15 }}>
            <Camera size={18} /> Take or Select Photo
          </button>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 24 }}>Tip: Use high-resolution photos for best results</p>
        </div>
      )}

      {loading && (
        <div style={{
          background: "var(--bg-white)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "56px 40px",
          textAlign: "center", maxWidth: 620, margin: "0 auto"
        }}>
          {preview && <img src={preview} alt="Uploaded" style={{ maxWidth: 280, maxHeight: 180, borderRadius: 14, marginBottom: 28, objectFit: "cover", border: "1px solid var(--border)" }} />}
          <div className="spinner" style={{ margin: "0 auto 18px", width: 32, height: 32 }} />
          <p style={{ fontWeight: 700, fontSize: 17 }}>Analyzing photo...</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Our AI is scanning for safety hazards and quality issues</p>
        </div>
      )}

      {report && (
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          {preview && (
            <div style={{ marginBottom: 20, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <img src={preview} alt="Inspected" style={{ width: "100%", maxHeight: 280, objectFit: "cover" }} />
            </div>
          )}
          <div className="card" style={{ marginBottom: 20, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>Inspection Results</h2>
              <span style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                background: report.findings.length > 0 ? "#fee2e2" : "#d1fae5",
                color: report.findings.length > 0 ? "#dc2626" : "#059669"
              }}>
                {report.findings.length} issue{report.findings.length !== 1 ? "s" : ""} found
              </span>
            </div>
            {report.findings.map((finding) => {
              const sev = severityConfig[finding.severity] || severityConfig.Low;
              const SevIcon = sev.icon;
              return (
                <div key={finding.id} style={{
                  border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                  padding: 18, marginBottom: 12, borderLeft: `4px solid ${sev.color}`
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <SevIcon size={16} color={sev.color} />
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: sev.bg, color: sev.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{finding.severity}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{finding.category}</span>
                  </div>
                  <p style={{ fontSize: 14, marginBottom: 10, lineHeight: 1.6 }}>{finding.description}</p>
                  <p style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>→ {finding.recommendation}</p>
                </div>
              );
            })}
          </div>
          <div style={{ padding: 16, background: "var(--warning-light)", borderRadius: "var(--radius-sm)", fontSize: 13, border: "1px solid rgba(245,158,11,0.15)", marginBottom: 20 }}>
            <strong>⚠ Disclaimer:</strong> {report.disclaimer}
          </div>
          <button className="btn btn-outline" onClick={reset}><Camera size={16} /> Inspect Another Photo</button>
        </div>
      )}
    </div>
  );
}
