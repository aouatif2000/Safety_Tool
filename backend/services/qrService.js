/**
 * QR Sign-Off Service
 * Issues short-lived JWT tokens embedded in QR codes.
 * Workers scan the QR, land on /sign/:token, and submit their name + acknowledgements.
 */

const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

const JWT_SECRET = process.env.JWT_SECRET || 'apex-dev-secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Issue a signed JWT for a document sign-off link.
 * Expires in 24 hours.
 *
 * @param {string} documentId
 * @returns {string} Signed JWT token
 */
function createSignToken(documentId) {
  return jwt.sign(
    { documentId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify a sign-off JWT and return its payload.
 * Throws if the token is invalid, tampered with, or expired.
 *
 * @param {string} token
 * @returns {{ documentId: string, iat: number, exp: number }}
 */
function verifySignToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Build a QR code data-URL that points to the mobile sign-off page.
 *
 * @param {string} documentId
 * @returns {Promise<{ dataUrl: string, url: string }>}
 */
async function generateQrDataUrl(documentId) {
  const token = createSignToken(documentId);
  const url = `${FRONTEND_URL}/sign/${token}`;
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: { dark: '#111827', light: '#ffffff' }
  });
  return { dataUrl, url };
}

module.exports = { createSignToken, verifySignToken, generateQrDataUrl };
