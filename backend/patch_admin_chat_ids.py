import os
import re

file_path = 'src/services/telegramService.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded [0] with map
pattern1 = r"const adminChatId = process\.env\.TELEGRAM_CHAT_ID \? process\.env\.TELEGRAM_CHAT_ID\.split\(\',\', 1\)?\[0\]\.trim\(\) : null;"
pattern2 = r"const adminChatId = process\.env\.TELEGRAM_CHAT_ID \? process\.env\.TELEGRAM_CHAT_ID\.split\(\',\'\)\[0\]\.trim\(\) : null;"

content = re.sub(pattern1, "const adminChatIds = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID.split(',').map(id => id.trim()) : [];", content)
content = re.sub(pattern2, "const adminChatIds = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID.split(',').map(id => id.trim()) : [];", content)

# Replace if (!adminChatId || !bot) return;
content = content.replace("if (!adminChatId || !bot) return;", "if (adminChatIds.length === 0 || !bot) return;")

# Replace bot.sendMessage(adminChatId, ...) with loops
# We need to use regex because the lines vary.
# Actually, the simplest way is to create an alias for the bot functions inside those blocks, 
# but it's easier to just find bot.sendMessage(adminChatId and replace it with adminChatIds.forEach(id => bot.sendMessage(id

content = content.replace("bot.sendMessage(adminChatId, msg, { parse_mode: 'HTML' }).catch(() => {});", "adminChatIds.forEach(id => bot.sendMessage(id, msg, { parse_mode: 'HTML' }).catch(() => {}));")
content = content.replace("bot.sendMessage(adminChatId, `🟢 <b>Admin Paneline Başarıyla Giriş Yapıldı!</b>\\nIP: ${ip}`, { parse_mode: 'HTML' }).catch(() => {});", "adminChatIds.forEach(id => bot.sendMessage(id, `🟢 <b>Admin Paneline Başarıyla Giriş Yapıldı!</b>\\nIP: ${ip}`, { parse_mode: 'HTML' }).catch(() => {}));")
content = content.replace("bot.sendVoice(adminChatId, fs.createReadStream(audioFilePath), {", "adminChatIds.forEach(id => bot.sendVoice(id, fs.createReadStream(audioFilePath), {")
content = content.replace("bot.sendMessage(adminChatId, msgText, { parse_mode: 'HTML' }).then(sentMsg => {", "adminChatIds.forEach(id => bot.sendMessage(id, msgText, { parse_mode: 'HTML' }).then(sentMsg => {")
content = content.replace("bot.pinChatMessage(adminChatId, sentMsg.message_id, { disable_notification: false }).catch(() => {});", "bot.pinChatMessage(id, sentMsg.message_id, { disable_notification: false }).catch(() => {});")
content = content.replace("bot.sendMessage(adminChatId, `🔔 [${userName}] acil canlı destek bekliyor!`).catch(() => {});", "adminChatIds.forEach(id => bot.sendMessage(id, `🔔 [${userName}] acil canlı destek bekliyor!`).catch(() => {}));")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied.")
