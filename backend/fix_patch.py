import re

file_path = 'src/services/telegramService.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

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

content = content.replace("let bot = null;", "let bot = null;\n" + state_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed telegramService.js")
