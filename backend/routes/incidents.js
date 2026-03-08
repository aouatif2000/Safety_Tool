const express = require('express');
const router = express.Router();
const incidentService = require('../services/incidentService');

router.post('/', async (req, res) => {
  try {
    const incident = incidentService.createIncident(req.body);
    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const incidents = incidentService.getAllIncidents(req.query);
    res.json({ success: true, incidents, count: incidents.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = incidentService.getIncidentStats(req.query);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const incident = incidentService.getIncidentById(req.params.id);
    if (!incident) return res.status(404).json({ success: false, error: 'Incident not found' });
    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const incident = incidentService.updateIncident(req.params.id, req.body);
    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/follow-ups', async (req, res) => {
  try {
    const incident = incidentService.addFollowUp(req.params.id, req.body);
    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:incidentId/follow-ups/:followUpId/complete', async (req, res) => {
  try {
    const incident = incidentService.completeFollowUp(req.params.incidentId, req.params.followUpId, req.body.completedBy);
    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
