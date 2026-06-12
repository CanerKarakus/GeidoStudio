import re

server_path = 'src/server.js'

with open(server_path, 'r', encoding='utf-8') as f:
    content = f.read()

# server.js has io.on('connection')
# We need to inject socket.on('easter_egg_message')
easter_egg_socket = """
    // --- EASTER EGG TERMINAL ---
    socket.on('easter_egg_message', (data) => {
      console.log(`[EasterEgg] Socket ${socket.id} sent message: ${data.text}`);
      telegramService.notifyEasterEgg(socket.id, data.text);
    });
"""

# Let's insert it inside io.on('connection', (socket) => { ... })
# Find the end of `socket.on('disconnect', () => { ... })` and insert there
if "socket.on('disconnect', () => {" in content:
    content = content.replace("socket.on('disconnect', () => {", easter_egg_socket + "\n    socket.on('disconnect', () => {")

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(content)

telegram_path = 'src/services/telegramService.js'

with open(telegram_path, 'r', encoding='utf-8') as f:
    t_content = f.read()

easter_egg_telegram = """
const notifyEasterEgg = (socketId, userMsg) => {
  const adminChatId = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID.split(',')[0].trim() : null;
  if (!adminChatId || !bot) return;

  const msg = `🚨 <b>Gizli Terminal Bulundu!</b>\\n\\n👤 <b>Ziyaretçi:</b> ${userMsg}\\n\\n<i>Cevap vermek için:\\n/terminal ${socketId} [Cevabınız]</i>`;
  bot.sendMessage(adminChatId, msg, { parse_mode: 'HTML' }).catch(() => {});
};
"""

t_content = t_content.replace("const notifyLiveSupportMessage = (sessionId, userContext, userMsg, aiMsg) => {", easter_egg_telegram + "\nconst notifyLiveSupportMessage = (sessionId, userContext, userMsg, aiMsg) => {")

terminal_cmd = """
  // Command: /terminal
  bot.onText(/^\\/terminal\\s+([^\\s]+)\\s+(.+)$/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) return;

    const socketId = match[1];
    const text = match[2];

    const io = reqApp.get('io');
    if (io) {
      io.to(socketId).emit('easter_egg_response', { text });
      bot.sendMessage(chatId, `✅ <i>Mesajınız terminale iletildi.</i>`, { parse_mode: 'HTML' });
    } else {
      bot.sendMessage(chatId, `❌ Socket sunucusu bulunamadı.`);
    }
  });
"""

t_content = t_content.replace("  bot.onText(/^\\/help/, (msg, match) => {", terminal_cmd + "\n  bot.onText(/^\\/help/, (msg, match) => {")

# Add to /help
t_content = t_content.replace("<b>/sifresil [isim]</b>: Müşterinin tüm şifrelerini kalıcı olarak kasadan siler.\n", "<b>/sifresil [isim]</b>: Müşterinin tüm şifrelerini kalıcı olarak kasadan siler.\n<b>/terminal [id] [mesaj]</b>: Gizli hacker terminaline mesaj atar.\n")

# Update module.exports
t_content = t_content.replace("module.exports = { initTelegramBot, sendTelegramMessage, isSessionHijacked, notifyLiveSupportMessage };", "module.exports = { initTelegramBot, sendTelegramMessage, isSessionHijacked, notifyLiveSupportMessage, notifyEasterEgg };")

with open(telegram_path, 'w', encoding='utf-8') as f:
    f.write(t_content)

print("Backend patched")
