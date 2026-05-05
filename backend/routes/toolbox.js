/**
 * Toolbox Routes
 * API endpoints for Toolbox Service with AI document generation
 */

const express = require('express');
const router = express.Router();
const toolboxService = require('../services/toolboxService');
const llmService = require('../services/llmService');
const documentRules = require('../config/documentRules');
const { getRelevantContext } = require('../services/knowledgeBaseService');
const qrService = require('../services/qrService');

/**
 * POST /api/toolbox/generate-document
 * Generate a new document using AI
 * Body can contain either structured context or simple parameters
 */
router.post('/generate-document', async (req, res) => {
  try {
    const { 
      documentType, 
      context,
      // Alternative simple parameters (from frontend)
      projectId,
      topic,
      typeOfWork,
      location,
      mainHazards,
      additionalNotes,
      language,
      createdBy, 
      tags 
    } = req.body;
    
    // Validate documentType
    if (!documentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: documentType'
      });
    }
    
    // Build context from either explicit context or simple parameters
    let documentContext = context;
    if (!documentContext) {
      // Build context from simple parameters
      documentContext = {
        documentType,
        title: topic || typeOfWork || `Generated ${documentType} Document`,
        location,
        tasks: mainHazards ? [mainHazards] : [],
        customInstructions: additionalNotes,
        language: language || 'en'
      };
    }
    
    // Validate context has at least a title
    if (!documentContext.title) {
      return res.status(400).json({
        success: false,
        error: 'Context must include a title'
      });
    }
    
    console.log(`[API] Generating ${documentType} document: "${documentContext.title}"`);

    // Auto-retrieve relevant Knowledge Base context for this request
    const kbQuery = [
      topic, typeOfWork, documentContext.title, location, mainHazards
    ].filter(Boolean).join(' ');
    const kbContext = getRelevantContext(kbQuery);
    if (kbContext) {
      console.log('[API] Injecting Knowledge Base context into generation');
    }
    
    // Generate document
    const document = await toolboxService.generateDocument({
      documentType,
      context: documentContext,
      documentContext: kbContext,
      createdBy: createdBy || 'System',
      tags: tags || []
    });
    
    res.json({
      success: true,
      document
    });
    
  } catch (error) {
    console.error('[API] Document generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/toolbox/documents
 * Get all documents with optional filters
 */
router.get('/documents', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      search: req.query.search,
      tags: req.query.tags ? req.query.tags.split(',') : undefined
    };
    
    const documents = toolboxService.getAllDocuments(filters);
    
    res.json({
      success: true,
      documents,
      count: documents.length
    });
    
  } catch (error) {
    console.error('[API] Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/toolbox/documents/:id
 * Get a specific document by ID
 */
router.get('/documents/:id', async (req, res) => {
  try {
    const document = toolboxService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      document
    });
    
  } catch (error) {
    console.error('[API] Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/toolbox/documents/:id
 * Update a document
 */
router.put('/documents/:id', async (req, res) => {
  try {
    const updates = req.body;
    const document = toolboxService.updateDocument(req.params.id, updates);
    
    res.json({
      success: true,
      document
    });
    
  } catch (error) {
    console.error('[API] Error updating document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/toolbox/documents/:id
 * Delete a document
 */
router.delete('/documents/:id', async (req, res) => {
  try {
    toolboxService.deleteDocument(req.params.id);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('[API] Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/toolbox/stats
 * Get document statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = toolboxService.getDocumentStats();
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('[API] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/toolbox/document-types
 * Get available document types with rules
 */
router.get('/document-types', async (req, res) => {
  try {
    const documentTypes = documentRules.getDocumentTypes();
    
    res.json({
      success: true,
      documentTypes
    });
    
  } catch (error) {
    console.error('[API] Error fetching document types:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/toolbox/export/:id
 * Export a document in different formats (markdown | text | json | html | pdf)
 */
router.get('/export/:id', async (req, res) => {
  try {
    const format = req.query.format || 'markdown';
    const exportData = await toolboxService.exportDocument(req.params.id, format);

    res.setHeader('Content-Type', exportData.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportData.filename}"`
    );

    // Binary formats use buffer; text formats use content string
    res.send(exportData.buffer ?? exportData.content);

  } catch (error) {
    console.error('[API] Error exporting document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/toolbox/documents/:id/submit-review
 * Transition document from draft → review
 */
router.post('/documents/:id/submit-review', (req, res) => {
  try {
    const doc = toolboxService.transitionStatus(
      req.params.id,
      'review',
      req.body.actor || 'System'
    );
    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/toolbox/documents/:id/approve
 * Transition document from review → approved
 */
router.post('/documents/:id/approve', (req, res) => {
  try {
    const doc = toolboxService.transitionStatus(
      req.params.id,
      'approved',
      req.body.actor || 'System'
    );
    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/toolbox/documents/:id/reject
 * Transition document from review → draft (reject back for rework)
 */
router.post('/documents/:id/reject', (req, res) => {
  try {
    const doc = toolboxService.transitionStatus(
      req.params.id,
      'draft',
      req.body.actor || 'System'
    );
    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/toolbox/documents/:id/qr
 * Generate a QR code data-URL for the document sign-off link.
 * The QR encodes a 24-hour JWT linking to /sign/:token on the frontend.
 */
router.get('/documents/:id/qr', async (req, res) => {
  try {
    const doc = toolboxService.getDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });

    const { dataUrl, url } = await qrService.generateQrDataUrl(doc.id);
    res.json({ success: true, qrDataUrl: dataUrl, signUrl: url });
  } catch (error) {
    console.error('[API] QR generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/toolbox/sign/:token
 * Public endpoint — no auth required.
 * Validates the JWT, checks the document is approved, records the sign-off.
 * Body: { name, attended, understood, willApply }
 */
router.post('/sign/:token', async (req, res) => {
  try {
    let payload;
    try {
      payload = qrService.verifySignToken(req.params.token);
    } catch {
      return res.status(401).json({ success: false, error: 'Sign link has expired or is invalid.' });
    }

    const { documentId } = payload;
    const doc = toolboxService.getDocumentById(documentId);
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found.' });

    if (doc.metadata.status !== 'approved') {
      return res.status(409).json({
        success: false,
        error: 'This document has not been approved yet and cannot be signed.'
      });
    }

    const { name, attended = false, understood = false, willApply = false } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }

    const now = new Date().toISOString();
    const signoff = {
      id: `SIG-${Date.now()}`,
      name: name.trim(),
      attended,
      understood,
      willApply,
      signedAt: now
    };

    // Append to doc using direct store mutation via toolboxService helper
    toolboxService.appendSignoff(documentId, signoff);

    res.json({ success: true, signoff });
  } catch (error) {
    console.error('[API] Sign error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/toolbox/documents/:id/audit
 * Returns the immutable audit log and signoffs list for a document.
 */
router.get('/documents/:id/audit', (req, res) => {
  try {
    const doc = toolboxService.getDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
    res.json({ success: true, auditLog: doc.auditLog, signoffs: doc.signoffs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/toolbox/health
 * Check LLM service health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await llmService.checkOllamaHealth();
    
    res.json({
      success: true,
      llm: health
    });
    
  } catch (error) {
    console.error('[API] Health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
