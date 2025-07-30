const AuthService = require('../services/auth');
const User = require('../models/userModel');
const axios = require('axios');
const { google } = require('googleapis');

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.FRONTEND_URL}/auth/google/callback`
);


class AuthController {
  static async signup(req, res) {
    try {
      const { email, password, role } = req.body;
      const existingUser = await User.findByEmail(email);
      if (existingUser) return res.status(400).json({ message: 'Email already exists' });

      const passwordHash = await AuthService.hashPassword(password);
      const userId = await User.create({ email, passwordHash, role: role || 'user' });
      const user = await User.findByEmail(email);
      const tokens = AuthService.generateTokens(user);
      await User.updateRefreshToken(userId, tokens.refreshToken);

      res.status(201).json({ tokens });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);
      if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid credentials' });

      const isValid = await AuthService.comparePassword(password, user.passwordHash);
      if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

      const tokens = AuthService.generateTokens(user);
      await User.updateRefreshToken(user.id, tokens.refreshToken);
      const userRole = await User.getUserRole(email);
      if (!userRole) return res.status(404).json({ message: 'User role not found' });
      res.json({ tokens, userRole });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async googleAuth(req, res) {
    try {
      const { code } = req.body;
      const redirectUri = `${process.env.FRONTEND_URL}/auth/google/callback`;
      // console.log('Google auth request:', {
      //   code,
      //   redirectUri,
      //   clientId: process.env.GOOGLE_CLIENT_ID,
      //   clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '[REDACTED]' : undefined
      // });

      const { tokens } = await oauth2Client.getToken({
        code,
        redirect_uri: redirectUri,
      }).catch(error => {
        if (error.response?.data?.error === 'invalid_grant') {
          throw new Error('Invalid or expired authorization code');
        }
        throw error;
      });

      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      let user = await User.findByEmail(userInfo.data.email);
      if (!user) {
        user = await User.create({
          email: userInfo.data.email,
          role: 'user',
        });
      }
      const appTokens = AuthService.generateTokens(user);
      await User.updateRefreshToken(user.id, appTokens.refreshToken);
      res.json({ tokens: appTokens });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(error.message.includes('Invalid or expired authorization code') ? 400 : 500).json({
        message: error.message
      });
    }
    //     console.log('Google credentials:', {
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //   redirectUri: `${process.env.FRONTEND_URL}/auth/google/callback`
    // });
  }


  static async truecallerAuth(req, res) {
    try {
      const { code } = req.body;
      const response = await axios.post('https://api4.truecaller.com/v1/oauth/token', {
        code,
        client_id: process.env.TRUECALLER_CLIENT_ID,
        client_secret: process.env.TRUECALLER_CLIENT_SECRET,
        redirect_uri: `${process.env.FRONTEND_URL}/auth/truecaller/callback`,
        grant_type: 'authorization_code',
      });
      const userInfo = await axios.get('https://api4.truecaller.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });
      let user = await User.findByEmail(userInfo.data.email);
      if (!user) {
        user = await User.create({
          email: userInfo.data.email,
          role: 'user',
        });
      }
      const tokens = AuthService.generateTokens(user);
      await User.updateRefreshToken(user.id, tokens.refreshToken);
      res.json({ tokens });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      res.json({ tokens });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
}

module.exports = AuthController;