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
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:', 'http://localhost:*', 'http://127.0.0.1:*'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const FRONTEND_URLS = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : [];

const ALLOWED_ORIGINS = [
  ...FRONTEND_URLS,
  'http://localhost:5173',  // Local dev
  'http://localhost:4173',  // Vite preview
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Dinamik olarak gelen tüm adresleri kabul et (Wildcard gibi ama credentials ile uyumlu)
    callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// ── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));  // CMS data can be large (blogs, images)
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ── Static Files (Uploads) ──────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Trust proxy (needed if behind Nginx/cPanel proxy) ───────────────────────
app.set('trust proxy', 1);

// ── IP Blocking Middleware (Honeypot) ──────────────────────────────────────
// ── IP Blocking Middleware (Honeypot) ──────────────────────────────────────
const fs = require('fs');
const cmsPath = path.join(__dirname, '../../data/cms.json');

const readCMS = () => {
  try {
    if (fs.existsSync(cmsPath)) {
      return JSON.parse(fs.readFileSync(cmsPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading cms.json', err);
  }
  return {};
};

const writeCMS = (data) => {
  try {
    fs.writeFileSync(cmsPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing cms.json', err);
  }
};

const { sendTelegramMessage } = require('./services/telegramService');

app.use((req, res, next) => {
  try {
    const cms = readCMS();
    const blockedIPs = cms?.settings?.blockedIPs || [];
    let clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (typeof clientIP === 'string') {
      clientIP = clientIP.split(',')[0].trim();
    }
    
    if (blockedIPs.includes(clientIP)) {
      return res.status(403).send('Access Denied');
    }
  } catch(e) {}
  next();
});

// ── Honeypot Route ────────────────────────────────────────────────────────
app.post('/api/honeypot', (req, res) => {
  try {
    const cms = readCMS();
    if (!cms?.settings?.honeypotEnabled) return res.status(404).send('Not found');
    
    let clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (typeof clientIP === 'string') {
      clientIP = clientIP.split(',')[0].trim();
    }

    if (!cms.settings.blockedIPs) {
      cms.settings.blockedIPs = [];
    }

    if (!cms.settings.blockedIPs.includes(clientIP)) {
      cms.settings.blockedIPs.push(clientIP);
      writeCMS(cms);
      sendTelegramMessage(`🚨 <b>Hacker Kapanı Tetiklendi!</b>\n\nBirisi sahte /wp-admin paneline girmeye çalıştı.\nIP: ${clientIP}\nDurum: <b>KALICI OLARAK BANLANDI!</b>`);
    }
    res.json({ success: true });
  } catch(e) {
    res.status(500).send('Error');
  }
});


// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/cms',        require('./routes/cms'));
app.use('/api/database',   require('./routes/database'));
app.use('/api/analytics',  require('./routes/analytics'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/upload',     require('./routes/upload'));
app.use('/api/tracking',   require('./routes/tracking'));
app.use('/api/ai-chat',    require('./routes/ai-chat'));
app.use('/api/webhooks',   require('./routes/webhooks'));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const http = require('http');
const { Server } = require('socket.io');
const { initImap } = require('./services/emailService');
const { readMessages, writeMessages } = require('./models/messageModel');

const { initTelegramBot } = require('./services/telegramService');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true
  }
});

app.set('io', io);

// Initialize Telegram Interactive Bot
initTelegramBot(app, io);

io.on('connection', (socket) => {
  console.log('Client connected to socket:', socket.id);

  socket.on('join_support_chat', ({ sessionId, name, email }) => {
    socket.join(sessionId);
    console.log(`Live Support: User joined session room ${sessionId}`);
  });
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

server.listen(PORT, () => {
  console.log(`\n🚀 Geido Studio Backend`);
  console.log(`   Port:    ${PORT}`);
  console.log(`   CORS:    ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`   Mode:    ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = server;
