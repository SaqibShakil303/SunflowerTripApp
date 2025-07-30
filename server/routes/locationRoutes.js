const express = require('express');
const router = express.Router();
const locCtrl = require('../controllers/locationController');

// POST /api/locations
router.post('/', locCtrl.createLocation);

// GET /api/destinations/:destinationId/locations
router.get('/destinations/:destinationId/locations', locCtrl.getLocationsByDestination);

// GET /api/locations
router.get('/', locCtrl.getAllLocations);

// UPDATE /api/locations/:id
router.put('/:id', locCtrl.updateLocation);

// DELETE /api/locations/:id
router.delete('/:id', locCtrl.deleteLocation);

module.exports = router;