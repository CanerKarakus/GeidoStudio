import re

file_path = 'src/server.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject the blockedIPsMiddleware after the require statements
# We can inject it right after `const { readMessages, writeMessages } = require('./models/messageModel');`
# Wait, `const { readCMS, writeCMS } = require('./models/cmsModel');` is needed.

# Find a good spot for middleware: right after `app.set('trust proxy', 1);`
middleware_code = """// ── IP Blocking Middleware (Honeypot) ──────────────────────────────────────
const { readCMS, writeCMS } = require('./models/cmsModel');
const { sendTelegramMessage } = require('./services/telegramService');

app.use((req, res, next) => {
  try {
    const cms = readCMS();
    const blockedIPs = cms?.settings?.blockedIPs || [];
    let clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (typeof clientIP === 'string') {
      clientIP = clientIP.split(',')[0].trim();
    }
    
    if (blockedIPs.includes(clientIP)) {
      return res.status(403).send('Access Denied');
    }
  } catch(e) {}
  next();
});

// ── Honeypot Route ────────────────────────────────────────────────────────
app.post('/api/honeypot', (req, res) => {
  try {
    const cms = readCMS();
    if (!cms?.settings?.honeypotEnabled) return res.status(404).send('Not found');
    
    let clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (typeof clientIP === 'string') {
      clientIP = clientIP.split(',')[0].trim();
    }

    if (!cms.settings.blockedIPs) {
      cms.settings.blockedIPs = [];
    }

    if (!cms.settings.blockedIPs.includes(clientIP)) {
      cms.settings.blockedIPs.push(clientIP);
      writeCMS(cms);
      sendTelegramMessage(`🚨 <b>Hacker Kapanı Tetiklendi!</b>\\n\\nBirisi sahte /wp-admin paneline girmeye çalıştı.\\nIP: ${clientIP}\\nDurum: <b>KALICI OLARAK BANLANDI!</b>`);
    }
    res.json({ success: true });
  } catch(e) {
    res.status(500).send('Error');
  }
});
"""

content = content.replace("app.set('trust proxy', 1);", "app.set('trust proxy', 1);\n\n" + middleware_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Honeypot backend logic injected to server.js")
