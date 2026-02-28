const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function fetchJson(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// Dashboard
export const getDashboard = () => fetchJson("/dashboard");

// Projects
export const getProjects = () => fetchJson("/projects");
export const getProject = (id) => fetchJson(`/projects/${id}`);
export const createProject = (data) =>
  fetchJson("/projects", { method: "POST", body: JSON.stringify(data) });

// Document Types
export const getDocumentTypes = () => fetchJson("/document-types");

// Sessions
export const getSessions = (projectId) =>
  fetchJson(`/sessions${projectId ? `?projectId=${projectId}` : ""}`);
export const getSession = (id) => fetchJson(`/sessions/${id}`);
export const createSession = (data) =>
  fetchJson("/sessions", { method: "POST", body: JSON.stringify(data) });
export const updateSessionStatus = (id, status) =>
  fetchJson(`/sessions/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const addSignature = (id, data) =>
  fetchJson(`/sessions/${id}/signatures`, { method: "POST", body: JSON.stringify(data) });
export const deleteSession = (id) =>
  fetchJson(`/sessions/${id}`, { method: "DELETE" });

// Inspections
export const analyzePhoto = async (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  const res = await fetch(`${API_BASE}/inspections/analyze`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Inspection failed");
  return res.json();
};

export const getInspections = () => fetchJson("/inspections");
