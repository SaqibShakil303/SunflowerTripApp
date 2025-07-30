const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('JWT_SECRET:', generateSecret());
console.log('JWT_REFRESH_SECRET:', generateSecret());