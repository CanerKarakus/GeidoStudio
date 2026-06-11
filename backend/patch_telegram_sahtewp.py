import re

file_path = 'src/services/telegramService.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

sahtewp_command = """  // Command: /sahtewp
  bot.onText(/^\\/sahtewp$/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) return;

    const cms = readCMS();
    if (!cms.settings) cms.settings = {};
    
    cms.settings.honeypotEnabled = !cms.settings.honeypotEnabled;
    writeCMS(cms);

    const status = cms.settings.honeypotEnabled ? 'AÇIK (Aktif)' : 'KAPALI (Pasif)';
    bot.sendMessage(chatId, `🚨 <b>Hacker Kapanı (/wp-admin) ${status}</b>\\n\\nSistemi yayına almak için Netlify derlemesi başlatılıyor...`, { parse_mode: 'HTML' });
    triggerNetlifyBuild(chatId, `✅ <b>Hacker Kapanı Yayında!</b> Artık /wp-admin adresine girenler otomatik banlanacak.`);
  });
"""

# Inject after `/bakim` command
content = content.replace("  // Command: /rapor", sahtewp_command + "\n  // Command: /rapor")

# Also add to help message
content = content.replace("<b>/bakim</b>: Sitenin bakım modunu açar/kapatır ve anında Netlify'ı tetikler.", "<b>/bakim</b>: Sitenin bakım modunu açar/kapatır ve anında Netlify'ı tetikler.\n<b>/sahtewp</b>: Hacker kapanını açar/kapatır (Sahte wp-admin sayfası oluşturur).")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("sahtewp command added")
