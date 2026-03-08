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
export const getDashboard = async () => {
  const response = await fetchJson("/dashboard/stats");
  return response.stats || response;
};

// Projects - Mock data + localStorage
export const getProjects = async () => {
  const defaultProjects = [
    { id: "proj-1", name: "Main Construction Site" },
    { id: "proj-2", name: "Safety Training Program" },
    { id: "proj-3", name: "Equipment Maintenance" },
  ];
  
  // Get user-created projects from localStorage
  const userProjects = JSON.parse(localStorage.getItem("projects") || "[]");
  
  // Combine and remove duplicates
  const allProjects = [...defaultProjects, ...userProjects];
  const uniqueProjects = allProjects.filter((proj, index, self) =>
    index === self.findIndex((p) => p.id === proj.id)
  );
  
  return uniqueProjects;
};

export const getProject = (id) => {
  const projects = getProjects();
  return projects.then(p => p.find(proj => proj.id === id));
};

export const createProject = async (data) => {
  // Mock implementation - store in localStorage
  const projects = JSON.parse(localStorage.getItem("projects") || "[]");
  const newProject = {
    id: `proj-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString()
  };
  projects.push(newProject);
  localStorage.setItem("projects", JSON.stringify(projects));
  return { success: true, project: newProject };
};

// Document Types
export const getDocumentTypes = () => fetchJson("/toolbox/document-types");

// Toolbox Documents
export const getToolboxDocuments = async () => {
  const data = await fetchJson("/toolbox/documents");
  return (data.documents || []).map(doc => ({
    id: doc.id,
    title: doc.title,
    status: doc.metadata?.status || "draft",
    category: doc.type,
    date: doc.metadata?.createdAt || new Date().toISOString(),
    location: doc.context?.location || "Unknown",
    projectId: "proj-1",
    ...doc
  }));
};

export const generateDocument = (data) =>
  fetchJson("/toolbox/generate-document", { method: "POST", body: JSON.stringify(data) });

// Sessions (legacy - using toolbox documents instead)
export const getSessions = async (projectId) => {
  const documents = await getToolboxDocuments();
  return documents.filter(d => !projectId || d.projectId === projectId);
};

export const getSession = async (sessionId) => {
  const response = await fetchJson(`/toolbox/documents/${sessionId}`);
  const doc = response.document || response;
  return {
    id: doc.id,
    title: doc.title,
    status: doc.metadata?.status || "draft",
    category: doc.type,
    date: doc.metadata?.createdAt || new Date().toISOString(),
    location: doc.context?.location || "Unknown",
    projectId: "proj-1",
    ...doc
  };
};

export const updateSessionStatus = (id, status) => {
  // No backend endpoint for this yet - mock implementation
  return Promise.resolve({ id, status });
};

export const deleteSession = (id) => {
  // No backend endpoint for this yet - mock implementation
  return Promise.resolve({ success: true });
};

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

export const getInspections = () => fetchJson("/incidents");
