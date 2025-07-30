// Defines the Contact structure (optional for type clarity)
class Contact {
  constructor({ contact_id, first_name, email, phone_number, subject, message }) {
    this.contact_id   = contact_id;
    this.first_name   = first_name;
    this.email        = email;
    this.phone_number = phone_number;
    this.subject      = subject;
    this.message      = message;
  }
}
const enquirySchema = {
  tour_id: { type: 'integer', required: true },
  name: { type: 'string', required: true, maxLength: 255 },
  email: { type: 'string', required: true, maxLength: 255, format: 'email' },
  phone: { type: 'string', required: true, maxLength: 15, pattern: /^\d{10}$/ },
  description: { type: 'string', required: false, maxLength: 65535 } // TEXT column
};
 
const bookingSchema = {
  tour_id: { type: 'integer', required: true },
  name: { type: 'string', required: true, maxLength: 255 },
  email: { type: 'string', required: true, maxLength: 255, format: 'email' },
  phone: { type: 'string', required: true, maxLength: 15, pattern: /^\d{10}$/ },
  days: { type: 'integer', required: false, min: 1 },
  adults: { type: 'integer', required: true, min: 1 },
  children: { type: 'integer', required: true, min: 0 },
  child_ages: { type: 'array', required: false, items: { type: 'integer', min: 1, max: 12 } },
  hotel_rating: { type: 'string', required: true, enum: ['3', '4', '5'] },
  meal_plan: { type: 'string', required: true, enum: ['no-meal', 'breakfast'] },
  flight_option: { type: 'string', required: false, enum: ['with-flight', 'without-flight'] },
  flight_number: { type: 'string', required: false, maxLength: 50 },
  travel_date: { type: 'string', required: true, format: 'date' }
};

module.exports = {Contact,enquirySchema,bookingSchema};