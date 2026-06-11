/**
 * Messages Routes — all protected by JWT middleware
 * POST /api/messages        - Public: submit contact form
 * GET  /api/messages        - Admin only: get all messages
 * DELETE /api/messages/:id  - Admin only: delete message
 * POST /api/messages/:id/reply - Admin only: reply to message
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const { readMessages, writeMessages } = require('../models/messageModel');
const { sendEmail } = require('../services/emailService');
const { sendTelegramMessage } = require('../services/telegramService');
const fs = require('fs');
const path = require('path');

const CMS_FILE = path.join(__dirname, '../../data/cms.json');
const readCMS = () => {
  try {
    if (!fs.existsSync(CMS_FILE)) return {};
    return JSON.parse(fs.readFileSync(CMS_FILE, 'utf8'));
  } catch {
    return {};
  }
};

const router = express.Router();

// Rate limit: max 5 contact form submissions per hour per IP
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  handler: (req, res) => {
    res.status(429).json({ error: 'Çok fazla mesaj gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.' });
  }
});

// ── POST /api/messages ───────────────────────────────────────────────────────
// Public: anyone can submit contact form
router.post('/', submitLimiter, async (req, res) => {
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
      replies: [],
      // Deterministic Message-ID stored so IMAP can match In-Reply-To on user replies
      threadMessageId: `<geido-thread-${uuidv4()}@geidostudio.com>`
    };

    const messages = readMessages();
    messages.unshift(newMessage);
    writeMessages(messages);

    // Send auto-reply to user
    const cms = readCMS();
    const defaultSubject = 'Geido Studio - İletişim Formu Geri Dönüşü';
    const defaultText = `Merhaba ${newMessage.name},\n\nMesajınızı aldık. En kısa sürede size dönüş yapacağız.`;
    
    let autoReplySubject = cms.emailTemplates?.contactAutoReplySubject || defaultSubject;
    let autoReplyText = cms.emailTemplates?.contactAutoReplyBody || defaultText;
    
    // Replace dynamic variables if we want
    autoReplyText = autoReplyText.replace(/{username}/g, newMessage.name);

    const ticketUrl = `${process.env.FRONTEND_URL || 'https://geidostudio.com'}/ticket/${newMessage.id}`;
    
    const autoReplyHtml = `<div style="text-align:center;">
      <p style="margin-bottom:10px;">Merhaba <strong>${newMessage.name}</strong>,</p>
      <p style="background-color:#f9f9f9;padding:15px;border-radius:8px;display:inline-block;text-align:left;width:100%;max-width:400px;border:1px solid #eee;margin-bottom:20px;">${autoReplyText.replace(/\n/g, '<br/>')}</p>
      <p style="margin-bottom:25px;">
        <a href="${ticketUrl}" style="display:inline-block;padding:12px 24px;background-color:#b30000;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Mesajı Görüntüle ve Yanıtla</a>
      </p>
      <p>İyi günler dileriz,<br/><strong>Geido Studio Ekibi</strong></p>
    </div>`;
    
    // Attempt sending async (don't block response if fails)
    // threadMessageId is set as Message-ID header; user's reply will have In-Reply-To: <this id>
    sendEmail(newMessage.email, autoReplySubject, autoReplyText, autoReplyHtml, null, newMessage.threadMessageId).catch(err => {
      console.error('[Messages] Auto-reply send error:', err);
    });

    // Notify Admin (send to our mailbox info@geidostudio.com)
    const adminSubject = `Yeni İletişim Formu: ${newMessage.subject || 'Konu Yok'}`;
    const adminText = `Yeni mesaj:\n\nİsim: ${newMessage.name}\nE-posta: ${newMessage.email}\nTelefon: ${newMessage.phone}\n\nMesaj:\n${newMessage.message}`;
    const adminHtml = `<div style="text-align:center;">
      <p style="margin-bottom:15px;color:#b30000;"><strong>Yeni Form Mesajı</strong></p>
      <div style="display:inline-block;text-align:left;margin-bottom:20px;background-color:#f9f9f9;padding:20px;border-radius:8px;border:1px solid #eee;">
        <p style="margin-bottom:5px;"><strong>İsim:</strong> ${newMessage.name}</p>
        <p style="margin-bottom:5px;"><strong>E-posta:</strong> ${newMessage.email}</p>
        <p><strong>Telefon:</strong> ${newMessage.phone}</p>
      </div>
      <p style="margin-bottom:10px;"><strong>Mesaj İçeriği:</strong></p>
      <p style="background-color:#f9f9f9;padding:15px;border-radius:8px;display:inline-block;text-align:left;width:100%;max-width:400px;border:1px solid #eee;margin-bottom:10px;">${newMessage.message.replace(/\n/g, '<br/>')}</p>
    </div>`;
    sendEmail(process.env.SMTP_USER, adminSubject, adminText, adminHtml, newMessage.email).catch(err => {
      console.error('[Messages] Admin notification error:', err);
    });

    // Notify via Telegram
    const telegramMessage = `🚨 <b>Yeni İletişim Formu Dolduruldu!</b>\n\n👤 <b>İsim:</b> ${newMessage.name}\n📧 <b>E-posta:</b> ${newMessage.email}\n📞 <b>Telefon:</b> ${newMessage.phone || '-'}\n\n💬 <b>Mesaj:</b>\n<i>${newMessage.message}</i>\n\n🔗 <a href="${process.env.FRONTEND_URL || 'https://geidostudio.com'}/admin/messages">Admin Panele Git</a>`;
    sendTelegramMessage(telegramMessage).catch(err => {
      console.error('[Messages] Telegram notification error:', err);
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('messages_updated', messages);
    }

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
    
    const io = req.app.get('io');
    if (io) {
      io.emit('messages_updated', filtered);
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error('[Messages] Delete error:', err.message);
    return res.status(500).json({ error: 'Mesaj silinemedi.' });
  }
});

// ── POST /api/messages/:id/reply ─────────────────────────────────────────────
// Admin only
router.post('/:id/reply', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Yanıt metni boş olamaz.' });
    }

    const messages = readMessages();
    const targetIndex = messages.findIndex(m => m.id === id);
    
    if (targetIndex === -1) {
      return res.status(404).json({ error: 'Mesaj bulunamadı.' });
    }

    const thread = messages[targetIndex];
    thread.replies = thread.replies || [];
    
    const newReply = {
      id: uuidv4(),
      sender: 'admin',
      text: text.trim(),
      date: new Date().toISOString()
    };
    
    thread.replies.push(newReply);
    
    // Move to top since it was updated
    messages.splice(targetIndex, 1);
    messages.unshift(thread);
    writeMessages(messages);

    // Send email to user
    const ticketUrl = `${process.env.FRONTEND_URL || 'https://geidostudio.com'}/ticket/${thread.id}`;
    const replySubject = `Geido Studio - Yanıt: ${thread.subject || 'İletişim Formu'}`;
    const replyText = `Merhaba ${thread.name},\n\nMesajınıza bir yanıtımız var:\n\n${text}\n\nTüm konuşmayı görüntülemek için tıklayın: ${ticketUrl}\n\nİyi günler dileriz,\nGeido Studio Ekibi`;
    
    const replyHtml = `<div style="text-align:center;">
      <p style="margin-bottom:10px;">Merhaba <strong>${thread.name}</strong>,</p>
      <p style="margin-bottom:15px;">Mesajınıza bir yanıtımız var:</p>
      <p style="background-color:#f9f9f9;padding:15px;border-radius:8px;display:inline-block;text-align:left;width:100%;max-width:400px;border:1px solid #eee;margin-bottom:20px;">${text.trim().replace(/\n/g, '<br/>')}</p>
      <p style="margin-bottom:25px;">
        <a href="${ticketUrl}" style="display:inline-block;padding:12px 24px;background-color:#b30000;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Tüm Konuşmayı Görüntüle ve Yanıtla</a>
      </p>
      <p>İyi günler dileriz,<br/><strong>Geido Studio Ekibi</strong></p>
    </div>`;
    
    try {
      await sendEmail(thread.email, replySubject, replyText, replyHtml);
    } catch (emailErr) {
      console.error('[Messages] SMTP Send error for reply:', emailErr);
      // We continue despite email error to ensure chat is saved
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('new_reply', { threadId: thread.id, reply: newReply });
      io.emit('messages_updated', messages);
    }

    return res.status(201).json({ success: true, reply: newReply });
  } catch (err) {
    console.error('[Messages] Reply error:', err.message);
    return res.status(500).json({ error: 'Yanıt gönderilemedi.' });
  }
});

// ── GET /api/messages/ticket/:id ─────────────────────────────────────────────
// Public: view a specific ticket thread
router.get('/ticket/:id', (req, res) => {
  const { id } = req.params;
  const messages = readMessages();
  const thread = messages.find(m => m.id === id);
  if (!thread) {
    return res.status(404).json({ error: 'Bilet bulunamadı.' });
  }
  return res.json(thread);
});

// ── POST /api/messages/ticket/:id/reply ──────────────────────────────────────
// Public: user replies to ticket
router.post('/ticket/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Yanıt metni boş olamaz.' });
    }

    const messages = readMessages();
    const targetIndex = messages.findIndex(m => m.id === id);
    
    if (targetIndex === -1) {
      return res.status(404).json({ error: 'Bilet bulunamadı.' });
    }

    const thread = messages[targetIndex];
    thread.replies = thread.replies || [];
    
    const newReply = {
      id: uuidv4(),
      sender: 'user',
      text: text.trim(),
      date: new Date().toISOString()
    };
    
    thread.replies.push(newReply);
    
    // Move to top
    messages.splice(targetIndex, 1);
    messages.unshift(thread);
    writeMessages(messages);

    // Notify Admin via Email
    const adminSubject = `Yeni Kullanıcı Yanıtı: ${thread.subject || 'İletişim Formu'}`;
    const adminText = `Kullanıcı (${thread.name}) biletine yanıt verdi:\n\n${text.trim()}`;
    const adminHtml = `<div style="text-align:center;">
      <p style="margin-bottom:15px;"><strong>Kullanıcı (${thread.name}) yanıt verdi:</strong></p>
      <p style="background-color:#f9f9f9;padding:15px;border-radius:8px;display:inline-block;text-align:left;width:100%;max-width:400px;border:1px solid #eee;">${text.trim().replace(/\n/g, '<br/>')}</p>
    </div>`;
    
    try {
      await sendEmail(process.env.SMTP_USER, adminSubject, adminText, adminHtml, thread.email);
    } catch (err) {}

    // Notify via Telegram
    const telegramReplyMessage = `💬 <b>Yeni Bilet Yanıtı (Müşteri)</b>\n\n👤 <b>İsim:</b> ${thread.name}\n🔖 <b>Konu:</b> ${thread.subject || '-'}\n\n📝 <b>Yanıt:</b>\n<i>${text.trim()}</i>\n\n🔗 <a href="${process.env.FRONTEND_URL || 'https://geidostudio.com'}/admin/messages">Admin Panele Git</a>`;
    sendTelegramMessage(telegramReplyMessage).catch(err => {
      console.error('[Messages] Telegram reply notification error:', err);
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('new_reply', { threadId: thread.id, reply: newReply });
      io.emit('messages_updated', messages);
    }

    return res.status(201).json({ success: true, reply: newReply });
  } catch (err) {
    console.error('[Messages] User reply error:', err.message);
    return res.status(500).json({ error: 'Yanıt gönderilemedi.' });
  }
});

module.exports = router;
