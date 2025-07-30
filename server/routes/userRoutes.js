const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
router.get('/', userController.getAllUsers);

// DELETE a user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;