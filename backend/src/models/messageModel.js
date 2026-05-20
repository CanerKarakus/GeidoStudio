const fs = require('fs');
const path = require('path');

const MESSAGES_FILE = path.join(__dirname, '../../data/messages.json');

const readMessages = () => {
  try {
    if (!fs.existsSync(MESSAGES_FILE)) return [];
    const data = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    // Migration: ensure replies array exists
    let modified = false;
    const migrated = data.map(msg => {
      if (!msg.replies) {
        msg.replies = [];
        modified = true;
      }
      return msg;
    });
    if (modified) {
      writeMessages(migrated);
    }
    return migrated;
  } catch (err) {
    console.error('Error reading messages:', err);
    return [];
  }
};

const writeMessages = (data) => {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readMessages, writeMessages };
