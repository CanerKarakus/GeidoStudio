const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');
const Groq = require('groq-sdk');
const { readMessages } = require('../models/messageModel');

let bot = null;
let groqClient = null;
let dailyReportTimeout = null;

// Paths for reading CMS and Analytics
const CMS_FILE = path.join(__dirname, '../../data/cms.json');
const ANALYTICS_FILE = path.join(__dirname, '../../data/analytics.json');

const readCMS = () => {
  try {
    if (!fs.existsSync(CMS_FILE)) return {};
    return JSON.parse(fs.readFileSync(CMS_FILE, 'utf8'));
  } catch {
    return {};
  }
};

const writeCMS = (data) => {
  fs.writeFileSync(CMS_FILE, JSON.stringify(data, null, 2), 'utf8');
};

const readAnalytics = () => {
  try {
    if (!fs.existsSync(ANALYTICS_FILE)) return {};
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
  } catch {
    return {};
  }
};

// Isolated AI Prompt for Admin Assistant
const ADMIN_AI_SYSTEM_PROMPT = `Sen Geido Studio'nun yöneticisinin/patronunun kişisel yapay zeka asistanısın. Müşterilerle veya site ziyaretçileriyle KONUŞMUYORSUN. Sadece yöneticiye hizmet ediyorsun. 
Amacın yöneticiye e-posta taslakları hazırlamak, projelerde fikir üretmek, yazılım/tasarım konseptlerinde beyin fırtınası yapmak ve yöneticinin sorduğu her türlü soruya kısa, net, saygılı ve profesyonel (ajans jargonuyla) yanıtlar vermektir. 
Zaman tasarrufu önemlidir, lafı uzatma, doğrudan çözümü veya metni sun.`;

function sendDailyReport(chatId) {
  const cms = readCMS();
  const messages = readMessages();
  const analytics = readAnalytics();
  
  // Dünün tarihi
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const yesterdayVisits = analytics[yesterdayStr]?.total || 0;
  
  const unreadMessages = messages.filter(m => !m.read).length;
  const newMessages = messages.filter(m => {
    const msgDate = new Date(m.date || m.createdAt);
    return msgDate >= yesterdayDate;
  }).length;
  
  const maintenanceText = cms.settings?.maintenanceMode ? 'AÇIK 🚨 (Müşteriler siteyi göremiyor)' : 'KAPALI ✅';
  
  const report = `🌅 <b>GÜNAYDIN PATRON!</b>\nİşte sistemin sabah özeti:\n\n` +
    `👁️ <b>Dünkü Ziyaretçi:</b> ${yesterdayVisits}\n` +
    `📩 <b>Son 24 Saatte Gelen Mesaj:</b> ${newMessages}\n` +
    `⚠️ <b>Okunmamış Biletler:</b> ${unreadMessages}\n` +
    `🛠️ <b>Bakım Modu:</b> ${maintenanceText}\n` +
    `⚙️ <b>Sistem Durumu:</b> %100 Sağlıklı Çalışıyor ✅\n\n` +
    `<i>Harika ve bol kazançlı bir gün dilerim! ☕</i>`;
    
  if (bot) bot.sendMessage(chatId, report, { parse_mode: 'HTML' });
  scheduleDailyReport(chatId); // schedule for tomorrow
}

function scheduleDailyReport(chatId) {
  if (dailyReportTimeout) clearTimeout(dailyReportTimeout);
  
  const now = new Date();
  const target = new Date();
  target.setHours(9, 0, 0, 0); // Sabah 09:00
  
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const delay = target.getTime() - now.getTime();
  dailyReportTimeout = setTimeout(() => sendDailyReport(chatId), delay);
}

