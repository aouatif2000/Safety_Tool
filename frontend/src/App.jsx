import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import NewRequestModal from "./components/NewRequestModal";
import Dashboard from "./pages/Dashboard";
import ToolboxProjects from "./pages/ToolboxProjects";
import CreateProject from "./pages/CreateProject";
import ToolboxSessions from "./pages/ToolboxSessions";
import LiveToolboxWizard from "./pages/LiveToolboxWizard";
import SessionDetail from "./pages/SessionDetail";
import DocumentReview from "./pages/DocumentReview";
import MobileSignOff from "./pages/MobileSignOff";
import Inspection from "./pages/Inspection";
import RiskAssessment from "./pages/RiskAssessment";
import Permits from "./pages/Permits";
import AccessControl from "./pages/AccessControl";
import KnowledgeBase from "./pages/KnowledgeBase";
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
          <Route path="/toolbox/review/:documentId" element={<DocumentReview />} />
          <Route path="/toolbox/:projectId/wizard" element={<LiveToolboxWizard />} />
          <Route path="/toolbox/:projectId" element={<ToolboxSessions />} />
          <Route path="/toolbox/:projectId/session/:sessionId" element={<SessionDetail />} />
          <Route path="/incidents" element={<Inspection />} />
          <Route path="/risk-assessment" element={<RiskAssessment />} />
          <Route path="/permits" element={<Permits />} />
          <Route path="/access-control" element={<AccessControl />} />
          <Route path="/settings" element={<PlaceholderPage />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
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
      <Routes>
        {/* ── Public standalone route — no sidebar/header ── */}
        <Route path="/sign/:token" element={<MobileSignOff />} />

        {/* ── Main app shell ── */}
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}
