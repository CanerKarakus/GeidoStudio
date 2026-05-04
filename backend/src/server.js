/**
 * Geido Studio Backend — Main Server
 * Express + Helmet + CORS + Cookie-based JWT Auth
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// ── Env validation ───────────────────────────────────────────────────────────
const required = ['JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH'];
for (const key of required) {
  if (!process.env[key] || process.env[key].startsWith('CHANGE_THIS')) {
    console.error(`\n❌ Missing or unconfigured env variable: ${key}`);
    console.error('   Run: npm run setup\n');
    process.exit(1);
  }
}

const app = express();

// ── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',  // Local dev
  'http://localhost:4173',  // Vite preview
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) — only in dev
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin not allowed: ${origin}`));
  },
  credentials: true,          // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));  // Limit body size
app.use(cookieParser());

// ── Trust proxy (needed if behind Nginx/cPanel proxy) ───────────────────────
app.set('trust proxy', 1);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/cms',        require('./routes/cms'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/newsletter', require('./routes/newsletter'));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı.' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ error: 'CORS: Erişim reddedildi.' });
  }
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Sunucu hatası.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Geido Studio Backend`);
  console.log(`   Port:    ${PORT}`);
  console.log(`   CORS:    ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`   Mode:    ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
