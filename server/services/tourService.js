const db = require('../db');
const Tour = require('../models/tours');

async function getAllTours() {
  const [tours] = await db.query(`
    SELECT 
      t.*, 
      GROUP_CONCAT(DISTINCT td.destination_id) AS destination_ids,
      GROUP_CONCAT(DISTINCT d.title) AS destination_titles,
      GROUP_CONCAT(DISTINCT tl.location_id) AS location_ids,
      GROUP_CONCAT(DISTINCT l.name) AS location_names
    FROM tours t
    LEFT JOIN tour_destinations td ON t.id = td.tour_id
    LEFT JOIN destinations d ON td.destination_id = d.id
    LEFT JOIN tour_locations tl ON t.id = tl.tour_id
    LEFT JOIN locations l ON tl.location_id = l.id
    GROUP BY t.id
  `);

  if (!tours.length) return [];

  const tourIds = tours.map(t => t.id);

  // Batch fetch related data
  const [photos] = await db.query(
    'SELECT * FROM tour_photos WHERE tour_id IN (?) ORDER BY display_order',
    [tourIds]
  );
  const [reviews] = await db.query(
    'SELECT * FROM tour_reviews WHERE tour_id IN (?) AND is_approved = 1 ORDER BY date DESC',
    [tourIds]
  );
  const [rooms] = await db.query(
    'SELECT * FROM room_types WHERE tour_id IN (?)',
    [tourIds]
  );
  const [itineraries] = await db.query(
    'SELECT * FROM itinerary_days WHERE tour_id IN (?) ORDER BY day_number',
    [tourIds]
  );
  const [departures] = await db.query(
    'SELECT tour_id, departure_date, available_seats FROM tour_departures WHERE tour_id IN (?) ORDER BY departure_date',
    [tourIds]
  );

  // Group related data by tour_id
  const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
      (acc[item[key]] = acc[item[key]] || []).push(item);
      return acc;
    }, {});

  const groupedPhotos = groupBy(photos, 'tour_id');
  const groupedReviews = groupBy(reviews, 'tour_id');
  const groupedRooms = groupBy(rooms, 'tour_id');
  const groupedItineraries = groupBy(itineraries, 'tour_id');
  const groupedDepartures = groupBy(departures, 'tour_id');

  // Attach to each tour
  return tours.map(tour => {
    const itineraryWithParsedJSON = (groupedItineraries[tour.id] || []).map(day => ({
      ...day,
      activities: day.activities ? JSON.parse(day.activities) : [],
      meals_included: day.meals_included ? JSON.parse(day.meals_included) : []
    }));

    return new Tour({
      ...tour,
      destination_ids: tour.destination_ids ? tour.destination_ids.split(',').map(id => +id) : [],
      destination_titles: tour.destination_titles ? tour.destination_titles.split(',') : [],
      location_ids: tour.location_ids ? tour.location_ids.split(',').map(id => +id) : [],
      location_names: tour.location_names ? tour.location_names.split(',') : [],
      photos: groupedPhotos[tour.id] || [],
      reviews: groupedReviews[tour.id] || [],
      room_types: groupedRooms[tour.id] || [],
      itinerary: itineraryWithParsedJSON,
      departures: groupedDepartures[tour.id] || [],
    });
  });
}

