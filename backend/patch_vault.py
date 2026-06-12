import re
import os

file_path = 'src/services/telegramService.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

vault_code = """
// ── VAULT / ENCRYPTION SYSTEM ──────────────────────────────────────────────
const VAULT_FILE = path.join(__dirname, '../../data/vault.json');

// Generate a 32-byte key from the telegram token
const getVaultKey = () => crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();

const readVault = () => {
  try {
    if (!fs.existsSync(VAULT_FILE)) return [];
    return JSON.parse(fs.readFileSync(VAULT_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeVault = (data) => {
  try {
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Vault write error', e);
  }
};

const encryptText = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getVaultKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), data: encrypted };
};

const decryptText = (encryptedData) => {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', getVaultKey(), Buffer.from(encryptedData.iv, 'hex'));
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return "[Şifre Çözülemedi]";
  }
};
"""

# Inject vault code right after `writeSessions`
content = content.replace("  } catch (e) {\n    console.error('Session write error', e);\n  }\n};\n", "  } catch (e) {\n    console.error('Session write error', e);\n  }\n};\n\n" + vault_code)

vault_commands = """
  // Command: /sifreekle
  bot.onText(/^\\/sifreekle\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+(.+)$/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) return;

    const name = match[1].toLowerCase();
    const technology = match[2];
    const username = match[3];
    const password = match[4];

    const vault = readVault();
    const encryptedPassword = encryptText(password);

    vault.push({
      id: Date.now().toString(),
      name,
      technology,
      username,
      encryptedPassword
    });

    writeVault(vault);
    bot.sendMessage(chatId, `🔐 <b>Başarılı!</b>\\n\\n<b>${name}</b> isimli müşteri için <b>${technology}</b> şifresi şifrelenerek kasaya eklendi.`, { parse_mode: 'HTML' });
  });

  // Command: /sifre
  bot.onText(/^\\/sifre(?:\\s+(.+))?$/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) return;

    const query = match[1] ? match[1].toLowerCase() : null;
    const vault = readVault();

    if (vault.length === 0) {
      return bot.sendMessage(chatId, `📭 Kasanız şu an boş.`);
    }

    const results = query ? vault.filter(v => v.name.includes(query)) : vault;

    if (results.length === 0) {
      return bot.sendMessage(chatId, `❌ "${query}" ismine ait şifre bulunamadı.`);
    }

    let response = `🔐 <b>Müşteri Şifre Kasası:</b>\\n\\n`;
    results.forEach(v => {
      const decryptedPassword = decryptText(v.encryptedPassword);
      response += `👤 <b>${v.name.toUpperCase()}</b> | ${v.technology}\\nKullanıcı: <code>${v.username}</code>\\nŞifre: <span class="tg-spoiler"><code>${decryptedPassword}</code></span>\\n\\n`;
    });

    response += `<i>Silmek için: /sifresil [isim]</i>`;
    bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
  });

  // Command: /sifresil
  bot.onText(/^\\/sifresil(?:\\s+(.+))?$/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) return;

    const name = match[1] ? match[1].toLowerCase() : null;
    if (!name) return bot.sendMessage(chatId, `❌ Lütfen silmek istediğiniz müşterinin tam ismini girin. Örn: /sifresil ahmet`);

    let vault = readVault();
    const initialLength = vault.length;
    vault = vault.filter(v => v.name !== name);

    if (vault.length === initialLength) {
      return bot.sendMessage(chatId, `❌ "${name}" ismine ait silinecek şifre bulunamadı.`);
    }

    writeVault(vault);
    bot.sendMessage(chatId, `🗑️ <b>${name}</b> isimli müşteriye ait ${initialLength - vault.length} adet şifre kasadan kalıcı olarak silindi.`, { parse_mode: 'HTML' });
  });
"""

# Inject commands before /help
content = content.replace("  bot.onText(/^\\/help/, (msg, match) => {", vault_commands + "\n  bot.onText(/^\\/help/, (msg, match) => {")

# Add to /help
help_addition = """<b>/sifreekle [isim] [teknoloji] [kullanıcı] [şifre]</b>: Yeni bir müşteri şifresi şifreleyerek kaydeder.
<b>/sifre [isim]</b>: Belirtilen isme sahip müşterinin çözülmüş şifrelerini gösterir.
<b>/sifresil [isim]</b>: Müşterinin tüm şifrelerini kalıcı olarak kasadan siler.
"""
content = content.replace("<b>/canlidestekayril</b>: Canlı destek sohbetini terk edip kontrolü tekrar AI asistanına bırakır.\n", "<b>/canlidestekayril</b>: Canlı destek sohbetini terk edip kontrolü tekrar AI asistanına bırakır.\n" + help_addition)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied")
