const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const pool = require('../db');


router.get('/filters', tourController.filterTours);

// GET distinct categories
router.get('/categories', tourController.getTourCategories);

router.post('/AddLocation', tourController.addOrUpdateTourLocation);
// GET all tours
router.get('/', tourController.getAllTours);
// GET featured tours
router.get('/getFeaturedTours', tourController.getFeaturedTours);

// // GET tours by location
// router.get('/location/:location', tourController.getToursByDestination);


// router.get('/search/q', tourController.searchTours);



// POST tour
router.post('/AddTour', tourController.createTour);

// GET tours by destination
router.get('/:destId/destination', tourController.getToursByDestination);
router.get('/:locationId/location', tourController.getToursByLocation);

// NEW: fetch by category
router.get('/category/:category', tourController.getToursByCategory);

// NEW: update a tour
router.patch('/Update/:id', tourController.updateTour);
// Add in routes/tours.js temporarily
// router.get('/debug/all', async (req, res) => {
//   try {
//     const [results] = await pool.query('SELECT * FROM tours'); // ✅ Promise style
//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
router.delete('/:id', tourController.deleteTour);
// // GET tour by slug (for detail page)
router.get('/:slug', tourController.getTourBySlug);

module.exports = router;
