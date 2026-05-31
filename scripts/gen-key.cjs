const crypto = require('crypto');

const key = crypto.randomBytes(32).toString('hex');
console.log('Generated ENCRYPTION_KEY (32-byte hex):');
console.log(key);
console.log('\nUse this value in your .env file for ENCRYPTION_KEY.');
