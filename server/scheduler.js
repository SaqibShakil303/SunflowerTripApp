const cron           = require('node-cron');
const ContactService = require('./services/contactService');
const SettingService = require('./services/settingService');
const { sendMail }   = require('./services/emailService');
const { sendTodayReport } = require('./schedulerLogic'); 
// Runs at 23:59 IST daily
cron.schedule('0 59 23 * * *', async () => {
  try {
    // Build today’s range
    const now      = new Date();
    const startDay = new Date(now); startDay.setHours(0,0,0,0);
    const endDay   = new Date(now); endDay.setHours(23,59,59,999);

    // 1) Get contacts & admin e-mail
    const contacts  = await ContactService.getContactsByDateRange(startDay, endDay);
    const adminMail = await SettingService.getSetting('query.sunflowertrip@gmail.com');
    if (!adminMail) throw new Error('Admin email not configured.');

    // 2) Build HTML table
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
        <thead><tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Subject</th><th>Time</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    // 3) Send the e-mail
    await sendMail({
      to:      adminMail,
      subject: `Daily Contacts Report — ${now.toLocaleDateString('en-IN')}`,
      html
    });

    console.log(`📬 Report sent to ${adminMail}`);
  } catch (err) {
    console.error('Scheduler error:', err);
  }
}, { timezone: 'Asia/Kolkata' });



// Run every 5 minutes (at minute 0,5,10,15,…)
// cron.schedule('*/5 * * * *', async () => {
//   console.log('🕒 5-minute test cron firing…');
//   try {
//     await sendTodayReport();
//   } catch (err) {
//     console.error(err);
//   }
// }, {
//   timezone: 'Asia/Kolkata'
// });