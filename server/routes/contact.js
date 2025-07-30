// Defines the API endpoints and binds them to controllers
const express = require('express');
const router  = express.Router();
const contactController = require('../controllers/contactController');

router.post('/AddContact',   contactController.addContact);
router.get('/GetAllContact', contactController.fetchAllContacts);
router.delete('/deleteContact/:contact_id', contactController.removeContact);
// POST /api/contact/enquiries
router.post('/enquiries', contactController.submitEnquiry);
router.get('/GetAllEnquiries', contactController.fetchAllEnquiry);
router.delete('/deleteEnquiry/:id', contactController.removeEnquiry);

// POST /api/contact/bookings
router.post('/bookings', contactController.submitBooking);
router.get('/GetAllBookings', contactController.fetchAllBooking);
router.delete('/deleteBooking/:id', contactController.removeBooking);
module.exports = router;
