const jwt = require('jsonwebtoken');
const secret = '55c9ac7deec1ca5149c197e56f6cb6891c2ebb4154e4db1d253e421be555cbb5def2be07072b90f1a46a9bdd400c31ea06cfb630d468445f9e9c280c1626a3a5';
const token = jwt.sign({ email: 'admin@geidostudio.com', role: 'admin' }, secret, { expiresIn: '1h' });

fetch('http://localhost:3001/api/messages/a6465bac-fde1-42d4-9d97-8a780f877798/reply', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ text: 'Hello Caner' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
