const jwt = require('jsonwebtoken');
const token = jwt.sign({ test: 1 }, 'test_secret', { expiresIn: '1h' });
console.log(token);
