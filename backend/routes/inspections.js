const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const store = require("../models/store");
const { generateInspectionReport } = require("../services/aiService");

const upload = multer({ dest: "uploads/" });

// POST upload photo for AI inspection
router.post("/analyze", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "A photo is required" });
  }

  // Simulated AI analysis - in production, send to vision AI model
  const simulatedFindings = [
    {
      id: uuidv4(),
      severity: "High",
      category: "Fall Protection",
      description: "Worker observed near unprotected edge without fall arrest system. Guardrails appear to be missing on the east side of the platform.",
      recommendation: "Install temporary guardrails immediately. Ensure all workers wear full-body harness with shock-absorbing lanyard when within 2m of an unprotected edge."
    },
    {
      id: uuidv4(),
      severity: "Medium",
      category: "Housekeeping",
      description: "Debris and loose materials scattered across walkway area, creating trip hazards.",
      recommendation: "Clear walkway of all debris. Establish a regular housekeeping schedule. Provide designated waste collection points."
    },
    {
      id: uuidv4(),
      severity: "Low",
      category: "PPE Compliance",
      description: "High-visibility vest not worn by one individual in the background of the image.",
      recommendation: "Remind all personnel that high-vis vests are mandatory in active work zones. Conduct a brief PPE check at the start of each shift."
    }
  ];

  const report = generateInspectionReport(simulatedFindings);
  report.id = uuidv4();
  report.photoFile = req.file.filename;

  store.inspections.push(report);
  res.status(201).json(report);
});

// GET all inspections
router.get("/", (req, res) => {
  res.json(store.inspections);
});

module.exports = router;
