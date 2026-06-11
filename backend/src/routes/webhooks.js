const express = require('express');
const { sendTelegramMessage } = require('../services/telegramService');

const router = express.Router();

// Netlify Outgoing Webhook receiver
router.post('/netlify', async (req, res) => {
  try {
    const payload = req.body;
    
    // Payload from Netlify usually contains 'state' (ready, error, building, etc.)
    // and 'name', 'url', 'build_time', 'error_message'
    
    if (payload && payload.state) {
      const state = payload.state;
      const buildTime = payload.build_time ? `(Süre: ${payload.build_time}sn)` : '';
      const siteName = payload.name || 'Geido Studio';

      if (state === 'ready') {
        const msg = `🚀 <b>${siteName}</b> başarıyla derlendi ve yayına alındı! ${buildTime}`;
        await sendTelegramMessage(msg);
      } else if (state === 'error') {
        const errorMsg = payload.error_message || 'Bilinmeyen hata';
        const msg = `❌ <b>${siteName}</b> derlemesi çöktü!\n\nHata: ${errorMsg}\nLütfen Netlify paneline gidip logları kontrol edin.`;
        await sendTelegramMessage(msg);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhooks] Netlify webhook error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
