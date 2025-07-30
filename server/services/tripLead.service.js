const db = require('../db');

exports.saveTripLead = async (lead) => {
  const query = `
    INSERT INTO trip_leads (
      full_name, email, phone_number, preferred_country, preferred_city,
      departure_date, return_date, number_of_days,
      number_of_adults, number_of_children, number_of_male, number_of_female, number_of_other,
      aged_persons, hotel_rating, meal_plan, room_type,
      need_flight, departure_airport, trip_type, estimate_range
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    lead.full_name,
    lead.email,
    lead.phone_number,
    lead.preferred_country || null,
    lead.preferred_city || null,
    lead.departure_date || null,
    lead.return_date || null,
    lead.number_of_days || 0,
    lead.number_of_adults || 0,
    lead.number_of_children || 0,
    lead.number_of_male || 0,
    lead.number_of_female || 0,
    lead.number_of_other || 0,
    JSON.stringify(lead.aged_persons || []),
    lead.hotel_rating || null,
    lead.meal_plan || null,
    lead.room_type || null,
    !!lead.need_flight,
    lead.departure_airport || null,
    lead.trip_type || '',
    lead.estimate_range || ''
  ];

  const [result] = await db.execute(query, values);
  return result;
};

exports.getAllTripLeads = async () => {
  const query = `
    SELECT 
      id, full_name, email, phone_number, preferred_country, preferred_city,
      departure_date, return_date, number_of_days,
      number_of_adults, number_of_children, number_of_male, number_of_female, number_of_other,
      aged_persons, hotel_rating, meal_plan, room_type,
      need_flight, departure_airport, trip_type, estimate_range
    FROM trip_leads
  `;
  const [rows] = await db.execute(query);
  return rows.map(row => ({
    ...row,
    aged_persons: row.aged_persons ? JSON.parse(row.aged_persons) : []
  }));
};

exports.deleteTripLead = async (id) => {
  const query = `DELETE FROM trip_leads WHERE id = ?`;
  const [result] = await db.execute(query, [id]);
  return result;
};