#!/bin/bash

# This script creates all remaining backend route files

# Create incidents routes
cat > backend/routes/incidents.js << 'EOF'
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
EOF

# Create risk assessments routes
cat > backend/routes/riskAssessments.js << 'EOF'
const express = require('express');
const router = express.Router();
const riskAssessmentService = require('../services/riskAssessmentService');

router.post('/', async (req, res) => {
  try {
    const assessment = riskAssessmentService.createRiskAssessment(req.body);
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const assessments = riskAssessmentService.getAllRiskAssessments(req.query);
    res.json({ success: true, assessments, count: assessments.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/matrix', async (req, res) => {
  try {
    const matrix = riskAssessmentService.getRiskMatrix();
    res.json({ success: true, matrix });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = riskAssessmentService.getRiskStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assessment = riskAssessmentService.getRiskAssessmentById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, error: 'Risk assessment not found' });
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const assessment = riskAssessmentService.updateRiskAssessment(req.params.id, req.body);
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/mitigation-actions', async (req, res) => {
  try {
    const assessment = riskAssessmentService.addMitigationAction(req.params.id, req.body);
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:assessmentId/mitigation-actions/:actionId/complete', async (req, res) => {
  try {
    const assessment = riskAssessmentService.completeMitigationAction(req.params.assessmentId, req.params.actionId);
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/residual-risk', async (req, res) => {
  try {
    const assessment = riskAssessmentService.setResidualRisk(req.params.id, req.body);
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
EOF

# Create permits routes
cat > backend/routes/permits.js << 'EOF'
const express = require('express');
const router = express.Router();
const permitService = require('../services/permitService');

router.post('/', async (req, res) => {
  try {
    const permit = permitService.createPermit(req.body);
    res.json({ success: true, permit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const permits = permitService.getAllPermits(req.query);
    res.json({ success: true, permits, count: permits.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/types', async (req, res) => {
  try {
    const types = permitService.getPermitTypes();
    res.json({ success: true, types });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = permitService.getPermitStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const permit = permitService.getPermitById(req.params.id);
    if (!permit) return res.status(404).json({ success: false, error: 'Permit not found' });
    res.json({ success: true, permit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/approvals', async (req, res) => {
  try {
    const permit = permitService.addApproval(req.params.id, req.body);
    res.json({ success: true, permit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/signatures', async (req, res) => {
  try {
    const permit = permitService.addSignature(req.params.id, req.body);
    res.json({ success: true, permit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/activate', async (req, res) => {
  try {
    const permit = permitService.activatePermit(req.params.id, req.body.activatedBy);
    res.json({ success: true, permit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/complete', async (req, res) => {
  try {
    const permit = permitService.completePermit(req.params.id, req.body.completedBy);
    res.json({ success: true, permit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const permit = permitService.cancelPermit(req.params.id, req.body.reason, req.body.cancelledBy);
    res.json({ success: true, permit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
EOF

# Create access control routes
cat > backend/routes/accessControl.js << 'EOF'
const express = require('express');
const router = express.Router();
const accessControlService = require('../services/accessControlService');

// Zones
router.post('/zones', async (req, res) => {
  try {
    const zone = accessControlService.createZone(req.body);
    res.json({ success: true, zone });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/zones', async (req, res) => {
  try {
    const zones = accessControlService.getAllZones(req.query);
    res.json({ success: true, zones, count: zones.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/zones/:id', async (req, res) => {
  try {
    const zone = accessControlService.getZoneById(req.params.id);
    if (!zone) return res.status(404).json({ success: false, error: 'Zone not found' });
    res.json({ success: true, zone });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/zones/:id', async (req, res) => {
  try {
    const zone = accessControlService.updateZone(req.params.id, req.body);
    res.json({ success: true, zone });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Access Rights
router.post('/access-rights', async (req, res) => {
  try {
    const accessRight = accessControlService.grantAccessRight(req.body);
    res.json({ success: true, accessRight });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/access-rights/:id', async (req, res) => {
  try {
    const accessRight = accessControlService.revokeAccessRight(req.params.id, req.body.revokedBy, req.body.reason);
    res.json({ success: true, accessRight });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Access Logs
router.post('/logs/entry', async (req, res) => {
  try {
    const log = accessControlService.logEntry(req.body);
    res.json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/logs/exit', async (req, res) => {
  try {
    const log = accessControlService.logExit(req.body);
    res.json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const logs = accessControlService.getAccessLogs(req.query);
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Presence
router.get('/presence', async (req, res) => {
  try {
    const presence = accessControlService.getAllPresence();
    res.json({ success: true, presence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/presence/:zoneId', async (req, res) => {
  try {
    const presence = accessControlService.getZonePresence(req.params.zoneId);
    res.json({ success: true, presence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stats
router.get('/stats', async (req, res) => {
  try {
    const stats = accessControlService.getAccessStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
EOF

echo "All route files created successfully!"