async function getTourBySlug(slug) {
  const [tours] = await db.query(`
    SELECT 
      t.*, 
      GROUP_CONCAT(DISTINCT td.destination_id) AS destination_ids,
      GROUP_CONCAT(DISTINCT d.title) AS destination_titles,
      GROUP_CONCAT(DISTINCT tl.location_id) AS location_ids,
      GROUP_CONCAT(DISTINCT l.name) AS location_names
    FROM tours t
    LEFT JOIN tour_destinations td ON t.id = td.tour_id
    LEFT JOIN destinations d ON td.destination_id = d.id
    LEFT JOIN tour_locations tl ON t.id = tl.tour_id
    LEFT JOIN locations l ON tl.location_id = l.id
    WHERE t.slug = ? AND t.is_active = 1
    GROUP BY t.id
  `, [slug]);

  if (!tours.length) {
    throw { code: 404, message: 'Tour not found' };
  }

  const tour = tours[0];
  const tourId = tour.id;

  const [photos] = await db.query(
    'SELECT * FROM tour_photos WHERE tour_id = ? ORDER BY display_order',
    [tourId]
  );
  const [reviews] = await db.query(
    'SELECT * FROM tour_reviews WHERE tour_id = ? AND is_approved = 1 ORDER BY date DESC',
    [tourId]
  );
  const [rooms] = await db.query(
    'SELECT * FROM room_types WHERE tour_id = ?',
    [tourId]
  );
  const [itineraries] = await db.query(
    'SELECT * FROM itinerary_days WHERE tour_id = ? ORDER BY day_number',
    [tourId]
  );
  const [departures] = await db.query(
    'SELECT departure_date, available_seats FROM tour_departures WHERE tour_id = ? ORDER BY departure_date',
    [tourId]
  );

  return new Tour({
    ...tour,
    destination_ids: tour.destination_ids ? tour.destination_ids.split(',').map(id => +id) : [],
    destination_titles: tour.destination_titles ? tour.destination_titles.split(',') : [],
    location_ids: tour.location_ids ? tour.location_ids.split(',').map(id => +id) : [],
    location_names: tour.location_names ? tour.location_names.split(',') : [],
    photos: photos || [],
    reviews: reviews || [],
    room_types: rooms || [],
    itinerary: itineraries.map(day => ({
      ...day,
      activities: day.activities ? JSON.parse(day.activities) : [],
      meals_included: day.meals_included ? JSON.parse(day.meals_included) : []
    })),
    departures: departures || [],
  });
}
async function getToursByDestination(destinationId) {
  const [tours] = await db.query(`
    SELECT t.*,
           GROUP_CONCAT(DISTINCT td.destination_id) AS destination_ids,
           GROUP_CONCAT(DISTINCT d.title) AS destination_titles,
           GROUP_CONCAT(DISTINCT tl.location_id) AS location_ids,
           GROUP_CONCAT(DISTINCT l.name) AS location_names
    FROM tours t
    LEFT JOIN tour_destinations td ON t.id = td.tour_id
    LEFT JOIN destinations d ON td.destination_id = d.id
    LEFT JOIN tour_locations tl ON t.id = tl.tour_id
    LEFT JOIN locations l ON tl.location_id = l.id
    WHERE t.destination_id = ?
    GROUP BY t.id
  `, [destinationId]);

  if (!tours.length) return [];

  const tourIds = tours.map(t => t.id);

  const [photos] = await db.query(
    'SELECT * FROM tour_photos WHERE tour_id IN (?) ORDER BY display_order',
    [tourIds]
  );
  const [reviews] = await db.query(
    'SELECT * FROM tour_reviews WHERE tour_id IN (?) AND is_approved = 1 ORDER BY date DESC',
    [tourIds]
  );
  const [rooms] = await db.query(
    'SELECT * FROM room_types WHERE tour_id IN (?)',
    [tourIds]
  );
  const [itineraries] = await db.query(
    'SELECT * FROM itinerary_days WHERE tour_id IN (?) ORDER BY day_number',
    [tourIds]
  );
  const [departures] = await db.query(
    'SELECT tour_id, departure_date, available_seats FROM tour_departures WHERE tour_id IN (?) ORDER BY departure_date',
    [tourIds]
  );

  const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
      (acc[item[key]] = acc[item[key]] || []).push(item);
      return acc;
    }, {});

  const groupedPhotos = groupBy(photos, 'tour_id');
  const groupedReviews = groupBy(reviews, 'tour_id');
  const groupedRooms = groupBy(rooms, 'tour_id');
  const groupedItineraries = groupBy(itineraries, 'tour_id');
  const groupedDepartures = groupBy(departures, 'tour_id');

  return tours.map(tour => new Tour({
    ...tour,
    destination_ids: tour.destination_ids ? tour.destination_ids.split(',').map(id => +id) : [],
    destination_titles: tour.destination_titles ? tour.destination_titles.split(',') : [],
    location_ids: tour.location_ids ? tour.location_ids.split(',').map(id => +id) : [],
    location_names: tour.location_names ? tour.location_names.split(',') : [],
    photos: groupedPhotos[tour.id] || [],
    reviews: groupedReviews[tour.id] || [],
    room_types: groupedRooms[tour.id] || [],
    itinerary: (groupedItineraries[tour.id] || []).map(day => ({
      ...day,
      activities: day.activities ? JSON.parse(day.activities) : [],
      meals_included: day.meals_included ? JSON.parse(day.meals_included) : []
    })),
    departures: groupedDepartures[tour.id] || [],
  }));
}
async function getToursByCategory(category) {
  const [tours] = await db.query(`
    SELECT t.*,
           d.title AS destination_title,
           GROUP_CONCAT(tl.location_id) AS location_ids,
           GROUP_CONCAT(l.name) AS location_names
    FROM tours t
    LEFT JOIN destinations d ON t.destination_id = d.id
    LEFT JOIN tour_locations tl ON t.id = tl.tour_id
    LEFT JOIN locations l ON tl.location_id = l.id
    WHERE t.category = ?
    GROUP BY t.id
  `, [category]);

  if (!tours.length) return [];

  const tourIds = tours.map(t => t.id);

  const [photos] = await db.query(
    'SELECT * FROM tour_photos WHERE tour_id IN (?) ORDER BY display_order',
    [tourIds]
  );
  const [reviews] = await db.query(
    'SELECT * FROM tour_reviews WHERE tour_id IN (?) AND is_approved = 1 ORDER BY date DESC',
    [tourIds]
  );
  const [rooms] = await db.query(
    'SELECT * FROM room_types WHERE tour_id IN (?)',
    [tourIds]
  );
  const [itineraries] = await db.query(
    'SELECT * FROM itinerary_days WHERE tour_id IN (?) ORDER BY day_number',
    [tourIds]
  );
  const [departures] = await db.query(
    'SELECT tour_id, departure_date, available_seats FROM tour_departures WHERE tour_id IN (?) ORDER BY departure_date',
    [tourIds]
  );

  const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
      (acc[item[key]] = acc[item[key]] || []).push(item);
      return acc;
    }, {});

  const groupedPhotos = groupBy(photos, 'tour_id');
  const groupedReviews = groupBy(reviews, 'tour_id');
  const groupedRooms = groupBy(rooms, 'tour_id');
  const groupedItineraries = groupBy(itineraries, 'tour_id');
  const groupedDepartures = groupBy(departures, 'tour_id');

  return tours.map(tour => new Tour({
    ...tour,
    destination_title: tour.destination_title,
    location_ids: tour.location_ids ? tour.location_ids.split(',').map(id => +id) : [],
    location_names: tour.location_names ? tour.location_names.split(',') : [],
    photos: groupedPhotos[tour.id] || [],
    reviews: groupedReviews[tour.id] || [],
    room_types: groupedRooms[tour.id] || [],
    itinerary: (groupedItineraries[tour.id] || []).map(day => ({
      ...day,
      activities: day.activities ? JSON.parse(day.activities) : [],
      meals_included: day.meals_included ? JSON.parse(day.meals_included) : []
    })),
    departures: groupedDepartures[tour.id] || [],
  }));
}

