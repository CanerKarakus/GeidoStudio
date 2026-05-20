const { initImap, sendEmail } = require('./src/services/emailService');
require('dotenv').config({path: './.env'});

async function run() {
  try {
    await sendEmail(process.env.SMTP_USER, 'Test Spam HTML', 'Plain text version', `<div style="text-align:center;">
      <p style="margin-bottom:15px;color:#b30000;"><strong>Yeni Form Mesajı</strong></p>
    </div>`);
    console.log('HTML Test Sent');
  } catch (err) {
    console.error(err);
  }
}
run();
