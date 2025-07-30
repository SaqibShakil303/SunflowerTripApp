// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host:     process.env.SMTP_HOST,
  port:     +process.env.SMTP_PORT,
  secure:   process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify()
  .then(() => console.log('✅ SMTP ready'))
  .catch(err => console.error('❌ SMTP configuration error:', err));

async function sendMail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from:    process.env.SMTP_FROM,
    to, subject, html, text
  });
  console.log('✉️ Email sent:', info.messageId);
  return info;
}

// 👉 Make sure to export sendMail in an object
module.exports = { sendMail };
