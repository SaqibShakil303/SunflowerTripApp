const pool = require('../db');
const userService = require('../services/userService');

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        next(err);
    }
};

async function deleteUser(req, res) {
  try {
    const affectedRows = await User.deleteUser(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
    getAllUsers,
    deleteUser
};