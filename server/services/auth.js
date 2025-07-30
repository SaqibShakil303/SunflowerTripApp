const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const User = require('../models/userModel');

class AuthService {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
  }

  static async googleAuth(code) {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.FRONTEND_URL}/auth/google/callback`,
      grant_type: 'authorization_code'
    });

    const { id_token } = tokenResponse.data;
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${id_token}` }
    });

    const { sub: googleId, email } = userInfo.data;
    let user = await User.findByGoogleId(googleId);

    if (!user) {
      await User.create({ email, googleId, role: 'user' });
      user = await User.findByGoogleId(googleId);
    }

    const tokens = this.generateTokens(user);
    await User.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  static async truecallerAuth(code) {
    const tokenResponse = await axios.post('https://api4.truecaller.com/v1/oauth/token', {
      code,
      client_id: process.env.TRUECALLER_CLIENT_ID,
      client_secret: process.env.TRUECALLER_CLIENT_SECRET,
      redirect_uri: `${process.env.FRONTEND_URL}/auth/truecaller/callback`,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenResponse.data;
    const userInfo = await axios.get('https://api4.truecaller.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { userId: truecallerId, email } = userInfo.data;
    let user = await User.findByTruecallerId(truecallerId);

    if (!user) {
      await User.create({ email, truecallerId, role: 'user' });
      user = await User.findByTruecallerId(truecallerId);
    }

    const tokens = this.generateTokens(user);
    await User.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  static async refreshToken(refreshToken) {
    const user = await User.findByRefreshToken(refreshToken);
    if (!user) throw new Error('Invalid refresh token');

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = this.generateTokens(user);
    await User.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}

module.exports = AuthService;