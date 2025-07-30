// schedulerLogic.js

const ContactService = require('./services/contactService');
const SettingService = require('./services/settingService');
const { sendMail }   = require('./services/emailService');

/**
 * Sends contacts from the last 3 hours, if any.
 */
async function sendLast3HoursReport() {
  const now   = new Date();
  const end   = now;
  const start = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  // 1) fetch contacts in that window
  const contacts = await ContactService.getContactsByDateRange(start, end);

  if (contacts.length === 0) {
    console.log(`⏰ No contacts between ${start.toLocaleTimeString()}–${end.toLocaleTimeString()}`);
    return;
  }

  // 2) get admin email from settings
  //md.shakil0165@gmail.oom
  const adminMail = await SettingService.getSetting('query.sunflowertrip@gmail.com');
  if (!adminMail) throw new Error('Admin email not configured.');

  // 3) build HTML table
  const rowsHtml = contacts.map(c => `
    <tr>
      <td>${c.contact_id}</td>
      <td>${c.first_name}</td>
      <td>${c.email}</td>
      <td>${c.subject}</td>
      <td>${new Date(c.created_at).toLocaleTimeString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <h3>Contacts from ${start.toLocaleTimeString('en-IN')} to ${end.toLocaleTimeString('en-IN')}</h3>
    <table border="1" cellpadding="5">
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Subject</th><th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;

  // 4) send
  await sendMail({
    to:      adminMail,
    subject: `3-Hour Contacts Report — ${end.toLocaleTimeString('en-IN')}`,
    html
  });

  console.log(`📬 3-hour report sent (${contacts.length} items) to ${adminMail}`);
}


/**
 * Sends the full-day report at 23:59.
 */
async function sendTodayReport() {
  const now      = new Date();
  const startDay = new Date(now); startDay.setHours(0,0,0,0);
  const endDay   = new Date(now); endDay.setHours(23,59,59,999);

  const contacts = await ContactService.getContactsByDateRange(startDay, endDay);
  const adminMail = await SettingService.getSetting('query.sunflowertrip@gmail.com');
  if (!adminMail) throw new Error('Admin email not configured.');

  const rowsHtml = contacts.map(c => `
    <tr>
      <td>${c.contact_id}</td>
      <td>${c.first_name}</td>
      <td>${c.email}</td>
      <td>${c.subject}</td>
      <td>${new Date(c.created_at).toLocaleTimeString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <h3>Contacts for ${now.toLocaleDateString('en-IN')}</h3>
    <table border="1" cellpadding="5">
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Subject</th><th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;

  await sendMail({
    to:      adminMail,
    subject: `Daily Contacts Report — ${now.toLocaleDateString('en-IN')}`,
    html
  });

  console.log(`📬 End-of-day report sent (${contacts.length} items) to ${adminMail}`);
}

module.exports = { sendLast3HoursReport, sendTodayReport };
