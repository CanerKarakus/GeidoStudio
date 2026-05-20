fetch('http://localhost:3001/api/messages', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test', email: 'test@example.com', phone: '123', subject: 'Test', message: 'Test message'
  })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
});
