import React, { useState, useRef } from "react";
import {
  Camera, AlertTriangle, AlertCircle, Info, Sparkles
} from "lucide-react";
import * as api from "../services/api";

const severityConfig = {
  High: { color: "var(--danger)", bg: "var(--danger-light)", icon: AlertTriangle },
  Medium: { color: "var(--warning)", bg: "var(--warning-light)", icon: AlertCircle },
  Low: { color: "#3498db", bg: "#ebf5fb", icon: Info },
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
    try {
      const result = await api.analyzePhoto(file);
      setReport(result);
    } catch (err) {
      alert("Inspection failed: " + err.message);
    }
    setLoading(false);
  };

  const reset = () => {
    setReport(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "var(--accent-light)", display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <Sparkles size={20} color="var(--accent)" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>
            AI Photo Inspection
            <span style={{
              fontSize: 11, background: "var(--warning-light)", color: "var(--warning)",
              padding: "2px 8px", borderRadius: 8, marginLeft: 8, fontWeight: 600
            }}>
              Beta
            </span>
          </h1>
        </div>
      </div>

      {!report && !loading && (
        <div style={{
          background: "var(--bg-white)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "60px 32px",
          textAlign: "center", maxWidth: 680, margin: "0 auto"
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: 20,
            background: "var(--bg)", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", position: "relative"
          }}>
            <Camera size={44} color="var(--text-secondary)" />
            <div style={{
              position: "absolute", top: -4, right: -4,
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--warning)", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <Sparkles size={14} color="white" />
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Start AI Inspection
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
            Upload a site photo to automatically detect safety hazards or quality defects using AI vision.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <button
            className="btn btn-primary btn-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={18} /> Take or Select Photo
          </button>

          <p style={{ color: "var(--text-light)", fontSize: 13, marginTop: 20 }}>
            Tip: Use high-resolution photos for best results
          </p>
        </div>
      )}

      {loading && (
        <div style={{
          background: "var(--bg-white)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "60px 32px",
          textAlign: "center", maxWidth: 680, margin: "0 auto"
        }}>
          {preview && (
            <img src={preview} alt="Uploaded" style={{
              maxWidth: 300, maxHeight: 200, borderRadius: 12,
              marginBottom: 24, objectFit: "cover"
            }} />
          )}
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ fontWeight: 600, fontSize: 16 }}>Analyzing photo...</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Our AI is scanning for safety hazards and quality issues
          </p>
        </div>
      )}

      {report && (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {preview && (
            <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
              <img src={preview} alt="Inspected" style={{ width: "100%", maxHeight: 300, objectFit: "cover" }} />
            </div>
          )}

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Inspection Results</h2>
              <span style={{
                padding: "4px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: report.findings.length > 0 ? "var(--danger-light)" : "var(--success-light)",
                color: report.findings.length > 0 ? "var(--danger)" : "var(--success)"
              }}>
                {report.findings.length} issue{report.findings.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {report.findings.map((finding, i) => {
              const sev = severityConfig[finding.severity] || severityConfig.Low;
              const SevIcon = sev.icon;
              return (
                <div key={finding.id} style={{
                  border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                  padding: 16, marginBottom: 12, borderLeft: `4px solid ${sev.color}`
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <SevIcon size={16} color={sev.color} />
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: "2px 8px",
                      borderRadius: 8, background: sev.bg, color: sev.color
                    }}>
                      {finding.severity}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                      {finding.category}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, marginBottom: 8 }}>{finding.description}</p>
                  <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
                    Recommendation: {finding.recommendation}
                  </p>
                </div>
              );
            })}
          </div>

          <div style={{
            padding: 14, background: "var(--warning-light)", borderRadius: "var(--radius-sm)",
            fontSize: 13, color: "var(--text)", marginBottom: 20
          }}>
            <strong>⚠️ Disclaimer:</strong> {report.disclaimer}
          </div>

          <button className="btn btn-outline" onClick={reset}>
            <Camera size={16} /> Inspect Another Photo
          </button>
        </div>
      )}
    </div>
  );
}
