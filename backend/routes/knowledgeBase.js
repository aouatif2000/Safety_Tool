/**
 * Knowledge Base Routes
 * Admin API for uploading, listing, and deleting indexed company documents.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const knowledgeBaseService = require('../services/knowledgeBaseService');

const TEMP_DIR = path.join(__dirname, '../knowledge-base/temp');

const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, DOCX, TXT`));
    }
  }
});

/**
 * POST /api/knowledge-base/upload
 * Upload up to 10 files, extract and index them.
 */
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const results = [];
    for (const file of req.files) {
      try {
        const result = await knowledgeBaseService.addDocument(
          file.path,
          file.originalname,
          file.mimetype
        );
        results.push({ ...result, success: true });
      } catch (err) {
        results.push({ filename: file.originalname, success: false, error: err.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('[KB Route] Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/knowledge-base/documents
 * List all indexed documents with chunk counts and aggregate stats.
 */
router.get('/documents', (_req, res) => {
  try {
    const documents = knowledgeBaseService.listDocuments();
    const stats = knowledgeBaseService.getStats();
    res.json({ success: true, documents, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/knowledge-base/documents/:docId
 * Remove a document and all its chunks from the index.
 */
router.delete('/documents/:docId', (req, res) => {
  try {
    knowledgeBaseService.removeDocument(req.params.docId);
    res.json({ success: true, docId: req.params.docId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
