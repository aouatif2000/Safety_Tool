import React, { useState, useEffect } from "react";
import { Send, X, ChevronDown, Check, Info, Camera } from "lucide-react";
import * as api from "../services/api";

const STEPS = [
  { num: 1, label: "Select Document" },
  { num: 2, label: "Provide Context" },
  { num: 3, label: "Review & Confirm" }
];

export default function NewRequestModal({ isOpen, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [projects, setProjects] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDocDropdown, setShowDocDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [context, setContext] = useState({ location: "", tasks: "", parties: "", additionalContext: "" });

  useEffect(() => {
    if (isOpen) {
      api.getProjects().then(setProjects).catch(console.error);
      api.getDocumentTypes().then(setDocTypes).catch(console.error);
      setStep(1);
      setSelectedProject(null);
      setSelectedDocType(null);
      setContext({ location: "", tasks: "", parties: "", additionalContext: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canProceedStep1 = selectedProject && selectedDocType;
  const canProceedStep2 = context.location && context.tasks && context.parties;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const session = await api.createSession({ projectId: selectedProject.id, documentType: selectedDocType.name, context });
      onCreated(session);
      onClose();
    } catch (err) { alert("Failed to generate document: " + err.message); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={16} color="var(--primary)" />
            </div>
            New Document Request
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-subtitle">
          {step === 1 && "Select the document you need"}
          {step === 2 && "Provide context for an audit-proof document"}
          {step === 3 && "Review your request before submission"}
        </div>

        <div className="stepper">
          {STEPS.map((s, i) => (
            <div className="stepper-step" key={s.num}>
              <div className={`stepper-circle ${step === s.num ? "active" : ""} ${step > s.num ? "completed" : ""}`}>
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              {i < STEPS.length - 1 && <div className={`stepper-line ${step > s.num ? "completed" : ""}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">Project <span className="required">*</span></label>
              <div className="dropdown-container">
                <button className="dropdown-trigger" onClick={() => { setShowProjectDropdown(!showProjectDropdown); setShowDocDropdown(false); }}>
                  {selectedProject ? (<span style={{ display: "flex", alignItems: "center", gap: 8 }}><FolderSvg /> {selectedProject.name}</span>) : (<span style={{ color: "var(--text-muted)" }}>Select a project</span>)}
                  <ChevronDown size={16} color="var(--text-muted)" />
                </button>
                {showProjectDropdown && (
                  <div className="dropdown-menu">
                    {projects.map(p => (
                      <div key={p.id} className={`dropdown-item ${selectedProject?.id === p.id ? "selected" : ""}`} onClick={() => { setSelectedProject(p); setShowProjectDropdown(false); }}>
                        <FolderSvg /> {p.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Document Type <span className="required">*</span></label>
              <div className="dropdown-container">
                <button className="dropdown-trigger" onClick={() => { setShowDocDropdown(!showDocDropdown); setShowProjectDropdown(false); }}>
                  {selectedDocType ? (<span>{selectedDocType.name}</span>) : (<span style={{ color: "var(--text-muted)" }}>Select document type</span>)}
                  <ChevronDown size={16} color="var(--text-muted)" />
                </button>
                {showDocDropdown && (
                  <div className="dropdown-menu">
                    {docTypes.map(cat => (
                      <div key={cat.category}>
                        <div className="dropdown-category">{cat.icon} {cat.category}</div>
                        {cat.types.map(t => (
                          <div key={t.id} className={`dropdown-item ${selectedDocType?.id === t.id ? "selected" : ""}`} onClick={() => { setSelectedDocType(t); setShowDocDropdown(false); }}>
                            <FileSvg /> {t.name}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="info-box">
              <Info size={18} className="info-box-icon" />
              <div className="info-box-text">
                <strong>Context for audit-proof document</strong>
                The more information you provide, the better we can draft your document.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location / Workplace <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. Construction site Antwerp, Hall B" value={context.location} onChange={(e) => setContext({ ...context, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tasks / Activities <span className="required">*</span></label>
              <textarea className="form-textarea" placeholder="Describe the tasks this document is needed for..." value={context.tasks} onChange={(e) => setContext({ ...context, tasks: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Involved Parties / Workers <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. Team A, Subcontractor X" value={context.parties} onChange={(e) => setContext({ ...context, parties: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Additional Context (optional)</label>
              <textarea className="form-textarea" placeholder="Special risks, deadlines, specific conditions..." value={context.additionalContext} onChange={(e) => setContext({ ...context, additionalContext: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Add Photos (optional) <span style={{ float: "right", color: "var(--text-muted)", fontWeight: 400 }}>0/5</span></label>
              <div className="upload-area">
                <Camera size={28} color="var(--text-muted)" />
                <div style={{ fontWeight: 600, marginTop: 8, fontSize: 14 }}>Upload Photos</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>JPG, PNG or WebP (max 10MB)</div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
              <Check size={18} /> Included in your plan
            </div>
            <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, background: "var(--primary-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileSvg />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedDocType?.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selectedProject?.name}</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Context Information</div>
            <div style={{ background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", padding: 18, border: "1px solid var(--border-light)" }}>
              <div style={{ marginBottom: 8, fontSize: 14 }}><strong>Location:</strong> {context.location}</div>
              <div style={{ marginBottom: 8, fontSize: 14 }}><strong>Tasks:</strong> {context.tasks}</div>
              <div style={{ fontSize: 14 }}><strong>Involved Parties:</strong> {context.parties}</div>
              {context.additionalContext && <div style={{ marginTop: 8, fontSize: 14 }}><strong>Additional:</strong> {context.additionalContext}</div>}
            </div>
          </div>
        )}

        <div className="modal-footer">
          <div>{step > 1 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}</div>
          <div className="modal-footer-right">
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            {step < 3 ? (
              <button className="btn btn-primary" disabled={step === 1 ? !canProceedStep1 : !canProceedStep2} onClick={() => setStep(step + 1)} style={{ opacity: (step === 1 ? !canProceedStep1 : !canProceedStep2) ? 0.5 : 1 }}>Next</button>
            ) : (
              <button className="btn btn-accent" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Check size={16} />}
                Confirm & Generate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>;
}

function FileSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
