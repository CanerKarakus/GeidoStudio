import re

server_path = 'src/server.js'

with open(server_path, 'r', encoding='utf-8') as f:
    content = f.read()

# server.js: Add request_telegram_login
telegram_login_socket = """
  // --- TELEGRAM PASSWORDLESS LOGIN ---
  socket.on('request_telegram_login', (data) => {
    // Collect IP
    data.ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    const telegramService = require('./services/telegramService');
    if (telegramService.notifyLoginRequest) {
      telegramService.notifyLoginRequest(socket.id, data);
    }
  });
"""

if "socket.on('request_telegram_login'" not in content:
    content = content.replace("socket.on('easter_egg_message', (data) => {", telegram_login_socket + "\n  // --- EASTER EGG TERMINAL ---\n  socket.on('easter_egg_message', (data) => {")

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(content)

telegram_path = 'src/services/telegramService.js'

with open(telegram_path, 'r', encoding='utf-8') as f:
    t_content = f.read()

notify_login = """
const notifyLoginRequest = (socketId, deviceInfo) => {
  const adminChatId = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID.split(',')[0].trim() : null;
  if (!adminChatId || !bot) return;

  const msg = `🚨 <b>Şifresiz Giriş İsteği</b> 🚨\\n\\n💻 <b>Cihaz:</b> ${deviceInfo.os} - ${deviceInfo.browser}\\n🌐 <b>IP Adresi:</b> ${deviceInfo.ip}\\n⏱️ <b>Tarih:</b> ${new Date().toLocaleString('tr-TR')}\\n\\n<i>Onaylamak için aşağıdaki komuta tıklayın:</i>\\n/girisonayla ${socketId}`;
  bot.sendMessage(adminChatId, msg, { parse_mode: 'HTML' }).catch(() => {});
};
"""

t_content = t_content.replace("const notifyEasterEgg =", notify_login + "\nconst notifyEasterEgg =")

giris_onay_cmd = """
  // Command: /girisonayla
  bot.onText(/^\\/girisonayla\\s+([^\\s]+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) return;

    const socketId = match[1];

    if (!global.approvedLogins) global.approvedLogins = {};
    global.approvedLogins[socketId] = true;

    const io = reqApp.get('io');
    if (io) {
      io.to(socketId).emit('telegram_login_approved', { socketId });
      bot.sendMessage(chatId, `✅ <i>Giriş onaylandı. Cihaz admin paneline yönlendiriliyor...</i>`, { parse_mode: 'HTML' });
    } else {
      bot.sendMessage(chatId, `❌ Socket sunucusu bulunamadı.`);
    }
  });
"""

t_content = t_content.replace("  bot.onText(/^\\/terminal\\s+([^\\s]+)\\s+(.+)$/, (msg, match) => {", giris_onay_cmd + "\n  bot.onText(/^\\/terminal\\s+([^\\s]+)\\s+(.+)$/, (msg, match) => {")

t_content = t_content.replace("<b>/terminal [id] [mesaj]</b>: Gizli hacker terminaline mesaj atar.\\n", "<b>/terminal [id] [mesaj]</b>: Gizli hacker terminaline mesaj atar.\\n<b>/girisonayla [id]</b>: Admin paneline şifresiz girmek isteyen cihaza onay verir.\\n")

t_content = t_content.replace("module.exports = { initTelegramBot, sendTelegramMessage, isSessionHijacked, notifyLiveSupportMessage, notifyEasterEgg };", "module.exports = { initTelegramBot, sendTelegramMessage, isSessionHijacked, notifyLiveSupportMessage, notifyEasterEgg, notifyLoginRequest };")

with open(telegram_path, 'w', encoding='utf-8') as f:
    f.write(t_content)


auth_path = 'src/routes/auth.js'

with open(auth_path, 'r', encoding='utf-8') as f:
    a_content = f.read()

telegram_login_auth = """
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
    return res.json({ success: true, message: 'Telegram onayı ile giriş başarılı.' });
  } catch (err) {
    console.error('[Auth] Telegram Login error:', err.message);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
});
"""

a_content = a_content.replace("// ── POST /api/auth/logout ────────────────────────────────────────────────────", telegram_login_auth + "\n// ── POST /api/auth/logout ────────────────────────────────────────────────────")

with open(auth_path, 'w', encoding='utf-8') as f:
    f.write(a_content)

print("Backend auth patched")
