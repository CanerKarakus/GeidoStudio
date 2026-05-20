const { sendEmail } = require('./src/services/emailService');
require('dotenv').config({path: './.env'});

async function run() {
  try {
    // Send to info@geidostudio.com without replyTo
    await sendEmail(process.env.SMTP_USER, 'Test No ReplyTo', 'Plain text', '<p>Test</p>');
    console.log('Test 1 Sent');
    
    // Send to info@geidostudio.com with replyTo
    await sendEmail(process.env.SMTP_USER, 'Test With ReplyTo', 'Plain text', '<p>Test</p>', 'canerdsgn789@gmail.com');
    console.log('Test 2 Sent');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
