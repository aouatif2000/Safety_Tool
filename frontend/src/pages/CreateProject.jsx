import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, FileText } from "lucide-react";
import * as api from "../services/api";

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      alert("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await api.createProject(formData);
      if (result.success || result.id) {
        navigate("/toolbox");
      } else {
        alert("Failed to create project");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <button
          className="btn btn-ghost"
          style={{ padding: 8 }}
          onClick={() => navigate("/toolbox")}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Create New Project
        </h1>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            {/* Project Name */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">
                Project Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Office Renovation 2025"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Location */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">
                Location <span className="required">*</span>
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  background: "var(--bg-subtle)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-light)",
                  marginBottom: 8,
                }}
              >
                <MapPin size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  className="form-input"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    flex: 1,
                  }}
                  placeholder="e.g., Amsterdam, Netherlands"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Used for weather information in planning
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 32 }}>
              <label className="form-label">Description (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your project..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                style={{ minHeight: 120 }}
              />
            </div>

            {/* Info Box */}
            <div
              style={{
                background: "var(--primary-light)",
                border: "1px solid rgba(14,74,110,0.15)",
                borderRadius: "var(--radius-sm)",
                padding: 16,
                marginBottom: 24,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <FileText
                size={18}
                color="var(--primary)"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                <strong>After creating your project:</strong>
                <br />
                You'll be able to create toolbox sessions, generate safety
                documents, and manage all project-related documentation.
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate("/toolbox")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Plus size={16} />
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
