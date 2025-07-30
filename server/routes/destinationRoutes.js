const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');

// POST route to add a destination
router.post('/AddDestination', destinationController.createDestination);
router.get('/names', destinationController.getNamesAndLocations);
router.get('/destinationNames', destinationController.getDestinationNames);
// router.get('/continents', destinationController.getContinents);
// router.get('/countries/:continentId', destinationController.getCountriesByContinent);

router.post('/AddDestinationWithDetails', destinationController.createDestinationWithDetails);
// Optionally: GET all destinations
router.get('/', destinationController.getAllDestinations);

router.post('/AddLocation', destinationController.addLocation);

router.post('/AddAttraction', destinationController.addAttraction);

router.post('/AddEthnicity', destinationController.addEthnicity);

router.post('/AddCuisine', destinationController.addCuisine);

router.post('/AddActivity', destinationController.addActivity);

// router.post('/AddItineraryBlock', destinationController.addItineraryBlock);

router.delete('/:id', destinationController.deleteDestination);
router.get('/:id/details', destinationController.getDestinationDetails);

router.get('/:title', destinationController.getDestinationByTitle);
router.patch('/update/:id', destinationController.updateDestination);
router.patch(
  '/destinations/:id/details',
  destinationController.updateDestinationDetails
);

router.get('/:id', destinationController.getDestinationById);
module.exports = router;
