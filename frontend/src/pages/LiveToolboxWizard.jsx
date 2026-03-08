import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, ChevronRight, Sparkles, Edit } from "lucide-react";
import * as api from "../services/api";

export default function LiveToolboxWizard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [currentStep, setCurrentStep] = useState("topic");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [language, setLanguage] = useState("nl");
  const [customText, setCustomText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  useEffect(() => {
    api.getProject(projectId).then(setProject).catch(console.error);
  }, [projectId]);

  const toolboxTopics = [
    "Working at Heights",
    "Electrical Safety",
    "Chemical Handling",
    "Confined Spaces",
    "Excavation",
    "Scaffolding",
    "Fall Protection",
    "PPE Requirements",
    "Emergency Procedures",
    "Hazard Communication"
  ];

  const handleGenerateContent = async () => {
    if (!selectedTopic && !customText) {
      alert("Please select a topic or enter custom text");
      return;
    }

    setIsGenerating(true);
    try {
      // Call the backend API to generate document with LLM
      const response = await api.generateDocument({
        documentType: 'toolbox',
        topic: selectedTopic || customText,
        typeOfWork: 'Toolbox Talk',
        location: project?.location || '',
        language: language,
        projectId: projectId,
        createdBy: 'System',
        tags: ['toolbox', language]
      });

      if (response && response.success && response.document) {
        // Store generated content and show preview
        setGeneratedContent(response.document);
        setCurrentStep("preview");
      } else {
        throw new Error("No document returned from API");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      alert(`Failed to generate content: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditTopic = () => {
    setCurrentStep("topic");
    setGeneratedContent(null);
  };

  const handleAcceptContent = () => {
    setCurrentStep("attendees");
  };

  const handleClose = () => {
    navigate("/toolbox");
  };

  const handleNext = () => {
    if (currentStep === "attendees") {
      setCurrentStep("session");
    } else if (currentStep === "session") {
      // Complete and navigate
      navigate(`/toolbox/${projectId}`);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000
    }}>
      <div style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        width: "90%",
        maxWidth: 900,
        maxHeight: "90vh",
        overflow: "auto",
        position: "relative"
      }}>
        {/* Header */}
        <div style={{
          padding: "32px",
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Live Toolbox Wizard</h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Project: {project?.name}</p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Steps */}
        <div style={{
          display: "flex",
          padding: "20px 32px",
          gap: 16,
          borderBottom: "1px solid var(--border-light)"
        }}>
          {["Contents", "Attendees", "Session", "Complete"].map((step, idx) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: 
                  step === "Contents" && currentStep === "topic" ? "var(--primary)" :
                  ["topic", "attendees", "session"].indexOf(currentStep) >= idx ? "var(--primary)" : "var(--bg-subtle)",
                color: 
                  step === "Contents" && currentStep === "topic" ? "white" :
                  ["topic", "attendees", "session"].indexOf(currentStep) >= idx ? "white" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14
              }}>
                {idx + 1}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{step}</div>
              {idx < 3 && <ChevronRight size={16} color="var(--border-light)" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          {currentStep === "topic" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={20} color="var(--primary)" />
                  Choose a topic
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Select a predefined topic or enter your own</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>Toolbox topic</label>
                <div style={{
                  position: "relative"
                }}>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "white",
                      border: "1px solid var(--border-light)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 14,
                      cursor: "pointer"
                    }}
                  >
                    <option value="">Select a topic...</option>
                    {toolboxTopics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>Language</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { code: "nl", name: "Dutch", flag: "🇳🇱" },
                    { code: "en", name: "English", flag: "🇬🇧" }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        background: language === lang.code ? "var(--primary)" : "var(--bg-subtle)",
                        color: language === lang.code ? "white" : "var(--text-dark)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all 0.2s"
                      }}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                  The toolbox talk will be generated entirely in {language === "nl" ? "Dutch" : "English"}.
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>Or type your own toolbox text</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your custom toolbox talk topic or description..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "white",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    minHeight: 100,
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>
            </div>
          )}

          {currentStep === "attendees" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Who is attending?</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Add participants to the toolbox talk</p>
              </div>
              <div style={{
                padding: 24,
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                fontWeight: 600,
                color: "var(--text-muted)"
              }}>
                Coming soon - Add attendees in the next update
              </div>
            </div>
          )}

          {currentStep === "session" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Live & Signatures</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Configure session settings and signature collection</p>
              </div>
              <div style={{
                padding: 24,
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                fontWeight: 600,
                color: "var(--text-muted)"
              }}>
                Coming soon - Configure signatures in the next update
              </div>
            </div>
          )}

          {currentStep === "preview" && generatedContent && (
            <div>
              <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Toolbox Contents</span>
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Preview the generated content</p>
                </div>
                <button
                  onClick={handleEditTopic}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                    color: "var(--text-secondary)"
                  }}
                >
                  <Edit size={14} />
                  Edit
                </button>
              </div>
              <div style={{
                background: "white",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)",
                padding: 24,
                maxHeight: 400,
                overflowY: "auto"
              }}>
                {generatedContent.rawMarkdown ? (
                  <div style={{ lineHeight: 1.6, fontSize: 14, color: "var(--text-dark)" }}>
                    {generatedContent.rawMarkdown.split('\n').map((line, idx) => {
                      if (line.match(/^#+\s/)) {
                        const level = line.match(/^#+/)[0].length;
                        return (
                          <div
                            key={idx}
                            style={{
                              fontSize: 18 - (level - 1) * 2,
                              fontWeight: 700,
                              marginTop: idx > 0 ? 16 : 0,
                              marginBottom: 8
                            }}
                          >
                            {line.replace(/^#+\s/, '')}
                          </div>
                        );
                      }
                      if (line.trim() === '') {
                        return <div key={idx} style={{ height: 8 }} />;
                      }
                      return (
                        <div key={idx} style={{ marginBottom: 8 }}>
                          {line}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>No content to display</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 32px",
          borderTop: "1px solid var(--border-light)",
          display: "flex",
          gap: 12,
          justifyContent: "flex-end"
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: "10px 20px",
              background: "white",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={isGenerating || (currentStep === "topic" && !selectedTopic && !customText)}
            style={{
              padding: "10px 20px",
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: isGenerating || (currentStep === "topic" && !selectedTopic && !customText) ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 14,
              opacity: isGenerating || (currentStep === "topic" && !selectedTopic && !customText) ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            {isGenerating ? "Generating..." : currentStep === "topic" ? "Generate Toolbox Content" : "Next"}
            {!isGenerating && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
