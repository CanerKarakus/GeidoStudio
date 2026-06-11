import re
import sys

file_path = "src/services/telegramService.js"
with open(file_path, "r") as f:
    content = f.read()

# 1. Replace `const sessions = {};` with read/write logic
replacement_top = """const SESSIONS_FILE = path.join(__dirname, '../../data/sessions.json');

const readSessions = () => {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) return {};
    return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
  } catch {
    return {};
  }
};

const writeSessions = (data) => {
  try {
    const dir = path.dirname(SESSIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Session write error', e);
  }
};"""

content = content.replace("const sessions = {};", replacement_top)

# 2. Inside bot.on('message', ...) add let sessions = readSessions();
content = content.replace("  bot.on('message', async (msg) => {\n    if (!isAuthorized(msg)) return;\n\n    const chatId = msg.chat.id;", "  bot.on('message', async (msg) => {\n    if (!isAuthorized(msg)) return;\n\n    const chatId = msg.chat.id;\n    let sessions = readSessions();")

# 3. Replace all delete sessions[chatId]; with writeSessions(sessions);
content = content.replace("delete sessions[chatId]; // Clear session", "delete sessions[chatId]; writeSessions(sessions); // Clear session")
content = content.replace("      if (sessions[chatId]) delete sessions[chatId];\n      return; \n    }", "      if (sessions[chatId]) { delete sessions[chatId]; writeSessions(sessions); }\n      return; \n    }")

# Wait, there are multiple delete sessions[chatId]; let's do a regex sub for the ones inside try-catch.
content = re.sub(r'delete sessions\[chatId\];\n\s*return;', r'delete sessions[chatId];\n          writeSessions(sessions);\n          return;', content)
content = re.sub(r'delete sessions\[chatId\];\n\s*\}', r'delete sessions[chatId];\n          writeSessions(sessions);\n        }', content)

# 4. Awaiting email modification
content = content.replace("session.step = 'awaiting_voice';", "session.step = 'awaiting_voice';\n        writeSessions(sessions);")

# 5. Awaiting voice modification
content = content.replace("session.step = 'awaiting_approval';", "session.step = 'awaiting_approval';\n          writeSessions(sessions);")

# 6. Awaiting approval revision modification
content = content.replace("if (contentMatch) session.draftBody = contentMatch[1].trim();", "if (contentMatch) session.draftBody = contentMatch[1].trim();\n          writeSessions(sessions);")

# 7. /seslimail command
content = re.sub(r'bot.onText\(\/^\/seslimail\/, \(msg\) => \{\n\s*if \(\!isAuthorized\(msg\)\) return;\n\s*sessions\[msg.chat.id\] = \{ command: \'seslimail\', step: \'awaiting_email\' \};', r"bot.onText(/^\\/seslimail/, (msg) => {\n    if (!isAuthorized(msg)) return;\n    let sessions = readSessions();\n    sessions[msg.chat.id] = { command: 'seslimail', step: 'awaiting_email' };\n    writeSessions(sessions);", content)

# 8. /dekupe command
content = re.sub(r'bot.onText\(\/^\/dekupe\/, \(msg\) => \{\n\s*if \(\!isAuthorized\(msg\)\) return;\n\s*sessions\[msg.chat.id\] = \{ command: \'dekupe\', step: \'awaiting_photo\' \};', r"bot.onText(/^\\/dekupe/, (msg) => {\n    if (!isAuthorized(msg)) return;\n    let sessions = readSessions();\n    sessions[msg.chat.id] = { command: 'dekupe', step: 'awaiting_photo' };\n    writeSessions(sessions);", content)


with open(file_path, "w") as f:
    f.write(content)

print("Patched!")
