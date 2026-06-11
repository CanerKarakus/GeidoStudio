import re
import sys

file_path = "src/services/telegramService.js"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update global variable and authorization logic
auth_old = r"const chatId = process\.env\.TELEGRAM_CHAT_ID;\n\s*if \(!token \|\| \!chatId\) \{\n\s*console\.warn\('\[TelegramService\] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing\.'\);\n\s*return;\n\s*\}"
auth_new = """const allowedChatIds = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID.split(',').map(id => id.trim()) : [];
  if (!token || allowedChatIds.length === 0) {
    console.warn('[TelegramService] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing.');
    return;
  }"""
content = re.sub(auth_old, auth_new, content)

content = re.sub(r"const isAuthorized = \(msg\) => msg\.chat\.id\.toString\(\) === chatId;", r"const isAuthorized = (msg) => allowedChatIds.includes(msg.chat.id.toString());", content)

# 2. Fix scheduleDailyReport
daily_old = r"if \(cms\.settings && cms\.settings\.dailyReport\) \{\n\s*scheduleDailyReport\(chatId\);\n\s*\}"
daily_new = """if (cms.settings && cms.settings.dailyReport) {
    allowedChatIds.forEach(id => scheduleDailyReport(id));
  }"""
content = re.sub(daily_old, daily_new, content)

# 3. Replace chatId with msg.chat.id in bot.onText blocks
# We only want to replace chatId with msg.chat.id inside bot.onText(...) or bot.onCallbackQuery(...)
# Since bot.on('message', ...) has `const chatId = msg.chat.id;`, it's safe there.
# Let's inject `const chatId = msg.chat.id;` at the beginning of EVERY bot.onText and bot.on('callback_query') handler.
# This way we don't have to replace `chatId` with `msg.chat.id` everywhere.

# Find all instances of bot.onText(..., (msg, match) => {
content = re.sub(r'bot\.onText\((.+?),\s*\(msg(?:,\s*match)?\)\s*=>\s*\{', r'bot.onText(\1, (msg, match) => {\n    const chatId = msg.chat.id;', content)
# We need to make sure the regex correctly replaced it. We already have `const chatId = msg.chat.id` inside /seslimail and /dekupe if I put it there?
# Oh wait, my previous patch:
# bot.onText(/^\/dekupe$/, (msg) => {
#    if (!isAuthorized(msg)) return;
#    let sessions = readSessions();
#    const chatId = msg.chat.id;

# Let's just do a clean regex:
# If there is `const chatId = msg.chat.id;` already, we don't want duplicates.
# Let's remove any existing `const chatId = msg.chat.id;` in the first 5 lines of the function block just to be safe.
# Actually, the safest way is to replace all `bot.sendMessage(chatId,` with `bot.sendMessage(msg.chat.id,` ONLY if we are NOT inside `bot.on('message'`.
# Since `chatId` is no longer defined globally, ANY unresolved `chatId` will crash. So we must inject `const chatId = msg.chat.id;`.

def inject_chat_id(match):
    args = match.group(1) # e.g. /^\/ss/
    func_args = match.group(2) # e.g. msg, match
    return f"bot.onText({args}, ({func_args}) => {{\n    const chatId = msg.chat.id;\n"

content = re.sub(r'bot\.onText\((.+?),\s*\((msg|msg,\s*match)\)\s*=>\s*\{\n(?:.*?const chatId = msg\.chat\.id;\n)?', inject_chat_id, content)


# 4. Fix sendTelegramMessage at the bottom of the file
send_old = r"""async function sendTelegramMessage\(text\) \{
\s*const token = process\.env\.TELEGRAM_BOT_TOKEN;
\s*const chatId = process\.env\.TELEGRAM_CHAT_ID;
\s*if \(\!token \|\| \!chatId\) return;

\s*try \{
\s*if \(bot\) \{
\s*await bot\.sendMessage\(chatId, text, \{ parse_mode: 'HTML', disable_web_page_preview: true \}\);
\s*\} else \{
\s*const tempBot = new TelegramBot\(token, \{ polling: false \}\);
\s*await tempBot\.sendMessage\(chatId, text, \{ parse_mode: 'HTML', disable_web_page_preview: true \}\);
\s*\}
\s*\} catch \(err\) \{
\s*console\.error\('\[TelegramService\] Error sending message:', err\);
\s*\}
\}"""

send_new = """async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID.split(',').map(id => id.trim()) : [];
  if (!token || chatIds.length === 0) return;

  try {
    const activeBot = bot || new TelegramBot(token, { polling: false });
    for (const id of chatIds) {
      await activeBot.sendMessage(id, text, { parse_mode: 'HTML', disable_web_page_preview: true }).catch(console.error);
    }
  } catch (err) {
    console.error('[TelegramService] Error sending message:', err);
  }
}"""

content = re.sub(send_old, send_new, content)

with open(file_path, "w") as f:
    f.write(content)

print("Multi-admin patch applied!")
