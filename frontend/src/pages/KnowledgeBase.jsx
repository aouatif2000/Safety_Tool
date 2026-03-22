import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, BookOpen, FileText, File, AlertCircle, CheckCircle, Loader } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name) {
  if (name.endsWith(".pdf")) return "📄";
  if (name.endsWith(".docx") || name.endsWith(".doc")) return "📝";
  return "📃";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ documentCount: 0, chunkCount: 0 });
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Load indexed documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoadingDocs(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-base/documents`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
        setStats(data.stats || { documentCount: 0, chunkCount: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch KB documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...files.filter(f => !names.has(f.name))];
    });
    setUploadResults([]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...files.filter(f => !names.has(f.name))];
    });
    setUploadResults([]);
  }

  function removeFromQueue(index) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setUploadResults([]);

    try {
      const formData = new FormData();
      selectedFiles.forEach(f => formData.append("files", f));

      const res = await fetch(`${API_BASE}/knowledge-base/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setUploadResults(data.results || []);
        setSelectedFiles([]);
        fetchDocuments();
      } else {
        setUploadResults([{ filename: "Upload", success: false, error: data.error }]);
      }
    } catch (err) {
      setUploadResults([{ filename: "Upload", success: false, error: err.message }]);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId, filename) {
    if (!window.confirm(`Remove "${filename}" from the Knowledge Base? This cannot be undone.`)) return;

    try {
      const res = await fetch(`${API_BASE}/knowledge-base/documents/${docId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchDocuments();
      } else {
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="page">

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "linear-gradient(135deg, #6d28d9, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <BookOpen size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Knowledge Base
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 560 }}>
            Upload company documents (PDF, DOCX, TXT). Their content is automatically indexed and
            injected as context whenever any module generates AI content.
          </p>
        </div>
      </div>

      {/* ── Stats Banner ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 20px",
        background: stats.documentCount > 0 ? "#ede9fe" : "var(--bg-subtle)",
        border: `1px solid ${stats.documentCount > 0 ? "rgba(109,40,217,0.2)" : "var(--border-light)"}`,
        borderRadius: "var(--radius-md)",
        marginBottom: 28,
        fontSize: 14, fontWeight: 600,
        color: stats.documentCount > 0 ? "#5b21b6" : "var(--text-muted)"
      }}>
        <BookOpen size={16} />
        {stats.documentCount > 0
          ? `${stats.documentCount} document${stats.documentCount !== 1 ? "s" : ""} indexed — ${stats.chunkCount} chunks available for generation`
          : "No documents indexed yet. Upload your first document below."}
      </div>

      {/* ── Upload Section ── */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Upload Documents</h2>

        {/* Drag-and-drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "#6d28d9" : "var(--border-light)"}`,
            borderRadius: "var(--radius-md)",
            padding: "36px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "#f5f3ff" : "var(--bg-subtle)",
            transition: "all 0.15s",
            marginBottom: 16
          }}
        >
          <Upload size={32} color={dragOver ? "#6d28d9" : "var(--text-muted)"} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: "var(--text-dark)" }}>
            Drag & drop files here, or click to browse
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            PDF, DOCX, TXT — max 20 MB per file, up to 10 files
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            multiple
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </div>

        {/* Queued files */}
        {selectedFiles.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Ready to upload ({selectedFiles.length})
            </div>
            {selectedFiles.map((file, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px",
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-sm)",
                marginBottom: 6,
                fontSize: 13
              }}>
                <span style={{ fontSize: 16 }}>{fileIcon(file.name)}</span>
                <span style={{ flex: 1, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>{formatBytes(file.size)}</span>
                <button
                  onClick={e => { e.stopPropagation(); removeFromQueue(i); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px",
            background: selectedFiles.length === 0 || uploading ? "var(--bg-subtle)" : "#6d28d9",
            color: selectedFiles.length === 0 || uploading ? "var(--text-muted)" : "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: selectedFiles.length === 0 || uploading ? "not-allowed" : "pointer",
            fontWeight: 600, fontSize: 14,
            transition: "all 0.15s"
          }}
        >
          {uploading ? (
            <><Loader size={16} className="spin" /> Extracting text from documents...</>
          ) : (
            <><Upload size={16} /> Upload to Knowledge Base</>
          )}
        </button>

        {/* Upload results */}
        {uploadResults.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {uploadResults.map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "8px 12px",
                background: r.success ? "#d1fae5" : "#fee2e2",
                border: `1px solid ${r.success ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
                borderRadius: "var(--radius-sm)",
                marginBottom: 6,
                fontSize: 13
              }}>
                {r.success
                  ? <CheckCircle size={15} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                  : <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />}
                <div>
                  {r.success
                    ? <><strong>{r.filename}</strong> — {r.chunkCount} chunks indexed ({r.charCount?.toLocaleString()} characters)</>
                    : <><strong>{r.filename}</strong> — {r.error}</>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Indexed Documents ── */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Indexed Documents</h2>

        {loadingDocs ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", padding: "24px 0" }}>
            <Loader size={18} />
            <span>Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            <FileText size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No documents indexed yet</div>
            <div style={{ fontSize: 13 }}>Upload your first document above.</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                <th style={{ textAlign: "left", padding: "0 12px 10px 0", fontWeight: 700, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Filename</th>
                <th style={{ textAlign: "center", padding: "0 12px 10px", fontWeight: 700, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Chunks</th>
                <th style={{ textAlign: "right", padding: "0 0 10px 12px", fontWeight: 700, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.docId} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{fileIcon(doc.filename)}</span>
                      <span style={{ fontWeight: 500 }}>{doc.filename}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      background: "#ede9fe",
                      color: "#5b21b6",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {doc.chunkCount} chunks
                    </span>
                  </td>
                  <td style={{ padding: "12px 0 12px 12px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(doc.docId, doc.filename)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "6px 12px",
                        background: "none",
                        border: "1px solid var(--border-light)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: 600, fontSize: 12,
                        color: "#dc2626",
                        transition: "all 0.15s"
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "#fee2e2"}
                      onMouseOut={e => e.currentTarget.style.background = "none"}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
