const Location = require('../models/locationModel');

async function createLocation(req, res) {
  try {
    const loc = await Location.createLocation(req.body);
    res.status(201).json(loc);
  } catch (err) {
    console.error('Error creating location:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getLocationsByDestination(req, res) {
  try {
    const destinationId = +req.params.destinationId;
    const locs = await Location.getLocationsByDestination(destinationId);
    res.json(locs);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


async function getAllLocations(req, res, next) {
  try {
    const tours = await Location.getAllLocations();
    res.json(tours);
  } catch (err) {
    console.error('Error fetching tours:', err);
    next(err);
  }
}

async function updateLocation(req, res) {
  try {
    const loc = await Location.updateLocation(req.body);
    if (!loc) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(200).json(loc);
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteLocation(req, res) {
  try {
    const affectedRows = await Location.deleteLocation(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createLocation,
  getLocationsByDestination,
  getAllLocations, 
  updateLocation, 
  deleteLocation
};
