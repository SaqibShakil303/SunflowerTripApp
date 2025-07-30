const pool = require('../db');

async function addItinerary(data) {
  const sql = `INSERT INTO itineraries
    (name, email, phone, destination, travelers, children, child_ages, duration, date, budget, hotel_category, travel_type, occupation, preferences)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const childAgesJson = JSON.stringify(data.childAges);
  const params = [
    data.name, data.email, data.phone, data.destination,
    data.travelers, data.children, childAgesJson,
    data.duration, data.date, data.budget,
    data.hotelCategory, data.travelType,
    data.occupation, data.preferences
  ];
  const [result] = await pool.query(sql, params);
  return result.insertId;
}

async function getAllItineraries() {
  const [rows] = await pool.query(
    'SELECT * FROM itineraries ORDER BY created_at DESC'
  );
  // parse JSON in child_ages
  return rows.map(r => ({ ...r, childAges: JSON.parse(r.child_ages) }));
}

module.exports = { addItinerary, getAllItineraries };