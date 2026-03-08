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
  const { documentType, context } = spec;
  
  // Get rules for this document type
  const rules = documentRules.getRules(documentType);
  
  // Generate document using LLM
  const result = await llmService.generateDocument(documentType, context, rules);
  
  if (!result.success) {
    throw new Error('Document generation failed');
  }
  
  // Create document record
  const document = {
    id: `DOC-${String(documentIdCounter++).padStart(4, '0')}`,
    type: documentType,
    title: result.document.title,
    content: result.document,
    rawMarkdown: result.rawMarkdown,
    metadata: {
      ...result.metadata,
      createdAt: new Date().toISOString(),
      createdBy: spec.createdBy || 'System',
      status: 'draft',
      version: 1
    },
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
  if (updates.status) document.metadata.status = updates.status;
  if (updates.content) {
    document.content = updates.content;
    document.metadata.version++;
    document.metadata.updatedAt = new Date().toISOString();
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
 * Export document to different formats
 */
function exportDocument(id, format = 'markdown') {
  const document = getDocumentById(id);
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  switch (format) {
    case 'markdown':
      return {
        content: document.rawMarkdown,
        filename: `${document.id}_${document.title.replace(/\s+/g, '_')}.md`,
        mimeType: 'text/markdown'
      };
      
    case 'text':
      // Strip markdown formatting for plain text
      const plainText = document.rawMarkdown
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.+?)\*/g, '$1'); // Remove italic
      
      return {
        content: plainText,
        filename: `${document.id}_${document.title.replace(/\s+/g, '_')}.txt`,
        mimeType: 'text/plain'
      };
      
    case 'json':
      return {
        content: JSON.stringify(document, null, 2),
        filename: `${document.id}_${document.title.replace(/\s+/g, '_')}.json`,
        mimeType: 'application/json'
      };
      
    default:
      throw new Error('Unsupported export format');
  }
}

module.exports = {
  generateDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentStats,
  exportDocument
};
