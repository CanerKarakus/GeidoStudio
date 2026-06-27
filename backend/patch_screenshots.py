import os

file_path = 'src/services/telegramService.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace sendScreenshotToTelegram
old_ss1 = """const sendScreenshotToTelegram = async (adminChatId, base64Data, sessionId) => {
  try {
    const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
    await bot.sendPhoto(adminChatId, buffer, { caption: `📸 #${sessionId} Kullanıcısının Anlık Ekran Görüntüsü` });
  } catch (err) {
    console.error('Screenshot send error', err);
    bot.sendMessage(adminChatId, `❌ Ekran görüntüsü iletilemedi: ${err.message}`);
  }
};"""

new_ss1 = """const sendScreenshotToTelegram = async (adminChatId, base64Data, sessionId) => {
  try {
    const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
    const adminChatIds = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID.split(',').map(id => id.trim()) : [adminChatId];
    for (const id of adminChatIds) {
      await bot.sendPhoto(id, buffer, { caption: `📸 #${sessionId} Kullanıcısının Anlık Ekran Görüntüsü` }).catch(() => {});
    }
  } catch (err) {
    console.error('Screenshot send error', err);
  }
};"""

# Replace notifyScreenshotRejected
old_ss2 = """const notifyScreenshotRejected = (adminChatId, sessionId) => {
  try {
    bot.sendMessage(adminChatId, `❌ <b>Ekran Görüntüsü Reddedildi! (#${sessionId})</b>\\n\\nZiyaretçi ekran görüntüsü talebine izin vermedi.`, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('Screenshot reject notify error', err);
  }
};"""

new_ss2 = """const notifyScreenshotRejected = (adminChatId, sessionId) => {
  try {
    const adminChatIds = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID.split(',').map(id => id.trim()) : [adminChatId];
    adminChatIds.forEach(id => bot.sendMessage(id, `❌ <b>Ekran Görüntüsü Reddedildi! (#${sessionId})</b>\\n\\nZiyaretçi ekran görüntüsü talebine izin vermedi.`, { parse_mode: 'HTML' }).catch(() => {}));
  } catch (err) {
    console.error('Screenshot reject notify error', err);
  }
};"""

content = content.replace(old_ss1, new_ss1)
content = content.replace(old_ss2, new_ss2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Screenshots patched.")
