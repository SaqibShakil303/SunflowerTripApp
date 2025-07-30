const db = require('../db');

const createDestination = async (data, conn = db) => {
  const {
    title, image_url, best_time_to_visit, weather,
    currency, language, time_zone, description, parent_id
  } = data;

  const sql = `INSERT INTO destinations (
    title, image_url, best_time_to_visit, weather,
    currency, language, time_zone, description, parent_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    title, image_url, best_time_to_visit, weather,
    currency, language, time_zone, description, parent_id ?? null
  ];

  const [result] = await conn.query(sql, values);
  return { id: result.insertId, ...data };
};

const getAllDestinations = async () => {
  const [results] = await db.query('SELECT * FROM destinations');
  return results;
};

async function getDestinationById(id) {
  const [rows] = await db.query(
    `SELECT * FROM destinations WHERE id = ? LIMIT 1`, [id]
  );

  if (!rows.length) throw { code: 404, message: 'Destination not found' };
  return rows[0];
}

const addLocation = async (data, conn = db) => {
  const { destination_id, name, description, image_url, iframe_360 } = data;
  const sql = `
    INSERT INTO locations
      (destination_id, name, description, image_url, iframe_360)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [destination_id, name, description, image_url, iframe_360];
  const [result] = await conn.query(sql, values);
  return { id: result.insertId, ...data };
};

