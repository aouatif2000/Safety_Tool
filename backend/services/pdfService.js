/**
 * PDF Service
 * Converts toolbox-talk markdown documents to A4-print-ready HTML or PDF buffers
 * using html-pdf-node + marked for markdown parsing.
 */

const htmlPdfNode = require('html-pdf-node');
const { marked } = require('marked');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Escape HTML special characters to prevent XSS when injecting user-supplied
 * text into raw HTML attribute strings.
 */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── HTML Builder ─────────────────────────────────────────────────────────────

/**
 * Build a complete, self-contained HTML document from a toolbox talk record.
 *
 * @param {object} doc  - Document record from toolboxService (has rawMarkdown, metadata, id, title)
 * @returns {string}    - Full HTML string, A4-ready for print or puppeteer
 */
function buildHtmlDocument(doc) {
  console.log('[PDF] buildHtmlDocument called');
  console.log('[PDF] doc.title:', doc?.title);
  console.log('[PDF] doc.rawMarkdown:', doc?.rawMarkdown ? `${doc.rawMarkdown.length} chars` : 'MISSING/EMPTY');
  console.log('[PDF] rawMarkdown preview:', doc?.rawMarkdown?.slice(0, 200) || '(none)');

  const bodyHtml = marked.parse(doc.rawMarkdown || '');
  const docId    = esc(doc.id);
  const title    = esc(doc.title || 'Toolbox Talk');
  const status   = esc(doc.metadata?.status || 'draft');
  const date     = doc.metadata?.createdAt
    ? new Date(doc.metadata.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    /* ── Page Setup ── */
    *, *::before, *::after { box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #111827;
      margin: 0;
      padding: 0;
    }

    /* ── Cover Header ── */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #1a56db;
      padding-bottom: 10px;
      margin-bottom: 18px;
    }
    .doc-header .brand {
      font-size: 18pt;
      font-weight: 700;
      color: #1a56db;
      letter-spacing: -0.5px;
    }
    .doc-header .brand span {
      color: #f97316;
    }
    .doc-header .meta {
      text-align: right;
      font-size: 8pt;
      color: #6b7280;
    }
    .doc-header .meta strong {
      display: block;
      font-size: 9pt;
      color: #374151;
    }

    /* ── Status Badge ── */
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-draft    { background: #fef3c7; color: #92400e; }
    .status-review   { background: #dbeafe; color: #1e40af; }
    .status-approved { background: #d1fae5; color: #065f46; }

    /* ── Headings ── */
    h1 {
      font-size: 15pt;
      color: #111827;
      margin: 0 0 14px 0;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 6px;
    }
    h2 {
      font-size: 11pt;
      font-weight: 700;
      color: #ffffff;
      background: #1a56db;
      margin: 20px 0 8px 0;
      padding: 5px 10px;
      border-radius: 3px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10pt;
      font-weight: 600;
      color: #1a56db;
      margin: 14px 0 4px 0;
      page-break-after: avoid;
    }
    h4 {
      font-size: 10pt;
      font-weight: 600;
      color: #374151;
      margin: 10px 0 4px 0;
    }

    /* ── Body Text ── */
    p  { margin: 0 0 8px 0; }
    ul, ol { margin: 4px 0 8px 20px; padding: 0; }
    li { margin-bottom: 3px; }
    strong { color: #111827; }
    em     { color: #374151; }

    /* ── Tables ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    thead tr {
      background: #1a56db;
      color: #ffffff;
    }
    thead th {
      padding: 6px 8px;
      text-align: left;
      font-weight: 600;
    }
    tbody tr:nth-child(even)  { background: #f9fafb; }
    tbody tr:nth-child(odd)   { background: #ffffff; }
    tbody td {
      padding: 5px 8px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }

    /* ── Blockquotes → Warning / Info boxes ── */
    blockquote {
      border-left: 4px solid #ef4444;
      background: #fef2f2;
      margin: 12px 0;
      padding: 8px 12px;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
    }
    blockquote p { margin: 0; color: #991b1b; font-weight: 500; }

    /* ── Code blocks (for MCQ answers, etc.) ── */
    code {
      background: #f3f4f6;
      border-radius: 3px;
      padding: 1px 4px;
      font-size: 9pt;
    }
    pre {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 10px 12px;
      overflow: auto;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    pre code { background: none; padding: 0; }

    /* ── Sign-off table helpers ── */
    .sign-table td { min-height: 28px; }

    /* ── Horizontal Rule ── */
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 16px 0;
    }

    /* ── Print helpers ── */
    a { color: inherit; text-decoration: none; }

    /* ── Digital Sign-off Section ── */
    .signoff-section {
      margin-top: 28px;
      border-top: 2px solid #1a56db;
      padding-top: 10px;
    }
    .signoff-section h2 {
      background: #065f46;
    }
  </style>
</head>
<body>
  <!-- Document header / cover strip -->
  <div class="doc-header">
    <div class="brand">Apex<span>Sentinel</span></div>
    <div class="meta">
      <strong>${title}</strong>
      ${docId} &nbsp;|&nbsp; ${date}
      &nbsp;|&nbsp;
      <span class="status-badge status-${status}">${status}</span>
    </div>
  </div>

  <!-- Converted markdown body -->
  ${bodyHtml}

  ${(doc.signoffs && doc.signoffs.length > 0) ? `
  <!-- Digital sign-off records appended at export time -->
  <div class="signoff-section">
    <h2>Recorded Sign-Offs (Digital Record)</h2>
    <p style="font-size:8.5pt;color:#6b7280;margin-bottom:8px;">
      The following sign-offs were recorded digitally after this toolbox talk was delivered.
    </p>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Full Name</th>
          <th>Attended</th>
          <th>Understood</th>
          <th>Will Apply</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${doc.signoffs.map((s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${esc(s.name || '')}</td>
          <td>${s.attended  ? '✓' : '✗'}</td>
          <td>${s.understood ? '✓' : '✗'}</td>
          <td>${s.willApply  ? '✓' : '✗'}</td>
          <td>${s.signedAt ? new Date(s.signedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}
</body>
</html>`;
}

// ─── PDF Generator ────────────────────────────────────────────────────────────

/**
 * Generate a PDF buffer from a toolbox talk document record.
 *
 * @param {object} doc  - Document record from toolboxService
 * @returns {Buffer}    - PDF binary buffer
 */
async function generatePdf(doc) {
  const html = buildHtmlDocument(doc);

  const file = { content: html };
  const options = {
    format: 'A4',
    printBackground: true
  };

  try {
    const pdfBuffer = await htmlPdfNode.generatePdf(file, options);
    console.log(`[PDF] Buffer size: ${pdfBuffer?.length ?? 0} bytes`);
    return pdfBuffer;
  } catch (err) {
    console.error('[PDF] generatePdf failed:', err);
    throw err;
  }
}

module.exports = { buildHtmlDocument, generatePdf };
