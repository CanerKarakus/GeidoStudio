const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

const imapConfig = {
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT) || 993,
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  logger: false
};

const poll = async () => {
  const client = new ImapFlow(imapConfig);
  console.log('[Test] Connecting...');
  await client.connect();
  console.log('[Test] Connected.');
  
  let lock = await client.getMailboxLock('INBOX');
  console.log('[Test] Lock acquired.');
  
  try {
    const uids = await client.search({ seen: false });
    console.log('[Test] Unseen UIDs:', uids);
  } finally {
    lock.release();
    console.log('[Test] Lock released.');
  }
  
  await client.logout();
  console.log('[Test] Logged out. Done.');
};

poll()
  .then(() => {
    console.log('\n--- Waiting 5s then polling again ---');
    setTimeout(async () => {
      await poll();
      console.log('[Test] Second poll done.');
      process.exit(0);
    }, 5000);
  })
  .catch(err => {
    console.error('[Test] Error:', err.message);
    process.exit(1);
  });