const addAttraction = async ({ destination_id, title, image_url, rating, video_url }) => {
  const sql = `
    INSERT INTO destination_attractions
    (destination_id, title, image_url, rating, video_url)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, [destination_id, title, image_url, rating, video_url]);
  return { id: result.insertId, destination_id, title, image_url, rating, video_url };
};

const addEthnicity = async ({ destination_id, title, image_url }) => {
  const sql = `
    INSERT INTO destination_ethnicities
    (destination_id, title, image_url)
    VALUES (?, ?, ?)
  `;
  const [result] = await db.query(sql, [destination_id, title, image_url]);
  return { id: result.insertId, destination_id, title, image_url };
};

const addCuisine = async ({ destination_id, title, image_url }) => {
  const sql = `
    INSERT INTO destination_cuisines
    (destination_id, title, image_url)
    VALUES (?, ?, ?)
  `;
  const [result] = await db.query(sql, [destination_id, title, image_url]);
  return { id: result.insertId, destination_id, title, image_url };
};

const addActivity = async ({ destination_id, title, image_url }) => {
  const sql = `
    INSERT INTO destination_activities
    (destination_id, title, image_url)
    VALUES (?, ?, ?)
  `;
  const [result] = await db.query(sql, [destination_id, title, image_url]);
  return { id: result.insertId, destination_id, title, image_url };
};

const findByTitle = async (title) => {
  const [rows] = await db.execute(
    `SELECT id FROM destinations WHERE title = ?`,
    [title]
  );
  return rows[0] || null;
};

const getDestinationDetails = async (destination_id) => {
  const [
    [destination],
    [locations],
    [attractions],
    [ethnicities],
    [cuisines],
    [activities],
    [tours]
  ] = await Promise.all([
    db.query('SELECT * FROM destinations WHERE id = ?', [destination_id]),
    db.query('SELECT * FROM locations WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM destination_attractions WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM destination_ethnicities WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM destination_cuisines WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM destination_activities WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM tours WHERE destination_id = ?', [destination_id])
  ]);

  return {
    ...destination[0],
    locations,
    attractions,
    ethnicities,
    cuisines,
    activities,
    tours
  };
};

async function getDestinationDetailsByTitle(title) {
  const destinationRow = await findByTitle(title);
  if (!destinationRow) {
    throw { code: 404, message: 'Destination not found by title' };
  }

  const destination_id = destinationRow.id;

  const [
    [destination],
    [locations],
    [attractions],
    [ethnicities],
    [cuisines],
    [activities],
    [tours]
  ] = await Promise.all([
    db.query('SELECT * FROM destinations WHERE id = ?', [destination_id]),
    db.query('SELECT * FROM locations WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM destination_attractions WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM destination_ethnicities WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM destination_cuisines WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM destination_activities WHERE destination_id = ?', [destination_id]),
    db.query('SELECT * FROM tours WHERE destination_id = ?', [destination_id])
  ]);

  return {
    ...destination[0],
    locations,
    attractions,
    ethnicities,
    cuisines,
    activities,
    tours
  };
}

async function updateDetails(destId, { destination, attractions, ethnicities, cuisines, activities }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    if (destination && Object.keys(destination).length) {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(destination)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }

      if (fields.length > 0) {
        await conn.query(
          `UPDATE destinations SET ${fields.join(', ')} WHERE id = ?`,
          [...values, destId]
        );
      }
    }

    if (Array.isArray(attractions)) {
      await conn.query('DELETE FROM destination_attractions WHERE destination_id = ?', [destId]);

      if (attractions.length) {
        const vals = attractions.map(a => [destId, a.title, a.image_url, a.rating, a.video_url]);
        await conn.query(
          `INSERT INTO destination_attractions 
           (destination_id, title, image_url, rating, video_url) 
           VALUES ?`,
          [vals]
        );
      }
    }

    if (Array.isArray(ethnicities)) {
      await conn.query('DELETE FROM destination_ethnicities WHERE destination_id = ?', [destId]);

      if (ethnicities.length) {
        const vals = ethnicities.map(e => [destId, e.title, e.image_url]);
        await conn.query(
          `INSERT INTO destination_ethnicities (destination_id, title, image_url) VALUES ?`,
          [vals]
        );
      }
    }

    if (Array.isArray(cuisines)) {
      await conn.query('DELETE FROM destination_cuisines WHERE destination_id = ?', [destId]);

      if (cuisines.length) {
        const vals = cuisines.map(c => [destId, c.title, c.image_url]);
        await conn.query(
          `INSERT INTO destination_cuisines (destination_id, title, image_url) VALUES ?`,
          [vals]
        );
      }
    }

    if (Array.isArray(activities)) {
      await conn.query('DELETE FROM destination_activities WHERE destination_id = ?', [destId]);

      if (activities.length) {
        const vals = activities.map(a => [destId, a.title, a.image_url]);
        await conn.query(
          `INSERT INTO destination_activities (destination_id, title, image_url) VALUES ?`,
          [vals]
        );
      }
    }

    await conn.commit();

    const [results] = await conn.query(`SELECT * FROM destinations WHERE id = ?`, [destId]);
    return results[0];

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getNamesAndLocations() {
  const [rows] = await db.query(`
    SELECT
      d.id           AS dest_id,
      d.title        AS dest_title,
      l.id           AS location_id,
      l.name         AS location_name
    FROM destinations d
    LEFT JOIN locations l
      ON l.destination_id = d.id
    ORDER BY d.title, l.name
  `);

  const map = new Map();
  for (const row of rows) {
    const { dest_id, dest_title, location_id, location_name } = row;
    if (!map.has(dest_id)) {
      map.set(dest_id, {
        id: dest_id,
        title: dest_title,
        locations: []
      });
    }
    if (location_id != null) {
      map.get(dest_id).locations.push({
        id: location_id,
        name: location_name
      });
    }
  }
  return Array.from(map.values());
}

async function getDestinationNames() {
  const [rows] = await db.query('SELECT id, parent_id, image_url, title FROM destinations');

  if (!rows.length) throw { code: 404, message: 'Destination not found' };
  return rows;
}

module.exports = {
  getDestinationDetailsByTitle,
  findByTitle,
  getDestinationNames,
  getDestinationById,
  getNamesAndLocations,
  updateDetails,
  getDestinationDetails,
  addActivity,
  addCuisine,
  addEthnicity,
  addAttraction,
  addLocation,
  createDestination,
  getAllDestinations
};