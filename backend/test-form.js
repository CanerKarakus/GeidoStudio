fetch('http://localhost:3001/api/messages', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test Spam Filter', email: 'canerdsgn789@gmail.com', phone: '5551234567', subject: 'Test', message: 'This is a test message to see if it arrives.'
  })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
});
