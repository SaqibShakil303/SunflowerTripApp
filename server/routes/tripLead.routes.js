const express = require('express');
const router = express.Router();
const controller = require('../controllers/tripLead.controller');

router.post('/', controller.createTripLead);
router.get('/', controller.getAllTripLeads);
router.delete('/:id', controller.deleteTripLead);

module.exports = router;