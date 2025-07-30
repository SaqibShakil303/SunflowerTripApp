// routes/debug.js
const express   = require('express');
const router    = express.Router();

// Destructure sendMail from the exported object
const { sendMail } = require('../services/emailService');

router.get('/sendTestEmail', async (req, res, next) => {
  try {
    await sendMail({
      to:      'md.shakil0165@gmail.com',
      subject: '🧪 SMTP Test from SunflowerTrip API',
      html:    '<p>This is a test email.</p>'
    });
    res.send('✅ Test email sent');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
