require('dotenv').config({ path: '.env' });
const { sendEmail } = require('./src/services/emailService');

sendEmail('info@geidostudio.com', 'Test Subject', 'Test Text', '<p>Test Html</p>')
  .then(info => console.log('Success:', info))
  .catch(err => console.error('Failed:', err));
