const Destination = require('../models/destinationModel');
const DestinationService = require('../services/destinationService');

const getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.getAllDestinations();
    res.status(200).json(destinations);
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteDestination = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid destination ID' });
  }

  try {
    await DestinationService.deleteDestinationById(id);
    res.status(200).json({ message: 'Destination and its related data deleted successfully.' });
  } catch (err) {
    console.error('Error deleting destination:', err);
    res.status(500).json({ error: 'Failed to delete destination' });
  }
};

const addLocation = async (req, res) => {
  try {
    const location = await Destination.addLocation(req.body);
    res.status(201).json(location);
  } catch (err) {
    console.error('Error adding location:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addAttraction = async (req, res) => {
  try {
    const attraction = await Destination.addAttraction(req.body);
    res.status(201).json(attraction);
  } catch (err) {
    console.error('Error adding attraction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addEthnicity = async (req, res) => {
  try {
    const ethnicity = await Destination.addEthnicity(req.body);
    res.status(201).json(ethnicity);
  } catch (err) {
    console.error('Error adding ethnicity:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addCuisine = async (req, res) => {
  try {
    const cuisine = await Destination.addCuisine(req.body);
    res.status(201).json(cuisine);
  } catch (err) {
    console.error('Error adding cuisine:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addActivity = async (req, res) => {
  try {
    const activity = await Destination.addActivity(req.body);
    res.status(201).json(activity);
  } catch (err) {
    console.error('Error adding activity:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createDestination = async (req, res) => {
  try {
    const newDestination = await Destination.createDestination(req.body);
    res.status(201).json(newDestination);
  } catch (err) {
    console.error('Error creating destination:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createDestinationWithDetails = async (req, res) => {
  try {
    const result = await DestinationService.createDestinationWithDetails(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Error in destination creation:', err);
    res.status(500).json({ error: err.message });
  }
};

const getDestinationDetails = async (req, res) => {
  const destination_id = req.params.id;

  try {
    const data = await Destination.getDestinationDetails(destination_id);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching destination details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDestinationByTitle = async (req, res) => {
  const title = req.params.title;

  try {
    const data = await Destination.getDestinationDetailsByTitle(title);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching destination details by title:', err);
    if (err.code === 404) {
      res.status(404).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

async function updateDestinationDetails(req, res) {
  const destId = +req.params.id;
  const { destination, attractions, ethnicities, cuisines, activities } = req.body;

  try {
    const updated = await Destination.updateDetails(destId, {
      destination,
      attractions,
      ethnicities,
      cuisines,
      activities
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating destination details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getNamesAndLocations(req, res) {
  try {
    const list = await Destination.getNamesAndLocations();
    res.json(list);
  } catch (err) {
    console.error('Error fetching destination names:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getDestinationNames(req, res) {
  try {
    const list = await Destination.getDestinationNames();
    res.json(list);
  } catch (err) {
    console.error('Error fetching destination names:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getDestinationById(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid destination ID' });
  }

  try {
    const destination = await Destination.getDestinationById(id);
    res.json(destination);
  } catch (err) {
    if (err.code === 404) {
      res.status(404).json({ message: err.message });
    } else {
      console.error('Error fetching destination by ID:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

async function updateDestination(req, res) {
  const destinationId = req.params.id;
  const updateData = req.body;

  try {
    const result = await DestinationService.updateDestinations(destinationId, updateData);
    res.status(200).json({ message: 'Destination updated successfully', result });
  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).json({ error: 'Failed to update destination' });
  }
}

module.exports = {
  deleteDestination,
  updateDestination,
  getDestinationByTitle,
  getDestinationNames,
  getDestinationById,
  getNamesAndLocations,
  updateDestinationDetails,
  getDestinationDetails,
  createDestinationWithDetails,
  addActivity,
  addCuisine,
  addEthnicity,
  addAttraction,
  addLocation,
  createDestination,
  getAllDestinations
};