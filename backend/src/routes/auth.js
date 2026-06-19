/**
 * Auth Routes
 * POST /api/auth/login  - Login with email/password → sets httpOnly cookie
 * POST /api/auth/logout - Clears cookie
 * GET  /api/auth/me     - Check if logged in (returns 200 or 401)
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const { notifyLoginSuccess } = require('../services/telegramService');

const router = express.Router();

// ── Rate Limiter: Max 10 attempts per 15 minutes per IP ──────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Çok fazla başarısız giriş denemesi. 15 dakika sonra tekrar deneyin.'
    });
  }
});

// Cookie config — httpOnly means JS can NEVER read this cookie
const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,                // JS cannot access — XSS protection
  secure: IS_PROD,               // HTTPS only in production
  sameSite: IS_PROD ? 'none' : 'lax', // 'none' for cross-domain prod, 'lax' for same-host dev
  maxAge: 8 * 60 * 60 * 1000,   // 8 hours
  path: '/',
};

// ── POST /api/auth/login ─────────────────────────────────────────────────────
// Removed for security. Telegram passwordless login is now the only way.

// ── POST /api/auth/telegram-login ──────────────────────────────────────────────
router.post('/telegram-login', async (req, res) => {
  try {
    const { socketId } = req.body;
    if (!socketId) return res.status(400).json({ error: 'Eksik parametre.' });

    if (!global.approvedLogins || !global.approvedLogins[socketId]) {
      return res.status(401).json({ error: 'Bu oturum için onay bulunamadı veya onay süresi doldu.' });
    }

    // Clear the approval so it cannot be reused
    delete global.approvedLogins[socketId];

    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientUA = req.headers['user-agent'] || 'Unknown';

    // Generate JWT
    const token = jwt.sign(
      { 
        role: 'admin', 
        ip: clientIP,
        ua: clientUA 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h', algorithm: 'HS256' }
    );

    // Set cookie
    res.cookie('geido_token', token, COOKIE_OPTIONS);
    
    // Notify telegram
    if (notifyLoginSuccess) notifyLoginSuccess(clientIP);

    return res.json({ success: true, message: 'Telegram onayı ile giriş başarılı.' });
  } catch (err) {
    console.error('[Auth] Telegram Login error:', err.message);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('geido_token', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    path: '/',
  });
  return res.json({ success: true, message: 'Çıkış yapıldı.' });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns 200 if authenticated, 401 if not
router.get('/me', authMiddleware, (req, res) => {
  return res.json({ authenticated: true, role: req.admin.role });
});

module.exports = router;
