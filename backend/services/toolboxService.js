/**
 * Toolbox Service
 * Central hub for documents, instructions, procedures, and checklists
 */

const llmService = require('./llmService');
const documentRules = require('../config/documentRules');

// In-memory document store (replace with database in production)
let documents = [];
let documentIdCounter = 1;

/**
 * Generate a new document using AI
 */
async function generateDocument(spec) {
  const { documentType, context, documentContext } = spec;
  
  // Get rules for this document type
  const rules = documentRules.getRules(documentType);
  
  // Generate document using LLM (documentContext may carry KB-retrieved text)
  const result = await llmService.generateDocument(documentType, context, rules, documentContext);
  
  if (!result.success) {
    throw new Error('Document generation failed');
  }
  
  // Create document record
  const now = new Date().toISOString();
  const document = {
    id: `DOC-${String(documentIdCounter++).padStart(4, '0')}`,
    type: documentType,
    title: result.document.title,
    content: result.document,
    rawMarkdown: result.rawMarkdown,
    metadata: {
      ...result.metadata,
      createdAt: now,
      createdBy: spec.createdBy || 'System',
      status: 'draft',
      version: 1,
      reviewedBy: null,
      reviewedAt: null,
      approvedBy: null,
      approvedAt: null
    },
    auditLog: [
      {
        action: 'created',
        actor: spec.createdBy || 'System',
        timestamp: now,
        fromStatus: null,
        toStatus: 'draft'
      }
    ],
    signoffs: [],
    context: context,
    tags: spec.tags || []
  };
  
  documents.push(document);
  
  return document;
}

/**
 * Get all documents
 */
function getAllDocuments(filters = {}) {
  let filtered = [...documents];
  
  // Filter by type
  if (filters.type) {
    filtered = filtered.filter(doc => doc.type === filters.type);
  }
  
  // Filter by status
  if (filters.status) {
    filtered = filtered.filter(doc => doc.metadata.status === filters.status);
  }
  
  // Search in title and content
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(doc => 
      doc.title.toLowerCase().includes(searchLower) ||
      doc.rawMarkdown.toLowerCase().includes(searchLower)
    );
  }
  
  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(doc => 
      filters.tags.some(tag => doc.tags.includes(tag))
    );
  }
  
  // Sort by creation date (newest first)
  filtered.sort((a, b) => 
    new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt)
  );
  
  return filtered;
}

/**
 * Get document by ID
 */
function getDocumentById(id) {
  return documents.find(doc => doc.id === id);
}

/**
 * Update document
 */
function updateDocument(id, updates) {
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) {
    throw new Error('Document not found');
  }
  
  const document = documents[index];
  
  // Update allowed fields
  if (updates.title) document.title = updates.title;
  if (updates.tags) document.tags = updates.tags;
  // Direct status updates via this function are only for draft saves (wizard).
  // Workflow transitions (draft→review→approved) must go through transitionStatus().
  if (updates.status && updates.status === 'draft') document.metadata.status = updates.status;
  let contentUpdated = false;
  if (updates.rawMarkdown !== undefined) {
    document.rawMarkdown = updates.rawMarkdown;
    contentUpdated = true;
  }
  if (updates.content) {
    document.content = updates.content;
    contentUpdated = true;
  }
  if (contentUpdated) {
    document.metadata.version++;
    const updatedAt = new Date().toISOString();
    document.metadata.updatedAt = updatedAt;
    document.auditLog.push({
      action: 'content_edited',
      actor: updates.actor || 'System',
      timestamp: updatedAt,
      fromStatus: document.metadata.status,
      toStatus: document.metadata.status,
      note: `Version bumped to ${document.metadata.version}`
    });
  }

  documents[index] = document;
  
  return document;
}

/**
 * Delete document
 */
function deleteDocument(id) {
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) {
    throw new Error('Document not found');
  }
  
  documents.splice(index, 1);
  
  return { success: true };
}

/**
 * Get document statistics
 */
function getDocumentStats() {
  const total = documents.length;
  const byType = {};
  const byStatus = {};
  
  documents.forEach(doc => {
    // Count by type
    byType[doc.type] = (byType[doc.type] || 0) + 1;
    
    // Count by status
    const status = doc.metadata.status;
    byStatus[status] = (byStatus[status] || 0) + 1;
  });
  
  return {
    total,
    byType,
    byStatus,
    recentDocuments: documents
      .sort((a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt))
      .slice(0, 5)
      .map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        createdAt: doc.metadata.createdAt
      }))
  };
}

/**
 * Export document to different formats.
 * Returns { content, filename, mimeType } for text formats,
 * or { buffer, filename, mimeType } for binary (pdf).
 */
