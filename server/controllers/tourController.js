const tourService = require('../services/tourService');
const pool = require('../db');

const tourController = {
  createTour: async (req, res, next) => {
    try {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      const newTour = await tourService.createTour(req.body);
      res.status(201).json(newTour);
    } catch (err) {
      console.error('Error creating tour:', err);
      next(err);
    }
  },

  getAllTours: async (req, res, next) => {
    try {
      const tours = await tourService.getAllTours();
      res.json(tours);
    } catch (err) {
      console.error('Error fetching tours:', err);
      next(err);
    }
  },

  getFeaturedTours: async (req, res, next) => {
    try {
      const tours = await tourService.getFeaturedTours();
      res.json(tours);
    } catch (err) {
      console.error('Error fetching tours:', err);
      next(err);
    }
  },

  deleteTour: async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid tour ID' });
    }

    try {
      await tourService.deleteTourById(id);
      res.status(200).json({ message: 'Tour and its related data deleted successfully.' });
    } catch (err) {
      console.error('Error deleting tour:', err);
      res.status(500).json({ error: 'Failed to delete tour' });
    }
  },


  getTourBySlug: async (req, res, next) => {
    try {
      const tour = await tourService.getTourBySlug(req.params.slug);
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      const tourId = tour.id;
      const [[photos], [reviews], [rooms], [itinerary]] = await Promise.all([
        pool.query('SELECT id, url, caption, is_primary FROM tour_photos WHERE tour_id = ? ORDER BY display_order', [tourId]),
        pool.query('SELECT id, reviewer_name, rating, comment, date FROM tour_reviews WHERE tour_id = ? AND is_approved=1 ORDER BY date DESC', [tourId]),
        pool.query('SELECT id, name, description, max_occupancy FROM room_types WHERE tour_id = ?', [tourId]),
        pool.query('SELECT * FROM itinerary_days WHERE tour_id IN (?) ORDER BY day_number',
          [tourId]),
      ]);
      tour.photos = photos;
      tour.reviews = reviews;
      tour.room_types = rooms;
      tour.itinerary = itinerary;
      res.json(tour);
    } catch (err) {
      console.error('Error fetching tour by slug:', err);
      res.status(err.code || 500).json({ error: err.message });
    }
  },

  getToursByLocation: async (req, res, next) => {
    const locationId = Number(req.params.locationId);
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid locationId' });
    }
    try {
      const tours = await tourService.getToursByLocationId(locationId);
      if (tours.length === 0) {
        return res.status(404).json({ message: 'No tours found for this location' });
      }
      res.json(tours);
    } catch (err) {
      console.error('Error fetching tours by location:', err);
      next(err);
    }
  },

  getToursByDestination: async (req, res, next) => {
    const destId = Number(req.params.destId);
    if (isNaN(destId)) {
      return res.status(400).json({ error: 'Invalid destination ID' });
    }
    try {
      const tours = await tourService.getToursByDestination(destId);
      if (tours.length === 0) {
        return res.status(404).json({ message: 'No tours found for this destination' });
      }
      res.json(tours);
    } catch (err) {
      console.error('Error fetching tours by destination:', err);
      next(err);
    }
  },

  getToursByCategory: async (req, res, next) => {
    const { category } = req.params;
    try {
      const tours = await tourService.getToursByCategory(category);
      if (tours.length === 0) {
        return res.status(404).json({ message: 'No tours found for this category' });
      }
      res.json(tours);
    } catch (err) {
      console.error('Error fetching tours by category:', err);
      next(err);
    }
  },

  updateTour: async (req, res, next) => {
    const tourId = Number(req.params.id);
    if (isNaN(tourId)) {
      return res.status(400).json({ error: 'Invalid tour ID' });
    }
    try {
      console.log('Updating tour with ID:', tourId);
      const updated = await tourService.updateTour(tourId, req.body);
      res.json(updated);
    } catch (err) {
      console.error('Error updating tour:', err);
      res.status(400).json({ error: err.message || 'Failed to update tour' });
    }
  },

  getFilters: async (req, res, next) => {
    try {
      const [cities, categories] = await Promise.all([
        // tourService.getCities(),
        tourService.getTourCategories()
      ]);
      res.json({ cities, categories });
    } catch (err) {
      console.error('Error fetching filters:', err);
      next(err);
    }
  },

  getTourCategories: async (req, res, next) => {
    try {
      const categories = await tourService.getTourCategories();
      res.json(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  filterTours: async (req, res, next) => {
    try {
      const filters = req.query;
      const results = await tourService.filterTours(filters);
      res.json(results);
    } catch (err) {
      console.error('Error filtering tours:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  searchTours: async (req, res, next) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const tours = await tourService.filterTours(query); // this expects a "q"
      res.json(tours);
    } catch (err) {
      console.error('Error searching tours:', err);
      next(err);
    }
  },

  addOrUpdateTourLocation: async (req, res, next) => {
    try {
      const { tour_id, location_id } = req.body;

      if (!tour_id || !location_id) {
        return res.status(400).json({ message: 'tour_id and location_id are required' });
      }

      const result = await tourService.addOrUpdate(tour_id, location_id);
      return res.status(200).json({ message: 'Tour location mapping saved', result });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = tourController;