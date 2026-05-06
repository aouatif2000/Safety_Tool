/**
 * Knowledge Base Service
 * Indexes company documents and retrieves relevant context for LLM generation.
 * Uses a simple TF-IDF-style token overlap scorer (no external vector DB needed).
 */

const fs = require('fs');
const path = require('path');
const { extractTextFromFile, chunkText } = require('./documentParserService');

const RAW_DIR  = path.join(__dirname, '../knowledge-base/raw');
const INDEX_DIR = path.join(__dirname, '../knowledge-base/indexed');
const TEMP_DIR  = path.join(__dirname, '../knowledge-base/temp');
const INDEX_FILE = path.join(INDEX_DIR, 'index.json');

const PRELOAD_DIR = path.join(__dirname, '../knowledge');

// Map file extensions to MIME types accepted by extractTextFromFile
const EXT_MIME_MAP = {
  '.pdf':  'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt':  'text/plain'
};

// Ensure all directories exist on startup
[RAW_DIR, INDEX_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// In-memory index: array of { docId, filename, chunkIndex, text, tokens }
let searchIndex = [];

/**
 * Lightweight word tokenizer — no external NLP library needed.
 * Returns lowercase alpha tokens of 2+ characters.
 */
function tokenize(text) {
  return (text.toLowerCase().match(/\b[a-z]{2,}\b/g) || []);
}

// ─── Persistence ────────────────────────────────────────────────────────────

function loadIndex() {
  try {
    if (fs.existsSync(INDEX_FILE)) {
      searchIndex = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      console.log(`[KB] Loaded ${searchIndex.length} chunks from index`);
    }
  } catch (err) {
    console.error('[KB] Failed to load index, starting fresh:', err.message);
    searchIndex = [];
  }
}

function saveIndex() {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(searchIndex, null, 2));
}

// Load on startup
loadIndex();

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Add a document to the knowledge base.
 * @param {string} filePath  - Temp path written by multer
 * @param {string} filename  - Original filename (for display)
 * @param {string} mimetype  - MIME type of the file
 */
async function addDocument(filePath, filename, mimetype) {
  const docId = `DOC-${Date.now()}`;

  // Persist raw file
  const ext = path.extname(filename);
  const destPath = path.join(RAW_DIR, `${docId}${ext}`);
  fs.copyFileSync(filePath, destPath);
  fs.unlinkSync(filePath); // remove multer temp file

  // Extract & chunk text
  const fullText = await extractTextFromFile(destPath, mimetype);
  const chunks = chunkText(fullText);

  // Build tokenised chunk records
  const newChunks = chunks.map((text, i) => ({
    docId,
    filename,
    chunkIndex: i,
    text,
    tokens: tokenize(text)
  }));

  searchIndex.push(...newChunks);
  saveIndex();

  console.log(`[KB] Indexed "${filename}" → ${chunks.length} chunks`);

  return {
    docId,
    filename,
    chunkCount: chunks.length,
    charCount: fullText.length
  };
}

/**
 * Remove a document (and all its chunks) from the knowledge base.
 */
function removeDocument(docId) {
  const before = searchIndex.length;
  searchIndex = searchIndex.filter(c => c.docId !== docId);
  saveIndex();

  // Delete raw file
  try {
    const files = fs.readdirSync(RAW_DIR);
    const file = files.find(f => f.startsWith(docId));
    if (file) fs.unlinkSync(path.join(RAW_DIR, file));
  } catch (err) {
    console.warn('[KB] Could not delete raw file for', docId, err.message);
  }

  console.log(`[KB] Removed ${docId} (${before - searchIndex.length} chunks deleted)`);
}

/**
 * Return one record per document (deduplicated) with chunk counts.
 */
function listDocuments() {
  const seen = new Set();
  return searchIndex
    .filter(c => {
      if (seen.has(c.docId)) return false;
      seen.add(c.docId);
      return true;
    })
    .map(c => ({
      docId: c.docId,
      filename: c.filename,
      chunkCount: searchIndex.filter(x => x.docId === c.docId).length
    }));
}

/**
 * Return aggregate stats.
 */
function getStats() {
  const docs = listDocuments();
  return {
    documentCount: docs.length,
    chunkCount: searchIndex.length
  };
}

/**
 * Score every indexed chunk against the query using token overlap (TF-IDF-like).
 * Returns a concatenated string of the top relevant chunks, or null if the
 * knowledge base is empty or no chunks score above zero.
 *
 * @param {string} query    - Free-text search query built from user inputs
 * @param {number} maxChars - Hard cap on returned context length (default 3000)
 */
function getRelevantContext(query, maxChars = 1500) {
  if (!query || searchIndex.length === 0) return null;

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return null;

  // Score each chunk by fraction of query tokens it contains
  const scored = searchIndex.map(chunk => {
    const matchCount = queryTokens.filter(t => chunk.tokens.includes(t)).length;
    return { ...chunk, score: matchCount / queryTokens.length };
  });

  const topChunks = scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Max 5 chunks for Groq API

  if (topChunks.length === 0) return null;

  // Concatenate until we hit the character limit
  let context = '';
  for (const chunk of topChunks) {
    const candidate = context + chunk.text + '\n\n';
    if (candidate.length > maxChars) break;
    context = candidate;
  }

  return context.trim() || null;
}

/**
 * Preload documents from the backend/knowledge/ folder at server startup.
 * Files already present in the index (matched by filename) are skipped.
 * Returns the number of new documents indexed.
 */
async function preloadKnowledge() {
  if (!fs.existsSync(PRELOAD_DIR)) {
    console.warn('[KB] Preload folder not found, skipping:', PRELOAD_DIR);
    return 0;
  }

  let files;
  try {
    files = fs.readdirSync(PRELOAD_DIR);
  } catch (err) {
    console.warn('[KB] Could not read preload folder:', err.message);
    return 0;
  }

  const supported = files.filter(f => EXT_MIME_MAP[path.extname(f).toLowerCase()]);

  if (supported.length === 0) {
    console.warn('[KB] backend/knowledge/ is empty or contains no PDF/DOCX/TXT files — skipping preload');
    return 0;
  }

  // Collect filenames already in the index to avoid re-indexing on restart
  const indexedFilenames = new Set(searchIndex.map(c => c.filename));

  let loaded = 0;
  for (const filename of supported) {
    if (indexedFilenames.has(filename)) {
      console.log(`[KB] Already indexed, skipping: "${filename}"`);
      continue;
    }

    const filePath = path.join(PRELOAD_DIR, filename);
    const mimetype = EXT_MIME_MAP[path.extname(filename).toLowerCase()];

    try {
      const docId = `PRELOAD-${Date.now()}-${loaded}`;
      const fullText = await extractTextFromFile(filePath, mimetype);
      const chunks = chunkText(fullText);

      const newChunks = chunks.map((text, i) => ({
        docId,
        filename,
        chunkIndex: i,
        text,
        tokens: tokenize(text)
      }));

      searchIndex.push(...newChunks);
      loaded++;
      console.log(`[KB] Preloaded "${filename}" → ${chunks.length} chunks`);
    } catch (err) {
      console.error(`[KB] Failed to preload "${filename}":`, err.message);
    }
  }

  if (loaded > 0) saveIndex();
  return loaded;
}

module.exports = {
  addDocument,
  removeDocument,
  listDocuments,
  getStats,
  getRelevantContext,
  preloadKnowledge
};
