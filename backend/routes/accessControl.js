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
