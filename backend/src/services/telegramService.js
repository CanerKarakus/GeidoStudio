const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { readMessages } = require('../models/messageModel');

let bot = null;

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

/**
 * Initialize the Telegram Bot listener with given Socket IO instance
 */
function initTelegramBot(io) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[TelegramService] Token or Chat ID missing. Interactive commands disabled.');
    return;
  }

  // Initialize bot with polling
  bot = new TelegramBot(token, { polling: true });
  console.log('[TelegramService] Telegram Bot is listening for commands.');

  // Security: Only allow commands from the designated CHAT_ID
  const isAuthorized = (msg) => msg.chat.id.toString() === chatId;

  // Command 1: /bakim - Toggles maintenance mode
  bot.onText(/^\/bakim/, (msg) => {
    if (!isAuthorized(msg)) return;
    
    const cms = readCMS();
    if (!cms.settings) cms.settings = {};
    
    // Toggle
    cms.settings.maintenanceMode = !cms.settings.maintenanceMode;
    writeCMS(cms);
    
    // Notify connected frontend clients via socket
    if (io) {
      io.emit('cms_updated', cms);
    }

    const statusText = cms.settings.maintenanceMode 
      ? '🚨 <b>Bakım Modu: AÇIK</b>\nSite şu an ziyaretçilere kapalı.' 
      : '✅ <b>Bakım Modu: KAPALI</b>\nSite şu an herkese açık.';
      
    bot.sendMessage(chatId, `Ayarlar güncellendi.\n\n${statusText}`, { parse_mode: 'HTML' });
  });

  // Command 2: /rapor - Summarizes site statistics
  bot.onText(/^\/rapor/, (msg) => {
    if (!isAuthorized(msg)) return;
    
    const messages = readMessages();
    const totalMessages = messages.length;
    
    const analytics = readAnalytics();
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = analytics[today]?.total || 0;
    
    let totalVisits = 0;
    for (const date in analytics) {
      totalVisits += analytics[date].total || 0;
    }

    const report = `📊 <b>Geido Studio Raporu</b>\n\n` +
                   `📅 <b>Bugünkü Ziyaretçi:</b> ${todayVisits}\n` +
                   `👁️ <b>Toplam Ziyaretçi (Tüm Zamanlar):</b> ${totalVisits}\n` +
                   `📩 <b>Gelen Mesaj/Bilet:</b> ${totalMessages}\n\n` +
                   `<i>Sisteminiz kusursuz çalışıyor.</i>`;
    
    bot.sendMessage(chatId, report, { parse_mode: 'HTML' });
  });

  // Command 3: /not [dakika] [mesaj] - Reminder
  bot.onText(/^\/not\s+(\d+)\s+(.+)/, (msg, match) => {
    if (!isAuthorized(msg)) return;
    
    const minutes = parseInt(match[1], 10);
    const noteText = match[2];

    bot.sendMessage(chatId, `✅ Notunuz alındı. Tam <b>${minutes} dakika</b> sonra size hatırlatacağım.`, { parse_mode: 'HTML' });

    // Node.js timeout (Note: cleared if server restarts)
    setTimeout(() => {
      bot.sendMessage(chatId, `🔔 <b>HATIRLATMA:</b>\n\n<i>${noteText}</i>`, { parse_mode: 'HTML' });
    }, minutes * 60 * 1000);
  });
  
  // Basic Welcome for /start
  bot.onText(/^\/start/, (msg) => {
    if (!isAuthorized(msg)) return;
    const welcomeMsg = `Merhaba Patron! 🤖\n\nAşağıdaki komutları kullanarak siteyi yönetebilirsiniz:\n\n` +
                       `🛠️ /bakim - Sitenin bakım modunu aç/kapat\n` +
                       `📊 /rapor - Ziyaretçi ve mesaj istatistiklerini gör\n` +
                       `⏰ /not [dakika] [mesaj] - İstediğiniz süre sonra hatırlatma alın`;
    bot.sendMessage(chatId, welcomeMsg);
  });
}

/**
 * Sends a standard notification message
 */
async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  try {
    if (bot) {
      // If initialized via polling, use existing bot
      await bot.sendMessage(chatId, text, { parse_mode: 'HTML', disable_web_page_preview: true });
    } else {
      // Fallback if not initialized via polling
      const tempBot = new TelegramBot(token, { polling: false });
      await tempBot.sendMessage(chatId, text, { parse_mode: 'HTML', disable_web_page_preview: true });
    }
  } catch (err) {
    console.error('[TelegramService] Error sending message:', err);
  }
}

module.exports = { initTelegramBot, sendTelegramMessage };
