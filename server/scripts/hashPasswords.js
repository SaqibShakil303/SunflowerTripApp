const bcrypt = require('bcryptjs');
const pool = require('../db/index');

async function hashAndUpdatePassword() {
  try {
    const password = 'Admin@Banti2025';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.execute(
      'UPDATE users SET passwordHash = ? WHERE email = ?',
      [passwordHash, 'admin@thesunflower.com']
    );

    if (result.affectedRows === 0) {
      console.log('No user found with email admin@thesunflower.com');
    } else {
      console.log('Password updated successfully for admin@thesunflower.com');
      console.log('New hash:', passwordHash);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

hashAndUpdatePassword();