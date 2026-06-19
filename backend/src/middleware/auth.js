/**
 * JWT Authentication Middleware
 * Verifies httpOnly cookie token on every protected route
 */
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const cmsPath = path.join(__dirname, '../../data/cms.json');

const authMiddleware = (req, res, next) => {
  // Token comes from httpOnly cookie ONLY (never from Authorization header or body)
  const token = req.cookies?.geido_token;

  if (!token) {
    console.error('[AuthMiddleware] No token found! Cookies received:', req.cookies);
    return res.status(401).json({ error: 'Oturum bulunamadı. Lütfen giriş yapın. (Debug: No geido_token)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 1) Session Revocation Check (Panik Butonu /tumunukapat)
    try {
      const cmsData = JSON.parse(fs.readFileSync(cmsPath, 'utf8'));
      const revokeTimestamp = cmsData.settings?.jwtRevokeTimestamp || 0;
      if (decoded.iat <= revokeTimestamp) {
        throw new Error('Revoked');
      }
    } catch (e) {
      if (e.message === 'Revoked') throw e;
      // Error reading cms.json, ignore
    }

    // 2) Browser Fingerprinting Check (IP ve User-Agent uyumu)
    let currentIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    let currentUA = req.headers['user-agent'] || 'Unknown';
    
    // Normalize localhost IPs for local development stability
    if (currentIP === '::1' || currentIP === '::ffff:127.0.0.1') {
      currentIP = '127.0.0.1';
    }
    
    if (decoded.ip && decoded.ip !== currentIP) {
       throw new Error('IP_Mismatch');
    }
    if (decoded.ua && decoded.ua !== currentUA) {
       throw new Error('UA_Mismatch');
    }

    req.admin = decoded;
    next();
  } catch (err) {
    // Clear invalid cookie
    res.clearCookie('geido_token', { httpOnly: true, path: '/' });

    if (err.name === 'TokenExpiredError') {
      console.error('[AuthMiddleware] Token Expired.');
      return res.status(401).json({ error: 'Oturum süresi doldu. Tekrar giriş yapın.' });
    }
    if (err.message === 'Revoked') {
      console.error('[AuthMiddleware] Token Revoked.');
      return res.status(401).json({ error: 'Güvenlik gereği tüm oturumlar kapatıldı. Tekrar giriş yapın.' });
    }
    if (err.message === 'IP_Mismatch' || err.message === 'UA_Mismatch') {
      console.error('[AuthMiddleware] Fingerprint mismatch:', err.message);
      return res.status(401).json({ error: `Cihaz veya IP değişikliği tespit edildi (${err.message}). Güvenlik gereği tekrar giriş yapın.` });
    }
    console.error('[AuthMiddleware] Invalid token error:', err);
    return res.status(401).json({ error: 'Geçersiz oturum.' });
  }
};

module.exports = authMiddleware;
