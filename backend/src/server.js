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
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow local dev origins
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    
    // Allow ngrok subdomains for testing
    if (origin.endsWith('.ngrok-free.dev') || origin.endsWith('.ngrok.io')) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS: Origin not allowed: ${origin}`));
  },
  credentials: true,
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
const http = require('http');
const { Server } = require('socket.io');
const { initImap } = require('./services/emailService');
const { readMessages, writeMessages } = require('./models/messageModel');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Admin connected to socket:', socket.id);
});

// Initialize IMAP listener
initImap((newMsg) => {
  const messages = readMessages();

  let targetIndex = -1;

  // 1) Best: match by In-Reply-To or References header → threadMessageId
  if (newMsg.inReplyTo) {
    targetIndex = messages.findIndex(m =>
      m.threadMessageId && m.threadMessageId === newMsg.inReplyTo
    );
    if (targetIndex === -1 && newMsg.references) {
      // References can be a space-separated list; check any match
      const refIds = newMsg.references.split(/\s+/);
      targetIndex = messages.findIndex(m =>
        m.threadMessageId && refIds.includes(m.threadMessageId)
      );
    }
  }

  // 2) Fallback: match by sender email (only if 1 thread with that email exists)
  if (targetIndex === -1) {
    const matchingByEmail = messages
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.email.toLowerCase() === newMsg.from.toLowerCase());
    if (matchingByEmail.length === 1) {
      targetIndex = matchingByEmail[0].i;
    }
  }

  if (targetIndex >= 0) {
    const thread = messages[targetIndex];
    thread.replies = thread.replies || [];

    // Deduplicate by incoming Message-ID
    const isDuplicate = thread.replies.some(r => r.messageId === newMsg.messageId);
    if (!isDuplicate) {
      const newReply = {
        id: require('uuid').v4(),
        sender: 'user',
        text: newMsg.text,
        date: newMsg.date,
        messageId: newMsg.messageId
      };
      thread.replies.push(newReply);

      // Move to top
      messages.splice(targetIndex, 1);
      messages.unshift(thread);
      writeMessages(messages);

      console.log(`[IMAP] Reply matched to thread "${thread.subject}" (${thread.email})`);
      io.emit('new_reply', { threadId: thread.id, reply: newReply });
      io.emit('messages_updated', messages);
    } else {
      console.log('[IMAP] Duplicate message ignored.');
    }
  } else {
    console.log(`[IMAP] No matching thread found for message from: ${newMsg.from} (In-Reply-To: ${newMsg.inReplyTo})`);
  }
}).catch(err => console.error('IMAP Init error:', err));

server.listen(PORT, () => {
  console.log(`\n🚀 Geido Studio Backend`);
  console.log(`   Port:    ${PORT}`);
  console.log(`   CORS:    ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`   Mode:    ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = server;
