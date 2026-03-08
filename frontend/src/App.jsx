import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import NewRequestModal from "./components/NewRequestModal";
import Dashboard from "./pages/Dashboard";
import ToolboxProjects from "./pages/ToolboxProjects";
import CreateProject from "./pages/CreateProject";
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
          <Route path="/toolbox/create" element={<CreateProject />} />
          <Route path="/toolbox/:projectId" element={<ToolboxSessions />} />
          <Route path="/toolbox/:projectId/session/:sessionId" element={<SessionDetail />} />
          <Route path="/incidents" element={<Inspection />} />
          <Route path="/risk-assessment" element={<PlaceholderPage />} />
          <Route path="/permits" element={<PlaceholderPage />} />
          <Route path="/access-control" element={<PlaceholderPage />} />
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
