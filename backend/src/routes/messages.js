/**
 * Messages Routes — all protected by JWT middleware
 * POST /api/messages        - Public: submit contact form
 * GET  /api/messages        - Admin only: get all messages
 * DELETE /api/messages/:id  - Admin only: delete message
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const MESSAGES_FILE = path.join(__dirname, '../../data/messages.json');

const readMessages = () => {
  try {
    if (!fs.existsSync(MESSAGES_FILE)) return [];
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeMessages = (data) => {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Rate limit: max 5 contact form submissions per hour per IP
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  handler: (req, res) => {
    res.status(429).json({ error: 'Çok fazla mesaj gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.' });
  }
});

// ── POST /api/messages ───────────────────────────────────────────────────────
// Public: anyone can submit contact form
router.post('/', submitLimiter, (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Geçerli bir isim giriniz.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({ error: 'Mesaj en az 5 karakter olmalıdır.' });
    }

    const newMessage = {
      id: uuidv4(),
      name: name.trim().slice(0, 100),
      email: email.trim().slice(0, 200),
      phone: phone ? phone.trim().slice(0, 30) : '',
      subject: subject ? subject.trim().slice(0, 200) : '',
      message: message.trim().slice(0, 2000),
      date: new Date().toISOString(),
    };

    const messages = readMessages();
    messages.unshift(newMessage);
    writeMessages(messages);

    return res.status(201).json({ success: true, message: 'Mesajınız gönderildi.' });
  } catch (err) {
    console.error('[Messages] Submit error:', err.message);
    return res.status(500).json({ error: 'Mesaj gönderilemedi.' });
  }
});

// ── GET /api/messages ────────────────────────────────────────────────────────
// Admin only
router.get('/', authMiddleware, (req, res) => {
  const messages = readMessages();
  return res.json(messages);
});

// ── DELETE /api/messages/:id ─────────────────────────────────────────────────
// Admin only
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Geçersiz mesaj ID.' });
    }

    const messages = readMessages();
    const filtered = messages.filter(m => m.id !== id);

    if (filtered.length === messages.length) {
      return res.status(404).json({ error: 'Mesaj bulunamadı.' });
    }

    writeMessages(filtered);
    return res.json({ success: true });
  } catch (err) {
    console.error('[Messages] Delete error:', err.message);
    return res.status(500).json({ error: 'Mesaj silinemedi.' });
  }
});

module.exports = router;
