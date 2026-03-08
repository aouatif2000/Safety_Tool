/**
 * Toolbox Routes
 * API endpoints for Toolbox Service with AI document generation
 */

const express = require('express');
const router = express.Router();
const toolboxService = require('../services/toolboxService');
const llmService = require('../services/llmService');
const documentRules = require('../config/documentRules');

/**
 * POST /api/toolbox/generate-document
 * Generate a new document using AI
 */
router.post('/generate-document', async (req, res) => {
  try {
    const { documentType, context, createdBy, tags } = req.body;
    
    // Validate input
    if (!documentType || !context) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: documentType, context'
      });
    }
    
    if (!context.title) {
      return res.status(400).json({
        success: false,
        error: 'Context must include a title'
      });
    }
    
    console.log(`[API] Generating ${documentType} document: "${context.title}"`);
    
    // Generate document
    const document = await toolboxService.generateDocument({
      documentType,
      context,
      createdBy,
      tags
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
 * Export a document in different formats
 */
router.get('/export/:id', async (req, res) => {
  try {
    const format = req.query.format || 'markdown';
    const exportData = toolboxService.exportDocument(req.params.id, format);
    
    res.setHeader('Content-Type', exportData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
    res.send(exportData.content);
    
  } catch (error) {
    console.error('[API] Error exporting document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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