async function getFeaturedTours() {
  const [tours] = await db.query(`
    SELECT t.*,
           d.title AS destination_title,
           GROUP_CONCAT(tl.location_id) AS location_ids,
           GROUP_CONCAT(l.name) AS location_names
    FROM tours t
    LEFT JOIN destinations d ON t.destination_id = d.id
    LEFT JOIN tour_locations tl ON t.id = tl.tour_id
    LEFT JOIN locations l ON tl.location_id = l.id
    WHERE t.is_featured = 1 AND t.is_active = 1
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);

  if (!tours.length) return [];

  const tourIds = tours.map(t => t.id);

  const [photos] = await db.query(
    'SELECT * FROM tour_photos WHERE tour_id IN (?) ORDER BY display_order',
    [tourIds]
  );
  const [reviews] = await db.query(
    'SELECT * FROM tour_reviews WHERE tour_id IN (?) AND is_approved = 1 ORDER BY date DESC',
    [tourIds]
  );
  const [rooms] = await db.query(
    'SELECT * FROM room_types WHERE tour_id IN (?)',
    [tourIds]
  );
  const [itineraries] = await db.query(
    'SELECT * FROM itinerary_days WHERE tour_id IN (?) ORDER BY day_number',
    [tourIds]
  );
  const [departures] = await db.query(
    'SELECT tour_id, departure_date, available_seats FROM tour_departures WHERE tour_id IN (?) ORDER BY departure_date',
    [tourIds]
  );

  const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
      (acc[item[key]] = acc[item[key]] || []).push(item);
      return acc;
    }, {});

  const groupedPhotos = groupBy(photos, 'tour_id');
  const groupedReviews = groupBy(reviews, 'tour_id');
  const groupedRooms = groupBy(rooms, 'tour_id');
  const groupedItineraries = groupBy(itineraries, 'tour_id');
  const groupedDepartures = groupBy(departures, 'tour_id');

  return tours.map(tour => new Tour({
    ...tour,
    destination_title: tour.destination_title,
    location_ids: tour.location_ids ? tour.location_ids.split(',').map(id => +id) : [],
    location_names: tour.location_names ? tour.location_names.split(',') : [],
    photos: groupedPhotos[tour.id] || [],
    reviews: groupedReviews[tour.id] || [],
    room_types: groupedRooms[tour.id] || [],
    itinerary: (groupedItineraries[tour.id] || []).map(day => ({
      ...day,
      activities: day.activities ? JSON.parse(day.activities) : [],
      meals_included: day.meals_included ? JSON.parse(day.meals_included) : []
    })),
    departures: groupedDepartures[tour.id] || [],
  }));
}

async function createTour(data) {
  const {
    location_ids = [],
    destination_ids = [], // Added to accept array
    itinerary = [],
    photos = [],
    reviews = [],
    room_types = [],
    departures = [],
    ...tourData
  } = data;

  const validFields = Object.keys(Tour.schema).filter(key => key !== 'destination_id' && key !== 'departures');
  const unexpectedFields = Object.keys(tourData).filter(key => !validFields.includes(key));
  if (unexpectedFields.length) {
    throw new Error(`Unexpected fields in input: ${unexpectedFields.join(', ')}`);
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Validate and prepare tour data
    const tourValues = Tour.getInsertValues(tourData);

    const columns = [
      'title', 'slug', 'description', 'duration_days', 'price', 'image_url', 'map_embed_url', 'category',
      'available_from', 'available_to', 'departure_airport', 'arrival_airport', 'max_group_size', 'min_group_size',
      'inclusions', 'exclusions', 'complementaries', 'highlights', 'booking_terms', 'cancellation_policy',
      'meta_title', 'meta_description', 'price_per_person', 'price_currency', 'early_bird_discount', 'group_discount',
      'difficulty_level', 'physical_requirements', 'best_time_to_visit', 'weather_info', 'packing_list',
      'languages_supported', 'guide_included', 'guide_languages', 'transportation_included', 'transportation_details',
      'meals_included', 'dietary_restrictions_supported', 'accommodation_type', 'accommodation_rating',
      'activity_types', 'interests', 'instant_booking', 'requires_approval', 'advance_booking_days', 'is_active',
      'is_featured', 'adults', 'children', 'rooms', 'is_customizable', 'flight_included'
    ];

    const [tourResult] = await connection.query(
      `INSERT INTO tours (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      tourValues
    );

    const tourId = tourResult.insertId;

    // Insert destination_ids into tour_destinations
    if (destination_ids.length) {
      const destinationValues = destination_ids.map(destId => [tourId, destId]);
      await connection.query(
        `INSERT INTO tour_destinations (tour_id, destination_id) VALUES ?`,
        [destinationValues]
      );
    } else {
      throw new Error('At least one destination is required');
    }

    // Insert tour_locations
    if (location_ids.length) {
      const locationValues = location_ids.map(locId => [tourId, locId]);
      await connection.query(
        `INSERT INTO tour_locations (tour_id, location_id) VALUES ?`,
        [locationValues]
      );
    }

    // Insert departure dates
    if (tourData.category === 'group' && departures.length > 0) {
      const departureValues = departures.map(dep => {
        if (!dep.departure_date || dep.available_seats == null || dep.available_seats < 1) {
          throw new Error('Invalid departure: departure_date and available_seats (minimum 1) are required');
        }
        return [tourId, dep.departure_date, dep.available_seats];
      });
      await connection.query(
        'INSERT INTO tour_departures (tour_id, departure_date, available_seats) VALUES ?',
        [departureValues]
      );
    } else if (tourData.category === 'group' && departures.length === 0) {
      throw new Error('At least one departure is required for group tours');
    }

    // Insert tour_photos
    if (photos.length) {
      const photoValues = photos.map((photo, index) => [
        tourId,
        photo.url || '',
        photo.caption || null,
        photo.is_primary ? 1 : 0,
        photo.display_order || index,
      ]);
      await connection.query(
        `INSERT INTO tour_photos (tour_id, url, caption, is_primary, display_order) VALUES ?`,
        [photoValues]
      );
    }

    // Insert tour_reviews
    if (reviews.length) {
      const reviewValues = reviews.map(review => [
        tourId,
        review.reviewer_name || '',
        review.reviewer_email || null,
        review.rating || 1,
        review.comment || '',
        review.is_verified ? 1 : 0,
        review.is_approved ? 1 : 0,
        review.date || new Date(),
      ]);
      await connection.query(
        `INSERT INTO tour_reviews (tour_id, reviewer_name, reviewer_email, rating, comment, is_verified, is_approved, date) VALUES ?`,
        [reviewValues]
      );
    }

    // Insert itinerary_days
    if (itinerary.length) {
      const itineraryValues = itinerary.map((day, index) => [
        tourId,
        day.day || index + 1,
        day.title || `Day ${index + 1}`,
        day.description || '',
        JSON.stringify(day.activities || []),
        JSON.stringify(day.meals_included || []),
        day.accommodation || null,
      ]);
      await connection.query(
        `INSERT INTO itinerary_days (tour_id, day_number, title, description, activities, meals_included, accommodation) VALUES ?`,
        [itineraryValues]
      );
    }

    // Insert room_types
    if (room_types.length) {
      const roomValues = room_types.map(room => [
        tourId,
        room.name || '',
        room.description || null,
        room.max_occupancy || null,
      ]);
      await connection.query(
        `INSERT INTO room_types (tour_id, name, description, max_occupancy) VALUES ?`,
        [roomValues]
      );
    }

    // Fetch the complete tour with related data
    const [[tour]] = await connection.query('SELECT * FROM tours WHERE id = ?', [tourId]);
    const [photosData] = await connection.query(
      'SELECT id, url, caption, is_primary, display_order FROM tour_photos WHERE tour_id = ? ORDER BY display_order',
      [tourId]
    );
    const [reviewsData] = await connection.query(
      'SELECT id, reviewer_name, reviewer_email, rating, comment, is_verified, is_approved, date FROM tour_reviews WHERE tour_id = ? AND is_approved = 1 ORDER BY date DESC',
      [tourId]
    );
    const [roomsData] = await connection.query(
      'SELECT id, name, description, max_occupancy FROM room_types WHERE tour_id = ?',
      [tourId]
    );
    const [itineraryData] = await connection.query(
      'SELECT day_number AS day, title, description, activities, meals_included, accommodation FROM itinerary_days WHERE tour_id = ? ORDER BY day_number',
      [tourId]
    );
    const [departuresData] = await connection.query(
      'SELECT departure_date, available_seats FROM tour_departures WHERE tour_id = ? ORDER BY departure_date',
      [tourId]
    );
    const [destinationsData] = await connection.query(
      'SELECT destination_id FROM tour_destinations WHERE tour_id = ?',
      [tourId]
    );

    await connection.commit();

    return new Tour({
      ...tour,
      destination_ids: destinationsData.map(d => d.destination_id), // Include destination_ids in response
      location_ids,
      photos: photosData || [],
      reviews: reviewsData || [],
      room_types: roomsData || [],
      itinerary: itineraryData.map(day => ({
        ...day,
        activities: day.activities ? JSON.parse(day.activities) : [],
        meals_included: day.meals_included ? JSON.parse(day.meals_included) : [],
      })),
      departures: departuresData || [],
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateTour(tourId, data) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Destructure data
    const {
      tour,
      photos = [],
      reviews = [],
      room_types = [],
      itinerary = [],
      departures = [],
      location_ids = [],
      destination_ids = []
    } = data;

    if (!tour || !tour.id) {
      throw new Error('Tour data or tour ID is missing');
    }

    // Validate destination_ids
    if (!Array.isArray(destination_ids) || destination_ids.length === 0) {
      throw new Error('At least one destination is required');
    }
    const [validDestinations] = await conn.query(
      'SELECT id FROM destinations WHERE id IN (?)',
      [destination_ids]
    );
    if (validDestinations.length !== destination_ids.length) {
      throw new Error('Invalid destination IDs');
    }

    // Validate location_ids
    if (location_ids.length > 0) {
      const [locations] = await conn.query(
        'SELECT id FROM locations WHERE id IN (?) AND destination_id IN (?)',
        [location_ids, destination_ids]
      );
      const foundLocationIds = locations.map(loc => loc.id);
      const invalidLocationIds = location_ids.filter(id => !foundLocationIds.includes(id));
      if (invalidLocationIds.length) {
        throw new Error(`Invalid location_ids: ${invalidLocationIds.join(', ')}`);
      }
    }

    // Validate departures for group tours
    if (tour.category === 'group') {
      if (!Array.isArray(departures) || departures.length === 0) {
        throw new Error('At least one departure is required for group tours');
      }
      departures.forEach(dep => {
        if (!dep.departure_date || dep.available_seats == null || dep.available_seats < 1) {
          throw new Error('Invalid departure: departure_date and available_seats (minimum 1) are required');
        }
      });
    } else {
      // For non-group tours, ensure available_from and available_to are provided
      if (!tour.available_from || !tour.available_to) {
        throw new Error('available_from and available_to are required for non-group tours');
      }
    }

    // Serialize JSON fields
    const jsonFields = [
      'inclusions', 'exclusions', 'complementaries', 'highlights',
      'packing_list', 'languages_supported', 'guide_languages',
      'meals_included', 'dietary_restrictions_supported',
      'activity_types', 'interests'
    ];

    const tourFields = { ...tour };
    jsonFields.forEach(field => {
      if (tourFields[field] !== undefined) {
        tourFields[field] = Array.isArray(tourFields[field])
          ? JSON.stringify(tourFields[field])
          : tourFields[field] || '[]';
      }
    });

    // Remove array fields and destination_ids from direct update
    delete tourFields.photos;
    delete tourFields.reviews;
    delete tourFields.room_types;
    delete tourFields.itinerary;
    delete tourFields.location_ids;
    delete tourFields.departures;
    delete tourFields.destination_ids;

    // Update tours table
    const fieldNames = Object.keys(tourFields);
    if (fieldNames.length) {
      const setClause = fieldNames.map(key => `\`${key}\` = ?`).join(', ');
      const values = fieldNames.map(key => tourFields[key]);
      await conn.query(
        `UPDATE tours SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...values, tourId]
      );
    }

    // Update tour_destinations (delete existing and insert new)
    await conn.query('DELETE FROM tour_destinations WHERE tour_id = ?', [tourId]);
    if (destination_ids.length) {
      const destinationValues = destination_ids.map(id => [tourId, id]);
      await conn.query(
        'INSERT INTO tour_destinations (tour_id, destination_id) VALUES ?',
        [destinationValues]
      );
    }

    // Update tour_locations (delete existing and insert new)
    await conn.query('DELETE FROM tour_locations WHERE tour_id = ?', [tourId]);
    if (location_ids.length) {
      const locationValues = location_ids.map(id => [tourId, id]);
      await conn.query(
        'INSERT INTO tour_locations (tour_id, location_id) VALUES ?',
        [locationValues]
      );
    }

    // Update photos
    await conn.query('DELETE FROM tour_photos WHERE tour_id = ?', [tourId]);
    if (photos.length) {
      const photoValues = photos.map(p => [
        tourId, p.url, p.caption, p.is_primary ? 1 : 0, p.display_order || null
      ]);
      await conn.query(
        'INSERT INTO tour_photos (tour_id, url, caption, is_primary, display_order) VALUES ?',
        [photoValues]
      );
    }

    // Update itinerary
    await conn.query('DELETE FROM itinerary_days WHERE tour_id = ?', [tourId]);
    if (itinerary.length) {
      const itineraryValues = itinerary.map(item => [
        tourId,
        item.day_number,
        item.title,
        item.description,
        item.activities ? JSON.stringify(item.activities) : '[]',
        item.meals_included ? JSON.stringify(item.meals_included) : '[]',
        item.accommodation || null
      ]);
      await conn.query(
        'INSERT INTO itinerary_days (tour_id, day_number, title, description, activities, meals_included, accommodation) VALUES ?',
        [itineraryValues]
      );
    }

    // Update room types
    await conn.query('DELETE FROM room_types WHERE tour_id = ?', [tourId]);
    if (room_types.length) {
      const roomValues = room_types.map(r => [
        tourId, r.name, r.description || null, r.max_occupancy
      ]);
      await conn.query(
        'INSERT INTO room_types (tour_id, name, description, max_occupancy) VALUES ?',
        [roomValues]
      );
    }

    // Update reviews
    await conn.query('DELETE FROM tour_reviews WHERE tour_id = ?', [tourId]);
    if (reviews.length) {
      const reviewValues = reviews.map(r => [
        tourId, r.reviewer_name, r.rating, r.comment, r.date, r.is_verified ? 1 : 0, r.is_approved ? 1 : 0
      ]);
      await conn.query(
        'INSERT INTO tour_reviews (tour_id, reviewer_name, rating, comment, date, is_verified, is_approved) VALUES ?',
        [reviewValues]
      );
    }

    // Update departures
    await conn.query('DELETE FROM tour_departures WHERE tour_id = ?', [tourId]);
    if (departures.length) {
      const departureValues = departures.map(d => [
        tourId, d.departure_date, d.available_seats
      ]);
      await conn.query(
        'INSERT INTO tour_departures (tour_id, departure_date, available_seats) VALUES ?',
        [departureValues]
      );
    }

    await conn.commit();
    return { success: true, message: 'Tour updated successfully', tour_id: tourId };
  } catch (error) {
    await conn.rollback();
    console.error('Error updating tour:', error);
    throw error;
  } finally {
    conn.release();
  }
}


async function deleteTourById(tourId) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Delete from child tables first to respect foreign key constraints
    await conn.query('DELETE FROM tour_locations WHERE tour_id = ?', [tourId]);
    await conn.query('DELETE FROM tour_photos WHERE tour_id = ?', [tourId]);
    await conn.query('DELETE FROM tour_reviews WHERE tour_id = ?', [tourId]);
    await conn.query('DELETE FROM itinerary_days WHERE tour_id = ?', [tourId]);
    await conn.query('DELETE FROM room_types WHERE tour_id = ?', [tourId]);
    await conn.query('DELETE FROM tour_departures WHERE tour_id = ?', [tourId]);

    // Delete from tours table
    const [result] = await conn.query('DELETE FROM tours WHERE id = ?', [tourId]);

    if (result.affectedRows === 0) {
      throw { code: 404, message: 'Tour not found' };
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getToursByLocationId(locationId) {
  const [tours] = await db.query(`
    SELECT 
      t.*, 
      d.title AS destination_title,
      GROUP_CONCAT(tl.location_id) AS location_ids,
      GROUP_CONCAT(l.name) AS location_names
    FROM tours t
    LEFT JOIN destinations d ON t.destination_id = d.id
    LEFT JOIN tour_locations tl ON t.id = tl.tour_id
    LEFT JOIN locations l ON tl.location_id = l.id
    WHERE t.id IN (
      SELECT tour_id FROM tour_locations WHERE location_id = ?
    )
    GROUP BY t.id
  `, [locationId]);

  if (!tours.length) return [];

  const tourIds = tours.map(t => t.id);

  const [photos] = await db.query(
    'SELECT * FROM tour_photos WHERE tour_id IN (?) ORDER BY display_order',
    [tourIds]
  );
  const [reviews] = await db.query(
    'SELECT * FROM tour_reviews WHERE tour_id IN (?) AND is_approved = 1 ORDER BY date DESC',
    [tourIds]
  );
  const [rooms] = await db.query(
    'SELECT * FROM room_types WHERE tour_id IN (?)',
    [tourIds]
  );
  const [itineraries] = await db.query(
    'SELECT * FROM itinerary_days WHERE tour_id IN (?) ORDER BY day_number',
    [tourIds]
  );
  const [departures] = await db.query(
    'SELECT tour_id, departure_date, available_seats FROM tour_departures WHERE tour_id IN (?) ORDER BY departure_date',
    [tourIds]
  );

  const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
      (acc[item[key]] = acc[item[key]] || []).push(item);
      return acc;
    }, {});

  const groupedPhotos = groupBy(photos, 'tour_id');
  const groupedReviews = groupBy(reviews, 'tour_id');
  const groupedRooms = groupBy(rooms, 'tour_id');
  const groupedItineraries = groupBy(itineraries, 'tour_id');
  const groupedDepartures = groupBy(departures, 'tour_id');

  return tours.map(tour => new Tour({
    ...tour,
    destination_title: tour.destination_title,
    location_ids: tour.location_ids ? tour.location_ids.split(',').map(id => +id) : [],
    location_names: tour.location_names ? tour.location_names.split(',') : [],
    photos: groupedPhotos[tour.id] || [],
    reviews: groupedReviews[tour.id] || [],
    room_types: groupedRooms[tour.id] || [],
    itinerary: (groupedItineraries[tour.id] || []).map(day => ({
      ...day,
      activities: day.activities ? JSON.parse(day.activities) : [],
      meals_included: day.meals_included ? JSON.parse(day.meals_included) : []
    })),
    departures: groupedDepartures[tour.id] || [],
  }));
}

async function filterTours(filters) {
  const {
    destination_id,
    category,
    min_price,
    max_price,
    min_duration,
    max_duration,
    available_from,
    available_to,
    accommodation_rating,
    location,
    flight_included,
    adults,
    children,
    rooms,
    departure_date,
  } = filters;

  let query = 'SELECT t.* FROM tours t';
  const params = [];

  if (departure_date) {
    query += ' INNER JOIN tour_departures td ON t.id = td.tour_id';
    query += ' WHERE td.departure_date = ?';
    params.push(departure_date);
  } else {
    query += ' WHERE t.is_active = 1';
  }

  if (destination_id) {
    query += ' AND t.destination_id = ?';
    params.push(destination_id);
  }

  if (category) {
    query += ' AND t.category = ?';
    params.push(category);
  }

  if (min_price) {
    query += ' AND t.price >= ?';
    params.push(min_price);
  }

  if (max_price) {
    query += ' AND t.price <= ?';
    params.push(max_price);
  }

  if (min_duration) {
    query += ' AND t.duration_days >= ?';
    params.push(min_duration);
  }

  if (max_duration) {
    query += ' AND t.duration_days <= ?';
    params.push(max_duration);
  }

  if (available_from) {
    query += ' AND t.available_from >= ?';
    params.push(available_from);
  }

  if (available_to) {
    query += ' AND t.available_to <= ?';
    params.push(available_to);
  }

  if (Array.isArray(accommodation_rating) && accommodation_rating.length > 0) {
    const placeholders = accommodation_rating.map(() => '?').join(',');
    query += ` AND t.accommodation_rating IN (${placeholders})`;
    params.push(...accommodation_rating);
  }

  if (location) {
    query += ` AND t.id IN (
      SELECT tour_id FROM tour_locations 
      INNER JOIN locations ON tour_locations.location_id = locations.id 
      WHERE locations.id = ?
    )`;
    params.push(location);
  }

  if (typeof flight_included === 'boolean') {
    query += ' AND t.flight_included = ?';
    params.push(flight_included ? 1 : 0);
  }

  if (adults !== undefined) {
    query += ' AND t.adults >= ?';
    params.push(adults);
  }

  if (children !== undefined) {
    query += ' AND t.children >= ?';
    params.push(children);
  }

  if (rooms !== undefined) {
    query += ' AND t.rooms >= ?';
    params.push(rooms);
  }

  const [tours] = await db.query(query, params);
  if (!tours.length) return [];

  const tourIds = tours.map(t => t.id);

  const [photos] = await db.query(
    'SELECT * FROM tour_photos WHERE tour_id IN (?) ORDER BY display_order',
    [tourIds]
  );
  const [reviews] = await db.query(
    'SELECT * FROM tour_reviews WHERE tour_id IN (?) AND is_approved = 1 ORDER BY date DESC',
    [tourIds]
  );
  const [roomsData] = await db.query(
    'SELECT * FROM room_types WHERE tour_id IN (?)',
    [tourIds]
  );
  const [itineraries] = await db.query(
    'SELECT * FROM itinerary_days WHERE tour_id IN (?) ORDER BY day_number',
    [tourIds]
  );
  const [departures] = await db.query(
    'SELECT tour_id, departure_date, available_seats FROM tour_departures WHERE tour_id IN (?) ORDER BY departure_date',
    [tourIds]
  );

  const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
      (acc[item[key]] = acc[item[key]] || []).push(item);
      return acc;
    }, {});

  const groupedPhotos = groupBy(photos, 'tour_id');
  const groupedReviews = groupBy(reviews, 'tour_id');
  const groupedRooms = groupBy(roomsData, 'tour_id');
  const groupedItineraries = groupBy(itineraries, 'tour_id');
  const groupedDepartures = groupBy(departures, 'tour_id');

  return tours.map(tour => new Tour({
    ...tour,
    location_ids: [], // Populated separately if needed
    photos: groupedPhotos[tour.id] || [],
    reviews: groupedReviews[tour.id] || [],
    room_types: groupedRooms[tour.id] || [],
    itinerary: (groupedItineraries[tour.id] || []).map(day => ({
      ...day,
      activities: day.activities ? JSON.parse(day.activities) : [],
      meals_included: day.meals_included ? JSON.parse(day.meals_included) : []
    })),
    departures: groupedDepartures[tour.id] || [],
  }));
}

async function getTourCategories() {
  const [rows] = await db.query('SELECT DISTINCT category FROM tours WHERE category IS NOT NULL');
  return rows.map(row => row.category);
}

async function addOrUpdate(tour_id, location_id) {
  const sql = `
    INSERT INTO tour_locations (tour_id, location_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE location_id = VALUES(location_id)
  `;
  const [result] = await db.query(sql, [tour_id, location_id]);
  return result;
}

module.exports = {
  addOrUpdate,
  getAllTours,
  getTourBySlug,
  getToursByLocationId,
  getToursByCategory,
  updateTour,
  deleteTourById,
  createTour,
  getToursByDestination,
  filterTours,
  getTourCategories,
  getFeaturedTours,
};