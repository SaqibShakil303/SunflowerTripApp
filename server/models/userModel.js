const pool = require('../db');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async getUserRole(email) {
    const [rows] = await pool.execute('SELECT role FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0].role : null; // Return the role string or null if no user found
  }

  static async findByGoogleId(googleId) {
    const [rows] = await pool.query('SELECT * FROM users WHERE googleId = ?', [googleId]);
    return rows[0];
  }

  static async findByTruecallerId(truecallerId) {
    const [rows] = await pool.query('SELECT * FROM users WHERE truecallerId = ?', [truecallerId]);
    return rows[0];
  }

  static async create({ email, passwordHash, googleId, truecallerId, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (email, passwordHash, googleId, truecallerId, role) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, googleId, truecallerId, role]
    );
    return result.insertId;
  }

  static async updateRefreshToken(userId, refreshToken) {
    await pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [refreshToken, userId]);
  }

  static async findByRefreshToken(refreshToken) {
    const [rows] = await pool.query('SELECT * FROM users WHERE refreshToken = ?', [refreshToken]);
    return rows[0];
  }
}

module.exports = User;