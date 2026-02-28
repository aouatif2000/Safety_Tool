const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const store = require("../models/store");

// GET all projects
router.get("/", (req, res) => {
  res.json(store.projects);
});

// GET single project
router.get("/:id", (req, res) => {
  const project = store.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

// POST create project
router.post("/", (req, res) => {
  const { name, location, company, subcontractors } = req.body;
  if (!name) return res.status(400).json({ error: "Project name is required" });

  const project = {
    id: uuidv4(),
    name,
    location: location || "",
    company: company || "",
    subcontractors: subcontractors || [],
    createdAt: new Date().toISOString()
  };

  store.projects.push(project);
  res.status(201).json(project);
});

// DELETE project
router.delete("/:id", (req, res) => {
  const idx = store.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Project not found" });
  store.projects.splice(idx, 1);
  res.json({ message: "Project deleted" });
});

module.exports = router;
