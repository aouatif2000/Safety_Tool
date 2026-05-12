import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Edit, Trash2, Zap, AlertCircle, FileText, Clock, MessageSquare, Upload, FolderOpen, Sparkles, Megaphone, ChevronDown, X, ArrowRight, Shield, FileStack, Users, HardHat } from "lucide-react";
import * as api from "../services/api";

export default function ToolboxSessions() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [project, setProject] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [selectedDocType, setSelectedDocType] = useState(null);
  const uploadRef = useRef(null);

  useEffect(() => {
    api.getSessions(projectId).then(setDocuments).catch(console.error);
    api.getProject(projectId).then(setProject).catch(console.error);
  }, [projectId]);

  const docTypes = [
    { id: "tra", name: "TRA", description: "Task Risk Analysis", icon: Shield },
    { id: "method-statement", name: "Method Statement", description: "Method Statement", icon: FileStack },
    { id: "rie", name: "RI&E", description: "Risk Inventory", icon: FileStack },
    { id: "toolbox", name: "Toolbox", description: "Toolbox Talk", icon: HardHat },
    { id: "ppe", name: "PPE", description: "PPE Assessment", icon: Shield }
  ];

  const handleGenerateClick = () => {
    setShowAddMenu(false);
    navigate(`/toolbox/${projectId}/wizard`);
  };

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    alert(`"${file.name}" selected. Upload functionality coming soon.`);
    setShowAddMenu(false);
    e.target.value = "";
  };

  const handleSelectDocType = (docType) => {
    setSelectedDocType(docType);
  };

  const handleBack = () => {
    setSelectedDocType(null);
  };

  const handleClosePanel = () => {
    setShowGeneratePanel(false);
    setSelectedDocType(null);
  };

  const handleGenerateDocument = async () => {
    // Generate document based on selectedDocType
    console.log("Generate document:", selectedDocType, formData);
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => navigate("/toolbox")}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FolderOpen size={24} color="var(--primary)" />
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{project?.name}</h1>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Active • {documents.length} documents</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" title="Project settings" onClick={() => { setEditName(project?.name || ""); setEditLocation(project?.location || ""); setShowEditProject(true); }}><Settings size={18} /></button>
          <button className="btn btn-ghost btn-sm" title="Edit project" onClick={() => { setEditName(project?.name || ""); setEditLocation(project?.location || ""); setShowEditProject(true); }}><Edit size={18} /></button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent)" }} onClick={() => { if (window.confirm("Delete this project?")) navigate("/toolbox"); }}><Trash2 size={18} /></button>
        </div>
      </div>

      {/* Info Bar */}
      <div style={{ display: "flex", gap: 24, padding: "16px 20px", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>Location</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{project?.location || "Not specified"}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Active</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>Compliance</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>0%</div>
        </div>
      </div>

      {/* Required Actions */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <AlertCircle size={16} color="var(--text-muted)" />
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>Your Required Actions</h3>
        </div>
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <AlertCircle size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No required actions</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>All tasks are up to date</div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div style={{ marginBottom: 28 }}>
        <div className="card" style={{ padding: 20, background: "var(--primary-light)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <Zap size={18} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: "var(--text-dark)" }}>AI Best-Practice Suggestions</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Optional recommendations based on your project type — not legal requirements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resources & Tools */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <FileText size={16} color="var(--text-muted)" />
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>Resources & Tools</h3>
        </div>
        
        <div style={{ position: "relative" }}>
          <button 
            className="btn btn-primary" 
            style={{ width: "100%", justifyContent: "center", gap: 8, display: "flex", alignItems: "center" }}
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <span style={{ fontSize: 18 }}>+</span>
            Add Document
            <ChevronDown size={16} style={{ marginLeft: "auto" }} />
          </button>

          {showAddMenu && (
            <div 
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)",
                marginTop: 8,
                zIndex: 10,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
              }}
            >
              {/* Generate with AI */}
              <button
                onClick={handleGenerateClick}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border-light)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-subtle)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Sparkles size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    Generate with AI 
                    <span style={{ background: "var(--primary)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>NEW</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>TRA, Toolbox, RI&E and more in seconds</div>
                </div>
              </button>

              {/* Hold Toolbox */}
              <button
                onClick={() => { setShowAddMenu(false); navigate(`/toolbox/${projectId}/wizard`); }}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border-light)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-subtle)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Megaphone size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Hold Toolbox</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Start a live meeting with signatures</div>
                </div>
              </button>

              {/* Upload own file */}
              <button
                onClick={() => { setShowAddMenu(false); uploadRef.current?.click(); }}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-subtle)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Upload size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Upload own file</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Upload an existing document</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Clock size={16} color="var(--text-muted)" />
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>Guardian Timeline</h3>
          </div>
          <div className="card" style={{ padding: 24, textAlign: "center", minHeight: 180 }}>
            <Clock size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No recent activity</div>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <MessageSquare size={16} color="var(--text-muted)" />
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>Recent Activity</h3>
          </div>
          <div className="card" style={{ padding: 24, textAlign: "center", minHeight: 180 }}>
            <MessageSquare size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No recent activity</div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <FolderOpen size={16} color="var(--text-muted)" />
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>Documents</h3>
        </div>
        
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FolderOpen size={18} color="var(--text-muted)" />
              <span style={{ fontWeight: 600 }}>Documents</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => uploadRef.current?.click()}><Upload size={16} /></button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/toolbox/${projectId}/wizard`)}>New Builder</button>
            </div>
          </div>

          <div style={{ padding: 28, textAlign: "center" }}>
            <FolderOpen size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>This folder is empty</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Create subfolders or upload documents to get started.</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button className="btn btn-outline btn-sm" onClick={() => uploadRef.current?.click()}><Upload size={16} /> Upload Files</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/toolbox/${projectId}/wizard`)}>New Builder</button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for uploads */}
      <input ref={uploadRef} type="file" style={{ display: "none" }} onChange={handleUploadFile} />

      {/* Edit Project Modal */}
      {showEditProject && (
        <div className="modal-overlay" onClick={() => setShowEditProject(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit Project</div>
              <button className="modal-close" onClick={() => setShowEditProject(false)}><X size={18} /></button>
            </div>
            <div style={{ padding: "0 24px 24px" }}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Project Name</label>
                <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Location</label>
                <input className="form-input" value={editLocation} onChange={e => setEditLocation(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEditProject(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                  setProject(p => ({ ...p, name: editName, location: editLocation }));
                  setShowEditProject(false);
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Document Sidebar */}
      {showGeneratePanel && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          background: "white",
          boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
            {selectedDocType && (
              <button className="btn btn-ghost" style={{ padding: 8 }} onClick={handleBack}>
                <ArrowLeft size={20} />
              </button>
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                {selectedDocType ? selectedDocType.name : "Generate Document"}
              </h2>
              {!selectedDocType && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Project: {project?.name}</p>
              )}
              {selectedDocType && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Project: {project?.name}</p>
              )}
            </div>
            <button className="btn btn-ghost" style={{ padding: 8 }} onClick={handleClosePanel}>
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {!selectedDocType ? (
              // Document Type Selection
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Which type of document do you want to generate?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {docTypes.map(doc => {
                    const IconComponent = doc.icon;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => handleSelectDocType(doc)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          background: "var(--bg-subtle)",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--primary-light)";
                          e.currentTarget.style.borderColor = "var(--primary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--bg-subtle)";
                          e.currentTarget.style.borderColor = "var(--border-light)";
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <IconComponent size={18} color="var(--primary)" />
                        </div>
                        <div style={{ textAlign: "left", flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{doc.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{doc.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Document Form
              <div>
                {selectedDocType.id === "toolbox" && (
                  <div>
                    {/* Company Logo */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Company logo (optional)</label>
                      <button style={{ width: "100%", padding: "12px 16px", background: "var(--bg-subtle)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", marginTop: 8, cursor: "pointer", fontWeight: 600 }}>Select</button>
                    </div>

                    {/* Type of Work */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>Type of work <span style={{ color: "var(--accent)" }}>*</span></label>
                      <input
                        type="text"
                        placeholder="E.g., Roofing, Scaffolding"
                        value={formData.typeOfWork}
                        onChange={(e) => setFormData({ ...formData, typeOfWork: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "white",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-sm)",
                          marginTop: 8,
                          fontSize: 14
                        }}
                      />
                    </div>

                    {/* Location / Environment */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Location / Environment</label>
                      <input
                        type="text"
                        placeholder={project?.location || ""}
                        defaultValue={project?.location || ""}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "white",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-sm)",
                          marginTop: 8,
                          fontSize: 14
                        }}
                      />
                    </div>

                    {/* Main Hazards */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Main hazards</label>
                      <textarea
                        placeholder="E.g., Working at height, Electrical hazard"
                        value={formData.mainHazards}
                        onChange={(e) => setFormData({ ...formData, mainHazards: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "white",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-sm)",
                          marginTop: 8,
                          fontSize: 14,
                          minHeight: 80,
                          fontFamily: "inherit"
                        }}
                      />
                    </div>

                    {/* Additional Notes */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Additional notes</label>
                      <textarea
                        placeholder="Specific requirements or considerations..."
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "white",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-sm)",
                          marginTop: 8,
                          fontSize: 14,
                          minHeight: 80,
                          fontFamily: "inherit"
                        }}
                      />
                    </div>

                    {/* Date, Revision, Version */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Date</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            background: "white",
                            border: "1px solid var(--border-light)",
                            borderRadius: "var(--radius-sm)",
                            marginTop: 6,
                            fontSize: 12
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Revision</label>
                        <input
                          type="text"
                          placeholder="jj/mm/aaaa"
                          value={formData.revision}
                          onChange={(e) => setFormData({ ...formData, revision: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            background: "white",
                            border: "1px solid var(--border-light)",
                            borderRadius: "var(--radius-sm)",
                            marginTop: 6,
                            fontSize: 12
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Version</label>
                        <input
                          type="text"
                          value={formData.version}
                          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            background: "white",
                            border: "1px solid var(--border-light)",
                            borderRadius: "var(--radius-sm)",
                            marginTop: 6,
                            fontSize: 12
                          }}
                        />
                      </div>
                    </div>

                    {/* Add Photos */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Add photos (optional)</label>
                      <button style={{ width: "100%", padding: "12px 16px", background: "var(--bg-subtle)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", marginTop: 8, cursor: "pointer", fontWeight: 600 }}>Select photos</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedDocType && (
            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-light)", display: "flex", gap: 12 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleBack}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGenerateDocument}>
                <Sparkles size={16} />
                Generate Document
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
