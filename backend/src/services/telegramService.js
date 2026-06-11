const https = require('https');

/**
 * Sends a message via Telegram Bot API
 * @param {string} text - The message to send (supports basic HTML tags: <b>, <i>, <a>, <code>, <pre>)
 * @returns {Promise<void>}
 */
async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // If token or chatId is not configured, silently skip sending
  if (!token || !chatId) {
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  const payload = JSON.stringify({
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          console.error('[TelegramService] Error response from Telegram API:', res.statusCode, data);
          reject(new Error(`Telegram API Error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('[TelegramService] Network Error:', err);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

module.exports = {
  sendTelegramMessage
};
