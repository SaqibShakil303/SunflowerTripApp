const bcrypt = require('bcryptjs');

const storedHash = '$2a$10$J8Nl0PECjo0r8g0KpQFSiONrajInwsbgPt77noLqNPu6BhFKP6V6W';
const password = 'Admin@Banti2025';

bcrypt.compare(password, storedHash, (err, isMatch) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Password match:', isMatch);
});