function initTelegramBot(io) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[TelegramService] Token or Chat ID missing. Bot disabled.');
    return;
  }

  bot = new TelegramBot(token, { polling: true });
  console.log('[TelegramService] Telegram Bot is listening for commands.');

  // Init Groq if available
  if (process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('[TelegramService] Groq AI connected for Admin Assistant.');
  }

  const isAuthorized = (msg) => msg.chat.id.toString() === chatId;

  // Başlangıçta günlük rapor açıksa zamanla
  const cms = readCMS();
  if (cms.settings && cms.settings.dailyReport) {
    scheduleDailyReport(chatId);
  }

  const triggerNetlifyBuild = (chatId, successMsg) => {
    const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
    if (!buildHookUrl) {
      bot.sendMessage(chatId, `❌ Hata: <code>NETLIFY_BUILD_HOOK_URL</code> .env dosyasında bulunamadı. Lütfen Netlify'dan Build Hook oluşturup .env dosyasına ekleyin.`, { parse_mode: 'HTML' });
      return;
    }
    const req = https.request(buildHookUrl, { method: 'POST' }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        bot.sendMessage(chatId, successMsg, { parse_mode: 'HTML' });
      } else {
        bot.sendMessage(chatId, `❌ Netlify tetiklenemedi. Hata Kodu: ${res.statusCode}`);
      }
    });
    req.on('error', (err) => {
      bot.sendMessage(chatId, `❌ Derleme başlatılırken hata oluştu: ${err.message}`);
    });
    req.end();
  };

  // Command: /bakim
  bot.onText(/^\/bakim/, (msg) => {
    if (!isAuthorized(msg)) return;
    const cms = readCMS();
    if (!cms.settings) cms.settings = {};
    
    cms.settings.maintenanceMode = !cms.settings.maintenanceMode;
    writeCMS(cms);
    
    if (io) io.emit('cms_updated', cms);

    const statusText = cms.settings.maintenanceMode 
      ? '🚨 <b>Bakım Modu: AÇIK</b>\nSite kapalı. Müşteriler bakım sayfasını görüyor.' 
      : '✅ <b>Bakım Modu: KAPALI</b>\nSite herkese açık.';
    bot.sendMessage(chatId, statusText, { parse_mode: 'HTML' });

    // Trigger Netlify build so changes are reflected on the frontend
    triggerNetlifyBuild(chatId, `🚀 Bakım modu değiştirildiği için otomatik olarak <b>Netlify Build</b> tetiklendi! Siteniz 1-2 dakika içinde güncellenecek.`);
  });

  // Command: /rapor
  bot.onText(/^\/rapor/, (msg) => {
    if (!isAuthorized(msg)) return;
    const messages = readMessages();
    const analytics = readAnalytics();
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = analytics[today]?.total || 0;
    
    let totalVisits = 0;
    for (const date in analytics) {
      totalVisits += analytics[date].total || 0;
    }

    const report = `📊 <b>Geido Studio Raporu</b>\n\n📅 <b>Bugünkü Ziyaretçi:</b> ${todayVisits}\n👁️ <b>Toplam Ziyaretçi:</b> ${totalVisits}\n📩 <b>Gelen Bilet:</b> ${messages.length}\n\n<i>Sistem sorunsuz çalışıyor.</i>`;
    bot.sendMessage(chatId, report, { parse_mode: 'HTML' });
  });

  // Command: /sistem
  bot.onText(/^\/sistem/, (msg) => {
    if (!isAuthorized(msg)) return;
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);
    const uptime = (os.uptime() / 60 / 60 / 24).toFixed(1);
    
    const text = `💻 <b>Sistem Durumu</b>\n\n` +
      `🖥️ <b>İşletim Sistemi:</b> ${os.type()} ${os.release()}\n` +
      `⏱️ <b>Çalışma Süresi:</b> ${uptime} Gün\n` +
      `💾 <b>RAM Kullanımı:</b> ${usedMem} GB / ${totalMem} GB\n` +
      `⚙️ <b>CPU Yükü:</b> ${os.loadavg()[0].toFixed(2)} (Son 1 dk)\n` +
      `🟢 <b>Uygulama:</b> Node.js ${process.version}`;
    
    bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
  });

  // Command: /gunluk
  bot.onText(/^\/gunluk/, (msg) => {
    if (!isAuthorized(msg)) return;
    const cmsSettings = readCMS();
    if (!cmsSettings.settings) cmsSettings.settings = {};
    
    cmsSettings.settings.dailyReport = !cmsSettings.settings.dailyReport;
    writeCMS(cmsSettings);
    
    if (cmsSettings.settings.dailyReport) {
      bot.sendMessage(chatId, `🌅 <b>Günlük Rapor: AÇIK</b>\nHer sabah tam 09:00'da size dünün site istatistikleri ve mesaj durumu otomatik raporlanacak.`, { parse_mode: 'HTML' });
      scheduleDailyReport(chatId);
    } else {
      bot.sendMessage(chatId, `🌇 <b>Günlük Rapor: KAPALI</b>\nArtık sabahları otomatik rapor almayacaksınız.`, { parse_mode: 'HTML' });
      if (dailyReportTimeout) clearTimeout(dailyReportTimeout);
    }
  });

  // Command: /not [dakika] [mesaj]
  bot.onText(/^\/not\s+(\d+)\s+(.+)/, (msg, match) => {
    if (!isAuthorized(msg)) return;
    const minutes = parseInt(match[1], 10);
    const noteText = match[2];
    bot.sendMessage(chatId, `✅ Notunuz alındı. <b>${minutes} dakika</b> sonra hatırlatacağım.`, { parse_mode: 'HTML' });
    setTimeout(() => {
      bot.sendMessage(chatId, `🔔 <b>HATIRLATMA:</b>\n\n<i>${noteText}</i>`, { parse_mode: 'HTML' });
    }, minutes * 60 * 1000);
  });
  
  // Command: /build
  bot.onText(/^\/build/, (msg) => {
    if (!isAuthorized(msg)) return;
    bot.sendMessage(chatId, `⏳ Netlify derlemesi başlatılıyor...`);
    triggerNetlifyBuild(chatId, `✅ <b>Derleme tetiklendi!</b> Ortalama 1-2 dakika sürecektir. İşlem bittiğinde otomatik olarak bildirim alacaksınız.`);
  });

  // AI Assistant (Any message not starting with /)
  bot.on('message', async (msg) => {
    if (!isAuthorized(msg)) return;
    if (msg.text && msg.text.startsWith('/')) return; // Ignore commands

    if (!groqClient) {
      bot.sendMessage(chatId, `❌ Groq AI yapılandırılmamış. Lütfen .env dosyasına GROQ_API_KEY ekleyin.`);
      return;
    }

    try {
      // Typing indicator
      bot.sendChatAction(chatId, 'typing');

      const chatCompletion = await groqClient.chat.completions.create({
        messages: [
          { role: 'system', content: ADMIN_AI_SYSTEM_PROMPT },
          { role: 'user', content: msg.text }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const reply = chatCompletion.choices[0]?.message?.content || 'Yanıt üretilemedi.';
      bot.sendMessage(chatId, reply);
    } catch (err) {
      console.error('[TelegramService] AI Error:', err);
      bot.sendMessage(chatId, `❌ AI Hatası: ${err.message}`);
    }
  });

  bot.onText(/^\/start/, (msg) => {
    if (!isAuthorized(msg)) return;
    const welcomeMsg = `Merhaba Patron! 🤖\n\nBen sizin kişisel yapay zeka asistanınızım. Bana normal mesaj yazarak taslak mailler yazdırabilir, fikir sorabilirsiniz.\n\nAyrıca şu komutları kullanabilirsiniz:\n🛠️ /bakim - Siteyi bakıma al\n📊 /rapor - İstatistikleri gör\n💻 /sistem - Sunucu donanım durumunu gör\n🌅 /gunluk - Her sabah 09:00 otomatik raporunu aç/kapat\n⏰ /not [dakika] [mesaj] - Hatırlatma kur\n🚀 /build - Siteyi Netlify'da derle`;
    bot.sendMessage(chatId, welcomeMsg);
  });
}

async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    if (bot) {
      await bot.sendMessage(chatId, text, { parse_mode: 'HTML', disable_web_page_preview: true });
    } else {
      const tempBot = new TelegramBot(token, { polling: false });
      await tempBot.sendMessage(chatId, text, { parse_mode: 'HTML', disable_web_page_preview: true });
    }
  } catch (err) {
    console.error('[TelegramService] Error sending message:', err);
  }
}

module.exports = { initTelegramBot, sendTelegramMessage };
