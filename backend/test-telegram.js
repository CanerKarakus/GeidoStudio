const TelegramBot = require('node-telegram-bot-api');
const token = '8257718394:AAGRKJkputlKl6b7mYoB-hUV36PrkLDlS9o';
const bot = new TelegramBot(token, { polling: false });

const ids = ['1020765361', '1025753990'];

async function test() {
  for (const id of ids) {
    try {
      await bot.sendMessage(id, `🔧 Test mesajı: Bu bir sistem kontrol mesajıdır.`);
      console.log(`✅ Başarılı: ${id}`);
    } catch (err) {
      console.error(`❌ Hata (${id}):`, err.message);
    }
  }
}
test();
