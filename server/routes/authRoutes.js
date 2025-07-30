const express = require('express');
const AuthController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleAuth);
router.post('/truecaller', AuthController.truecallerAuth);
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;