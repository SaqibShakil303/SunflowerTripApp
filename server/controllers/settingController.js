const SettingService = require('../services/settingService');

async function fetchAdminEmail(req, res, next) {
  try {
    const email = await SettingService.getSetting('admin_email');
    res.json({ email });
  } catch (err) { next(err); }
}

async function updateAdminEmail(req, res, next) {
  try {
    const { email } = req.body;
    await SettingService.setSetting('admin_email', email);
    res.sendStatus(204);
  } catch (err) { next(err); }
}

module.exports = { fetchAdminEmail, updateAdminEmail };
