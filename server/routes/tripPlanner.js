const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    const params = req.body.queryResult?.parameters || {};

    // Destructure and fallback to null if undefined
    const destination = params.destination || null;
    const days = params.days || null;
    const month = params.month || null;
    const adults = params.adults || 0;
    const children = params.children || 0;
    const hotelCategory = params.hotelCategory || null;
    const email = params.email || null;
    const phone = params.phone || null;

    // Safely handle preferences
    const safePreferences = Array.isArray(params.preferences)
      ? params.preferences.join(',')
      : null;

    const totalGuests = adults + children;
    const basePrice = hotelCategory?.toLowerCase() === 'luxury'
      ? 12000
      : hotelCategory?.toLowerCase() === 'premium'
        ? 9000
        : 6000;

    const min = totalGuests * basePrice * days;
    const max = min + (basePrice * totalGuests * 0.5);

    // Execute insert with sanitized values
    await db.execute(
      `INSERT INTO TripInquiries 
        (destination, days, month, adults, children, hotel_category, preferences, email, phone, budget_min, budget_max)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        destination,
        days,
        month,
        adults,
        children,
        hotelCategory,
        safePreferences,
        email,
        phone,
        min || 0,
        max || 0
      ]
    );

    // Respond to Dialogflow
    return res.json({
      fulfillmentText: `Your estimated trip budget for ${destination || 'your destination'} is ₹${min.toLocaleString()} – ₹${max.toLocaleString()}. We'll contact you shortly at ${email}.`
    });

  } catch (error) {
    console.error('Trip Planner Error:', error);
    return res.json({
      fulfillmentText: "Oops! Something went wrong while planning your trip. Please try again later."
    });
  }
});

module.exports = router;
// This route handles trip planning inquiries from Dialogflow