const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const store = require("../models/store");
const { generateToolboxTalk } = require("../services/aiService");

// GET all sessions (optionally filtered by projectId)
router.get("/", (req, res) => {
  let sessions = store.sessions;
  if (req.query.projectId) {
    sessions = sessions.filter(s => s.projectId === req.query.projectId);
  }
  res.json(sessions);
});

// GET single session
router.get("/:id", (req, res) => {
  const session = store.sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
});

// POST create session with AI document generation
router.post("/", (req, res) => {
  const { projectId, documentType, context } = req.body;

  if (!projectId || !documentType || !context) {
    return res.status(400).json({ error: "projectId, documentType, and context are required" });
  }

  const project = store.projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  // Generate document using AI service
  const document = generateToolboxTalk(documentType, project.name, context);

  const session = {
    id: uuidv4(),
    projectId,
    title: context.tasks ? context.tasks.substring(0, 50) : documentType,
    status: "Open",
    category: "safety",
    documentType,
    date: new Date().toISOString(),
    location: context.location || project.location,
    attendees: 0,
    signatures: 0,
    version: 1,
    context,
    document,
    qrCode: uuidv4(), // QR code identifier
    signatureList: [],
    createdAt: new Date().toISOString()
  };

  store.sessions.push(session);
  res.status(201).json(session);
});

// PATCH update session status
router.patch("/:id/status", (req, res) => {
  const session = store.sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  const { status } = req.body;
  if (!["Open", "Closed", "Cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  session.status = status;
  res.json(session);
});

// POST add signature
router.post("/:id/signatures", (req, res) => {
  const session = store.sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  const { name, signatureData } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const signature = {
    id: uuidv4(),
    name,
    signatureData: signatureData || null,
    signedAt: new Date().toISOString()
  };

  session.signatureList.push(signature);
  session.signatures = session.signatureList.length;
  res.status(201).json(signature);
});

// POST regenerate QR code
router.post("/:id/qr-regenerate", (req, res) => {
  const session = store.sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  session.qrCode = uuidv4();
  res.json({ qrCode: session.qrCode });
});

// DELETE session
router.delete("/:id", (req, res) => {
  const idx = store.sessions.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Session not found" });
  store.sessions.splice(idx, 1);
  res.json({ message: "Session deleted" });
});

module.exports = router;
