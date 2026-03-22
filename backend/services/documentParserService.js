/**
 * Document Parser Service
 * Extracts plain text from PDF, DOCX, and TXT files
 */

const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract plain text from a file given its path and MIME type
 */
async function extractTextFromFile(filePath, mimetype) {
  if (mimetype === 'application/pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (mimetype === 'text/plain') {
    return fs.readFileSync(filePath, 'utf8');
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
}

/**
 * Split text into overlapping word chunks (~500 words each, 50-word overlap)
 * Overlap prevents important context from being cut at boundaries.
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) chunks.push(chunk);
  }
  return chunks;
}

module.exports = { extractTextFromFile, chunkText };
