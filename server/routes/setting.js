const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/settingController');

router.get('/Email', ctrl.fetchAdminEmail);
router.put('/Email', ctrl.updateAdminEmail);

module.exports = router;
