const db = require('../db');
const User = require('../models/userModel');

const getAllUsers = async () => {
    const [results] = await db.query('SELECT * FROM users');
    return results;
};

async function deleteUser(id) {
    const [[row]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!row) {
        throw new Error('User not found');
    }
    const sql = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
}

module.exports = {
    getAllUsers,
    deleteUser
};