async function exportDocument(id, format = 'markdown') {
  const pdfService = require('./pdfService');
  const store = require('../models/store');

  // Look in the documents store first; fall back to sessions store
  let document = getDocumentById(id);

  if (!document) {
    const session = store.sessions.find(s => s.id === id);
    if (session) {
      // Normalise session shape to match what pdfService expects
      document = {
        id:          session.id,
        title:       session.title,
        rawMarkdown: session.rawMarkdown,
        metadata:    { status: session.status, createdAt: session.createdAt }
      };
      console.log('[Export] Document resolved from sessions store');
    }
  }

  if (!document) {
    throw new Error('Document not found');
  }

  console.log('[Export] Exporting id:', id, '| format:', format, '| rawMarkdown:', document.rawMarkdown ? `${document.rawMarkdown.length} chars` : 'MISSING');

  const safeName = document.title.replace(/[^a-zA-Z0-9_-]/g, '_');

  switch (format) {
    case 'markdown':
      return {
        content: document.rawMarkdown,
        filename: `${document.id}_${safeName}.md`,
        mimeType: 'text/markdown'
      };

    case 'text': {
      const plainText = document.rawMarkdown
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1');
      return {
        content: plainText,
        filename: `${document.id}_${safeName}.txt`,
        mimeType: 'text/plain'
      };
    }

    case 'json':
      return {
        content: JSON.stringify(document, null, 2),
        filename: `${document.id}_${safeName}.json`,
        mimeType: 'application/json'
      };

    case 'html': {
      const html = pdfService.buildHtmlDocument(document);
      return {
        content: html,
        filename: `${document.id}_${safeName}.html`,
        mimeType: 'text/html'
      };
    }

    case 'pdf': {
      const buffer = await pdfService.generatePdf(document);
      return {
        buffer,
        filename: `${document.id}_${safeName}.pdf`,
        mimeType: 'application/pdf'
      };
    }

    default:
      throw new Error('Unsupported export format');
  }
}

/**
 * Valid workflow status transitions.
 * Keys are current status; values are the statuses that may be transitioned to.
 * 'approved' is terminal — no further transitions allowed.
 */
const VALID_TRANSITIONS = {
  draft:    ['review'],
  review:   ['approved', 'draft'],  // 'draft' = rejected back for rework
  approved: []                       // terminal
};

/**
 * Transition a document through the approval workflow.
 * Enforces the state machine and appends an immutable audit log entry.
 *
 * @param {string} id        - Document ID
 * @param {string} newStatus - Target status ('review' | 'approved' | 'draft')
 * @param {string} actor     - Name / identifier of the person performing the action
 * @returns {object}         - Updated document
 * @throws                   - If transition is invalid or document not found
 */
function transitionStatus(id, newStatus, actor) {
  const index = documents.findIndex(doc => doc.id === id);
  if (index === -1) throw new Error('Document not found');

  const current = documents[index].metadata.status;
  const allowed = VALID_TRANSITIONS[current] || [];

  if (!allowed.includes(newStatus)) {
    const allowedStr = allowed.length ? allowed.join(', ') : 'none (terminal state)';
    throw new Error(`Invalid transition: ${current} → ${newStatus}. Allowed from '${current}': ${allowedStr}`);
  }

  const now = new Date().toISOString();
  documents[index].metadata.status = newStatus;

  if (newStatus === 'review') {
    documents[index].metadata.reviewedBy = actor;
    documents[index].metadata.reviewedAt = now;
  }
  if (newStatus === 'approved') {
    documents[index].metadata.approvedBy = actor;
    documents[index].metadata.approvedAt = now;
  }

  const actionLabel = newStatus === 'draft' ? 'rejected_to_draft' : newStatus;
  documents[index].auditLog.push({
    action: actionLabel,
    actor,
    timestamp: now,
    fromStatus: current,
    toStatus: newStatus
  });

  return documents[index];
}

/**
 * Append a sign-off entry to a document.
 * Also writes an immutable audit log entry.
 *
 * @param {string} id      - Document ID
 * @param {object} signoff - Sign-off object { id, name, attended, understood, willApply, signedAt }
 */
function appendSignoff(id, signoff) {
  const index = documents.findIndex(doc => doc.id === id);
  if (index === -1) throw new Error('Document not found');

  documents[index].signoffs.push(signoff);
  documents[index].auditLog.push({
    action: 'signed',
    actor: signoff.name,
    timestamp: signoff.signedAt,
    fromStatus: documents[index].metadata.status,
    toStatus: documents[index].metadata.status,
    note: `Digital sign-off recorded (attended=${signoff.attended}, understood=${signoff.understood}, willApply=${signoff.willApply})`
  });
}

module.exports = {
  generateDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentStats,
  exportDocument,
  transitionStatus,
  appendSignoff
};
