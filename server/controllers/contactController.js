// controllers/contactController.js
// Handles request/response mapping
const contactService = require('../services/contactService');
const { enquirySchema, bookingSchema } = require('../models/contactModel');
const validator = require('validator');
async function addContact(req, res, next) {
  try {
    const id = await contactService.createContact(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}


async function fetchAllContacts(req, res, next) {
  try {
    const contacts = await contactService.getAllContacts();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
}

async function removeContact(req, res, next) {
  try {
    await contactService.deleteContact(req.params.contact_id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}
 async function submitEnquiry(req, res) {
    try {
      const data = req.body;

      // Basic validation
      if (!data.tourId || !data.name || !data.email || !data.phone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (!validator.isEmail(data.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      if (!/^\d{10}$/.test(data.phone)) {
        return res.status(400).json({ error: 'Phone must be 10 digits' });
      }

      const enquiry = {
        tour_id: parseInt(data.tourId),
        name: data.name,
        email: data.email,
        phone: data.phone,
        description: data.description || null
      };

      const result = await contactService.createEnquiry(enquiry);
      res.status(201).json({ id: result.id, message: 'Enquiry submitted successfully' });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }



async function submitBooking(req, res) {
    try {
      const data = req.body;

      // Basic validation
      if (!data.tourId || !data.name || !data.email || !data.phone || !data.adults || !data.children || !data.hotelRating || !data.mealPlan || !data.travelDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (!validator.isEmail(data.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      if (!/^\d{10}$/.test(data.phone)) {
        return res.status(400).json({ error: 'Phone must be 10 digits' });
      }
      if (!['3', '4', '5'].includes(data.hotelRating)) {
        return res.status(400).json({ error: 'Invalid hotel rating' });
      }
      if (!['no-meal', 'breakfast'].includes(data.mealPlan)) {
        return res.status(400).json({ error: 'Invalid meal plan' });
      }
      if (data.flightOption && !['with-flight', 'without-flight'].includes(data.flightOption)) {
        return res.status(400).json({ error: 'Invalid flight option' });
      }
      if (data.childAges && (!Array.isArray(data.childAges) || data.childAges.length !== data.children)) {
        return res.status(400).json({ error: 'Child ages must match number of children' });
      }

      const booking = {
        tour_id: parseInt(data.tourId),
        name: data.name,
        email: data.email,
        phone: data.phone,
        days: data.days ? parseInt(data.days) : null,
        adults: parseInt(data.adults),
        children: parseInt(data.children),
        child_ages: data.childAges || [],
        hotel_rating: data.hotelRating,
        meal_plan: data.mealPlan,
        flight_option: data.flightOption || null,
        flight_number: data.flightNumber || null,
        travel_date: data.travelDate
      };

      const result = await contactService.createBooking(booking);
      res.status(201).json({ id: result.id, message: 'Booking submitted successfully' });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  async function fetchAllEnquiry(req, res, next) {
  try {
    const enquiries = await contactService.getAllEnquiries();
    res.json(enquiries);
  } catch (err) {
    next(err);
  }
}

async function removeEnquiry(req, res, next) {
  try {
    await contactService.deleteEnquiry(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

async function fetchAllBooking(req, res, next) {
  try {
    const bookings = await contactService.getAllBookings();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

async function removeBooking(req, res, next) {
  try {
    await contactService.deleteBooking(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

module.exports = { addContact,
  fetchAllContacts,
  removeContact,
  submitEnquiry,
  submitBooking,
  fetchAllEnquiry,
  removeEnquiry,
  fetchAllBooking,
  removeBooking };