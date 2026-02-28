const express = require("express");
const router = express.Router();
const store = require("../models/store");

// GET dashboard stats
router.get("/", (req, res) => {
  const totalProjects = store.projects.length;
  const totalSessions = store.sessions.length;
  const totalDocuments = store.sessions.length;
  const openSessions = store.sessions.filter(s => s.status === "Open").length;
  const closedSessions = store.sessions.filter(s => s.status === "Closed").length;
  const totalInspections = store.inspections.length;

  const recentActivity = store.sessions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(s => ({
      id: s.id,
      title: s.title,
      type: "session",
      date: s.createdAt,
      status: s.status
    }));

  res.json({
    stats: {
      projects: totalProjects,
      documents: totalDocuments,
      complete: closedSessions,
      inReview: 0,
      active: openSessions,
      inspections: totalInspections
    },
    recentActivity,
    complianceStatus: "Fully Compliant"
  });
});

module.exports = router;
