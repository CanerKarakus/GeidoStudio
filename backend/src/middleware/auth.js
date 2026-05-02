/**
 * JWT Authentication Middleware
 * Verifies httpOnly cookie token on every protected route
 */
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Token comes from httpOnly cookie ONLY (never from Authorization header or body)
  const token = req.cookies?.geido_token;

  if (!token) {
    return res.status(401).json({ error: 'Oturum bulunamadı. Lütfen giriş yapın.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    // Clear invalid cookie
    res.clearCookie('geido_token', { httpOnly: true, path: '/' });

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Oturum süresi doldu. Tekrar giriş yapın.' });
    }
    return res.status(401).json({ error: 'Geçersiz oturum.' });
  }
};

module.exports = authMiddleware;
