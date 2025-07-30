// Contains business logic and DB queries
const pool = require('../db');

async function createContact({ contact_id, first_name, email, phone_number, subject, message }) {
  const sql = `INSERT INTO contacts
    (contact_id, first_name, email, phone_number, subject, message)
    VALUES (?, ?, ?, ?, ?, ?)`;
  const [result] = await pool.query(sql, [
    contact_id, first_name, email, phone_number, subject, message
  ]);
  return result.insertId;
}


async function getAllContacts() {
  const [rows] = await pool.query(
    'SELECT * FROM contacts ORDER BY created_at DESC'
  );
  return rows;
}

async function deleteContact(contact_id) {
  await pool.query(
    'DELETE FROM contacts WHERE contact_id = ?',
    [contact_id]
  );
}

async function getContactsByDateRange(start, end) {
  const [rows] = await pool.query(
    `SELECT * FROM contacts
       WHERE created_at BETWEEN ? AND ?
       ORDER BY created_at ASC`,
    [ start, end ]
  );
  return rows;
}

 async function createEnquiry(enquiry) {
    try {
      // Verify tour exists
      const [tour] = await pool.query('SELECT id FROM tours WHERE id = ?', [enquiry.tour_id]);
      if (!tour.length) {
        const error = new Error('Tour not found');
        error.status = 404;
        throw error;
      }

      const [result] = await pool.query(
        'INSERT INTO enquiries (tour_id, name, email, phone, description) VALUES (?, ?, ?, ?, ?)',
        [enquiry.tour_id, enquiry.name, enquiry.email, enquiry.phone, enquiry.description]
      );

      return { id: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  async function createBooking(booking) {
    try {
      // Verify tour exists and validate constraints
      const [tour] = await pool.query(
        'SELECT id, is_customizable, category, available_from, available_to FROM tours WHERE id = ?',
        [booking.tour_id]
      );
      if (!tour.length) {
        const error = new Error('Tour not found');
        error.status = 404;
        throw error;
      }

      const tourData = tour[0];
      if (booking.days && !tourData.is_customizable) {
        const error = new Error('Tour is not customizable');
        error.status = 400;
        throw error;
      }
      if (new Date(booking.travel_date) < new Date(tourData.available_from) || new Date(booking.travel_date) > new Date(tourData.available_to)) {
        const error = new Error('Travel date is outside available range');
        error.status = 400;
        throw error;
      }
      if (booking.flight_option === 'with-flight' && tourData.category === 'holiday') {
        const error = new Error('With-flight option not available for holiday tours');
        error.status = 400;
        throw error;
      }

      const [result] = await pool.query(
        'INSERT INTO bookings (tour_id, name, email, phone, days, adults, children, child_ages, hotel_rating, meal_plan, flight_option, flight_number, travel_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          booking.tour_id,
          booking.name,
          booking.email,
          booking.phone,
          booking.days,
          booking.adults,
          booking.children,
          JSON.stringify(booking.child_ages),
          booking.hotel_rating,
          booking.meal_plan,
          booking.flight_option,
          booking.flight_number,
          booking.travel_date
        ]
      );

      return { id: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  async function getAllEnquiries() {
  const [rows] = await pool.query(
    'SELECT * FROM enquiries ORDER BY created_at DESC'
  );
  return rows;
}

async function deleteEnquiry(id) {
  await pool.query(
    'DELETE FROM enquiries WHERE id = ?',
    [id]
  );
}

async function getAllBookings() {
  const [rows] = await pool.query(
    'SELECT * FROM bookings ORDER BY created_at DESC'
  );
  return rows;
}

async function deleteBooking(id) {
  await pool.query(
    'DELETE FROM bookings WHERE id = ?',
    [id]
  );
}


module.exports = {  createContact,
  getAllContacts,
  deleteContact,
  getContactsByDateRange,
  createEnquiry,
  createBooking,
  getAllEnquiries,
  deleteEnquiry,
  getAllBookings,
  deleteBooking};