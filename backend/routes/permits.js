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
