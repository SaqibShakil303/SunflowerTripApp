const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/itineraryController');

router.post('/AddItinerary', ctrl.createItinerary);
router.get('/GetItineraries', ctrl.fetchItineraries);

module.exports = router;

