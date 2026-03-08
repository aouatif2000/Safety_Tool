/**
 * Safety Platform Server
 * Main server file with all 5 service routes
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - THE 5 REQUIRED SERVICES
app.use('/api/toolbox', require('./routes/toolbox'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/risk-assessments', require('./routes/riskAssessments'));
app.use('/api/permits', require('./routes/permits'));
app.use('/api/access-control', require('./routes/accessControl'));

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const toolboxService = require('./services/toolboxService');
    const incidentService = require('./services/incidentService');
    const riskAssessmentService = require('./services/riskAssessmentService');
    const permitService = require('./services/permitService');
    const accessControlService = require('./services/accessControlService');
    
    const stats = {
      toolbox: toolboxService.getDocumentStats(),
      incidents: incidentService.getIncidentStats(),
      riskAssessments: riskAssessmentService.getRiskStats(),
      permits: permitService.getPermitStats(),
      accessControl: accessControlService.getAccessStats()
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('[Dashboard] Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const llmService = require('./services/llmService');
    const ollamaHealth = await llmService.checkOllamaHealth();
    
    res.json({
      success: true,
      server: 'running',
      timestamp: new Date().toISOString(),
      ollama: ollamaHealth
    });
  } catch (error) {
    res.json({
      success: true,
      server: 'running',
      timestamp: new Date().toISOString(),
      ollama: { healthy: false, error: error.message }
    });
  }
});

// Serve static files from React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('   SAFETY PLATFORM SERVER');
  console.log('='.repeat(60));
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Ollama URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
  console.log(`✓ Ollama Model: ${process.env.OLLAMA_MODEL || 'phi3:mini'}`);
  console.log('');
  console.log('Available Services:');
  console.log('    Toolbox Service (with AI): /api/toolbox');
  console.log('    Incident Reporting: /api/incidents');
  console.log('     Risk Assessment: /api/risk-assessments');
  console.log('    Permit System: /api/permits');
  console.log('    Access Control: /api/access-control');
  console.log('');
  console.log('Dashboard Stats: /api/dashboard/stats');
  console.log('Health Check: /api/health');
  console.log('='.repeat(60));
});

module.exports = app;
