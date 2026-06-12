import re

file_path = 'src/services/telegramService.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add hijacked state and exports
state_code = """
const activeHijackedChats = new Set();
let adminCurrentSupportSession = null; // Store which session the admin is currently focusing on

const isSessionHijacked = (sessionId) => activeHijackedChats.has(sessionId);

const notifyLiveSupportMessage = (sessionId, userContext, userMsg, aiMsg) => {
  const adminChatId = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID.split(',')[0].trim() : null;
  if (!adminChatId || !bot) return;

  const userInfo = userContext ? `${userContext.name} (${userContext.email})` : 'Bilinmeyen Kullanıcı';
  
  let msg = `💬 <b>Canlı Destek (#${sessionId})</b>\\n👤 ${userInfo}\\n\\n🗣️ <b>Müşteri:</b> ${userMsg}`;
  
  if (aiMsg) {
    msg += `\\n🤖 <b>AI:</b> ${aiMsg}`;
  } else {
    msg += `\\n🚨 <i>AI Susturuldu (Siz Bağlısınız)</i>`;
  }
  
  msg += `\\n\\n<i>Bu sohbete bağlanmak için: /canlidestekbaglan ${sessionId}</i>`;
  
  bot.sendMessage(adminChatId, msg, { parse_mode: 'HTML' }).catch(() => {});
};
"""

content = content.replace("let bot;", "let bot;\n" + state_code)

# 2. Add Commands
commands_code = """
  // Command: /canlidestekbaglan
  bot.onText(/^\\/canlidestekbaglan(?:\\s+(.+))?$/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) return;

    const sessionId = match[1];
    if (!sessionId) {
      return bot.sendMessage(chatId, `Lütfen bir ID girin. Örn: /canlidestekbaglan A7B9X`);
    }

    activeHijackedChats.add(sessionId);
    adminCurrentSupportSession = sessionId;
    
    // Broadcast to socket
    const io = reqApp.get('io');
    if (io) {
      io.to(sessionId).emit('support_chat_hijacked');
    }

    bot.sendMessage(chatId, `🔌 <b>Sisteme Bağlanıldı! (#${sessionId})</b>\\n\\nŞu andan itibaren yapay zeka bu kullanıcıya cevap vermeyecek. Buraya yazdığınız her mesaj DOĞRUDAN müşterinin canlı destek ekranına gidecek.\\n\\nAyrılmak için: /canlidestekayril`, { parse_mode: 'HTML' });
  });

  // Command: /canlidestekayril
  bot.onText(/^\\/canlidestekayril$/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) return;

    if (!adminCurrentSupportSession) {
      return bot.sendMessage(chatId, `Şu an aktif olarak bağlandığınız bir canlı destek sohbeti yok.`);
    }

    const sessionId = adminCurrentSupportSession;
    activeHijackedChats.delete(sessionId);
    adminCurrentSupportSession = null;

    // Broadcast to socket
    const io = reqApp.get('io');
    if (io) {
      io.to(sessionId).emit('support_chat_released');
    }

    bot.sendMessage(chatId, `🔌 <b>Sohbetten Ayrıldınız. (#${sessionId})</b>\\n\\nYapay zeka kontrolü geri aldı.`, { parse_mode: 'HTML' });
  });
"""

# We need a reference to `app` to get `io`. `initTelegramBot` receives `app, io`.
# Let's save `app` to a variable inside `telegramService.js`.
content = content.replace("function initTelegramBot(app, io) {", "let reqApp = null;\nfunction initTelegramBot(app, io) {\n  reqApp = app;")

# Inject commands before /rapor
content = content.replace("  // Command: /rapor", commands_code + "\n  // Command: /rapor")

# 3. Handle Admin Text Messages for Hijacked Session
admin_msg_code = """
    if (adminCurrentSupportSession && msg.text && !msg.text.startsWith('/')) {
      const io = reqApp.get('io');
      if (io) {
        io.to(adminCurrentSupportSession).emit('support_chat_message', { text: msg.text });
        bot.sendMessage(chatId, `✅ <i>Mesajınız #${adminCurrentSupportSession} kullanıcısına iletildi.</i>`, { parse_mode: 'HTML' });
      } else {
        bot.sendMessage(chatId, `❌ Socket bulunamadı.`);
      }
      return; // Stop AI chat execution
    }
"""

# Inject inside `bot.on('message', async (msg) => {` right after `if (!isAuthorized(msg)) return;`
content = content.replace("    let sessions = readSessions();", "    let sessions = readSessions();\n" + admin_msg_code)

# 4. Export functions
content = content.replace("module.exports = { initTelegramBot, sendTelegramMessage };", "module.exports = { initTelegramBot, sendTelegramMessage, isSessionHijacked, notifyLiveSupportMessage };")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Telegram hijacker patched")
