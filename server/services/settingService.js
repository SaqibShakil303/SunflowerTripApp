const pool = require('../db');

async function getSetting(key) {
  const [rows] = await pool.query(
    'SELECT key_value FROM settings WHERE key_name = ?',
    [key]
  );
  return rows.length ? rows[0].key_value : null;
}

async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO settings (key_name, key_value)
      VALUES (?, ?)
     ON DUPLICATE KEY UPDATE key_value = VALUES(key_value)`,
    [key, value]
  );
}

module.exports = { getSetting, setSetting };
