const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

const NEWSLETTER_FILE = path.join(__dirname, '../../data/newsletter.json');

const readSubscribers = () => {
  try {
    if (!fs.existsSync(NEWSLETTER_FILE)) return [];
    return JSON.parse(fs.readFileSync(NEWSLETTER_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeSubscribers = (data) => {
  fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(data, null, 2), 'utf8');
};

const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({ error: 'Çok fazla abonelik denemesi yaptınız. Lütfen 1 saat sonra tekrar deneyin.' });
  }
});

// POST /api/newsletter
router.post('/', subscribeLimiter, (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz.' });
    }

    const subscribers = readSubscribers();

    // Check if already subscribed
    if (subscribers.some(sub => sub.email === email.trim())) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten bültene kayıtlı.' });
    }

    const newSubscriber = {
      id: uuidv4(),
      email: email.trim().slice(0, 200),
      date: new Date().toISOString(),
    };

    subscribers.unshift(newSubscriber);
    writeSubscribers(subscribers);

    return res.status(201).json({ success: true, message: 'Bültene başarıyla abone oldunuz.' });
  } catch (err) {
    console.error('[Newsletter] Subscribe error:', err.message);
    return res.status(500).json({ error: 'Abonelik işlemi başarısız oldu.' });
  }
});

// POST /api/newsletter/unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-posta gerekli.' });
    }

    const subscribers = readSubscribers();
    const filtered = subscribers.filter(s => s.email !== email);

    if (filtered.length === subscribers.length) {
      return res.json({ success: true, message: 'Bu e-posta zaten abonelikten çıkmış veya bulunamadı.' });
    }

    writeSubscribers(filtered);

    const htmlMessage = `<p>Merhaba,</p><p><b>${email}</b> adresli e-postanız bülten listemizden başarıyla çıkarılmıştır.</p><p>Eğer fikrinizi değiştirirseniz web sitemizden tekrar kayıt olabilirsiniz.</p>`;
    await sendEmail(email, 'Abonelikten Ayrıldınız - Geido Studio', 'Bülten aboneliğinden ayrıldınız.', htmlMessage).catch(err => console.error(err));

    return res.json({ success: true, message: 'Başarıyla abonelikten çıkıldı.' });
  } catch (err) {
    console.error('[Newsletter] Unsubscribe error:', err.message);
    return res.status(500).json({ error: 'Abonelikten çıkılamadı.' });
  }
});

// GET /api/newsletter
router.get('/', authMiddleware, (req, res) => {
  const subscribers = readSubscribers();
  return res.json(subscribers);
});

// POST /api/newsletter/send
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Konu ve mesaj alanları zorunludur.' });
    }

    const subscribers = readSubscribers();
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'Hiç abone bulunamadı.' });
    }

    const htmlMessage = message.replace(/\n/g, '<br/>');

    // Send emails sequentially to avoid spamming the SMTP server or being flagged immediately
    for (const sub of subscribers) {
      await sendEmail(
        sub.email,
        subject,
        message,
        htmlMessage
      ).catch(err => console.error(`Bülten ${sub.email} adresine gönderilemedi:`, err));
    }

    return res.json({ success: true, message: `${subscribers.length} kişiye başarıyla gönderildi.` });
  } catch (err) {
    console.error('[Newsletter] Broadcast error:', err.message);
    return res.status(500).json({ error: 'Toplu e-posta gönderilirken bir hata oluştu.' });
  }
});

// DELETE /api/newsletter/:id
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Geçersiz abone ID.' });
    }

    const subscribers = readSubscribers();
    const filtered = subscribers.filter(s => s.id !== id);

    if (filtered.length === subscribers.length) {
      return res.status(404).json({ error: 'Abone bulunamadı.' });
    }

    writeSubscribers(filtered);
    return res.json({ success: true });
  } catch (err) {
    console.error('[Newsletter] Delete error:', err.message);
    return res.status(500).json({ error: 'Abone silinemedi.' });
  }
});

module.exports = router;
