class Tour {
  static schema = {
    // destination_id: { type: 'number', required: true },
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    description: { type: 'string', required: true },
    duration_days: { type: 'number', required: false },
    price: { type: 'number', required: false },
    image_url: { type: 'string', required: false },
    map_embed_url: { type: 'string', required: false },
    category: { type: 'string', required: false },
    available_from: { type: 'string', required: false },
    available_to: { type: 'string', required: false },
    departure_airport: { type: 'string', required: false },
    arrival_airport: { type: 'string', required: false },
    max_group_size: { type: 'number', required: false },
    min_group_size: { type: 'number', required: false },
    inclusions: { type: 'array', required: false },
    exclusions: { type: 'array', required: false },
    complementaries: { type: 'array', required: false },
    highlights: { type: 'array', required: false },
    booking_terms: { type: 'string', required: false },
    cancellation_policy: { type: 'string', required: false },
    meta_title: { type: 'string', required: false },
    meta_description: { type: 'string', required: false },
    price_per_person: { type: 'number', required: false },
    price_currency: { type: 'string', required: false, default: 'INR' },
    early_bird_discount: { type: 'number', required: false },
    group_discount: { type: 'number', required: false },
    difficulty_level: {
      type: 'string',
      required: false,
      validate: (value) => ['Easy', 'Moderate', 'Challenging', 'Extreme'].includes(value),
    },
    physical_requirements: { type: 'string', required: false },
    best_time_to_visit: { type: 'string', required: false },
    weather_info: { type: 'string', required: false },
    packing_list: { type: 'array', required: false },
    languages_supported: { type: 'array', required: false },
    guide_included: { type: 'boolean', required: false, default: true },
    guide_languages: { type: 'array', required: false },
    transportation_included: { type: 'boolean', required: false, default: true },
    transportation_details: { type: 'string', required: false },
    meals_included: { type: 'array', required: false },
    dietary_restrictions_supported: { type: 'array', required: false },
    accommodation_type: { type: 'string', required: false },
    accommodation_rating: { type: 'number', required: false },
    activity_types: { type: 'array', required: false },
    interests: { type: 'array', required: false },
    instant_booking: { type: 'boolean', required: false, default: false },
    requires_approval: { type: 'boolean', required: false, default: true },
    advance_booking_days: { type: 'number', required: false, default: 7 },
    is_active: { type: 'boolean', required: false, default: true },
    is_featured: { type: 'boolean', required: false, default: false },
    adults: { type: 'number', required: false, default: 0 },
    children: { type: 'number', required: false, default: 0 },
    rooms: { type: 'number', required: false, default: 1 },
    is_customizable: { type: 'boolean', required: false, default: false },
    flight_included: { type: 'boolean', required: false, default: false },
    departures: {
      type: 'array',
      required: false,
      validate: (value, data) => {
        if (data.category === 'group') {
          if (!Array.isArray(value) || value.length === 0) {
            return false;
          }
          return value.every(dep =>
            dep.departure_date &&
            typeof dep.departure_date === 'string' &&
            !isNaN(Date.parse(dep.departure_date)) &&
            dep.available_seats != null &&
            typeof dep.available_seats === 'number' &&
            dep.available_seats >= 1
          );
        }
        return true;
      }
    },
  };

  static validate(data) {
    const errors = [];
    Object.keys(this.schema).forEach((key) => {
      const { type, required, validate, default: def } = this.schema[key];
      const value = data[key] !== undefined ? data[key] : def;

      if (required && value === undefined) {
        errors.push(`Missing required field: ${key}`);
      }
      if (value !== undefined && value !== null) {
        if (type === 'number' && isNaN(parseFloat(value))) {
          errors.push(`${key} must be a valid number`);
        }
        if (type === 'string' && typeof value !== 'string') {
          errors.push(`${key} must be a string`);
        }
        if (type === 'array' && !Array.isArray(value)) {
          errors.push(`${key} must be an array`);
        }
        if (type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${key} must be a boolean`);
        }
        if (validate && !validate(value, data)) {
          errors.push(`Invalid value for ${key}`);
        }
      }
    });
    if (errors.length) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }
    return { ...data };
  }

  static getInsertValues(data) {
    const d = this.validate(data);
    return [
      d.title,
      d.slug,
      d.description,
      d.duration_days || null,
      d.price || null,
      d.image_url || null,
      d.map_embed_url || null,
      d.category || null,
      d.available_from || null,
      d.available_to || null,
      d.departure_airport || null,
      d.arrival_airport || null,
      d.max_group_size || null,
      d.min_group_size || null,
      JSON.stringify(d.inclusions || []),
      JSON.stringify(d.exclusions || []),
      JSON.stringify(d.complementaries || []),
      JSON.stringify(d.highlights || []),
      d.booking_terms || null,
      d.cancellation_policy || null,
      d.meta_title || null,
      d.meta_description || null,
      d.price_per_person || null,
      d.price_currency || 'INR',
      d.early_bird_discount || null,
      d.group_discount || null,
      d.difficulty_level || null,
      d.physical_requirements || null,
      d.best_time_to_visit || null,
      d.weather_info || null,
      JSON.stringify(d.packing_list || []),
      JSON.stringify(d.languages_supported || []),
      d.guide_included ? 1 : 0,
      JSON.stringify(d.guide_languages || []),
      d.transportation_included ? 1 : 0,
      d.transportation_details || null,
      JSON.stringify(d.meals_included || []),
      JSON.stringify(d.dietary_restrictions_supported || []),
      d.accommodation_type || null,
      d.accommodation_rating || null,
      JSON.stringify(d.activity_types || []),
      JSON.stringify(d.interests || []),
      d.instant_booking ? 1 : 0,
      d.requires_approval ? 1 : 0,
      d.advance_booking_days || 7,
      d.is_active ? 1 : 0,
      d.is_featured ? 1 : 0,
      d.adults || 0,
      d.children || 0,
      d.rooms || 1,
      d.is_customizable ? 1 : 0,
      d.flight_included ? 1 : 0,
    ];
  }

  constructor(data) {
    Object.assign(this, data);
    [
      'inclusions', 'exclusions', 'complementaries', 'highlights', 'packing_list',
      'languages_supported', 'guide_languages', 'meals_included',
      'dietary_restrictions_supported', 'activity_types', 'interests'
    ].forEach(field => {
      if (typeof this[field] === 'string') {
        try {
          this[field] = JSON.parse(this[field] || '[]');
        } catch (e) {
          console.error(`Failed to parse field ${field}:`, e);
          this[field] = [];
        }
      }
    });
    // Ensure departures is an array
    this.departures = Array.isArray(data.departures) ? data.departures : [];
  }
}

module.exports = Tour;