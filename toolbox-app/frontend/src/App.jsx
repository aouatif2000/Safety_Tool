import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import NewRequestModal from "./components/NewRequestModal";
import Dashboard from "./pages/Dashboard";
import ToolboxProjects from "./pages/ToolboxProjects";
import ToolboxSessions from "./pages/ToolboxSessions";
import SessionDetail from "./pages/SessionDetail";
import Inspection from "./pages/Inspection";
import PlaceholderPage from "./pages/PlaceholderPage";
import "./styles/globals.css";

function AppShell() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const navigate = useNavigate();

  const handleCreated = (session) => {
    navigate(`/toolbox/${session.projectId}/session/${session.id}`);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header onNewRequest={() => setShowNewRequest(true)} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/toolbox" element={<ToolboxProjects />} />
          <Route path="/toolbox/:projectId" element={<ToolboxSessions />} />
          <Route path="/toolbox/:projectId/session/:sessionId" element={<SessionDetail />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/projects" element={<PlaceholderPage />} />
          <Route path="/tasks" element={<PlaceholderPage />} />
          <Route path="/requests" element={<PlaceholderPage />} />
          <Route path="/planning" element={<PlaceholderPage />} />
          <Route path="/traffic" element={<PlaceholderPage />} />
          <Route path="/site-operations" element={<PlaceholderPage />} />
          <Route path="/subcontractors" element={<PlaceholderPage />} />
          <Route path="/quality" element={<PlaceholderPage />} />
          <Route path="/certificates" element={<PlaceholderPage />} />
          <Route path="/library" element={<PlaceholderPage />} />
        </Routes>
      </div>
      <NewRequestModal
        isOpen={showNewRequest}
        onClose={() => setShowNewRequest(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
