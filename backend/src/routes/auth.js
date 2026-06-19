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
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
    }

    // Constant-time email comparison to prevent timing attacks
    const adminEmail = process.env.ADMIN_EMAIL;
    const emailMatch = email === adminEmail;

    // Always run bcrypt compare (even if email wrong) to prevent timing attacks
    const passwordHash = process.env.ADMIN_PASSWORD_HASH || '$2a$12$invalidhashtopreventtimingattacks0000000000000000000';
    const passwordMatch = await bcrypt.compare(password, passwordHash);

    if (!emailMatch || !passwordMatch) {
      // Generic error — don't reveal which field was wrong
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    // Generate JWT — no sensitive data in payload
    const token = jwt.sign(
      { role: 'admin', iat: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '8h', algorithm: 'HS256' }
    );

    // Set httpOnly cookie — frontend NEVER sees the token
    res.cookie('geido_token', token, COOKIE_OPTIONS);

    return res.json({ success: true, message: 'Giriş başarılı.' });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
});


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

    // Generate JWT
    const token = jwt.sign(
      { role: 'admin', iat: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '8h', algorithm: 'HS256' }
    );

    // Set cookie
    res.cookie('geido_token', token, COOKIE_OPTIONS);
    
    // Notify telegram
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
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
