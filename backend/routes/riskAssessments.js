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
