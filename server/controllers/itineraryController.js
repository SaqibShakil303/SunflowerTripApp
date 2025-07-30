const ItineraryService = require('../services/itineraryService');

async function createItinerary(req, res, next) {
  try {
    const id = await ItineraryService.addItinerary(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

async function fetchItineraries(req, res, next) {
  try {
    const list = await ItineraryService.getAllItineraries();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

module.exports = { createItinerary, fetchItineraries };