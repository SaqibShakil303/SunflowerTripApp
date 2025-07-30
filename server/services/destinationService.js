const db = require('../db');
const Destination = require('../models/destinationModel');

const createDestinationWithDetails = async (data) => {
  const {
    destination,
    locations = [],
    attractions = [],
    ethnicities = [],
    cuisines = [],
    activities = []
  } = data;

  const conn = await db.getConnection();
  try {
    await conn.query('SET innodb_lock_wait_timeout = 5');
    await conn.beginTransaction();

    const existing = await Destination.findByTitle(destination.title);
    if (existing) throw new Error('Destination already exists.');

    const newDestination = await Destination.createDestination(destination, conn);
    const destination_id = newDestination.id;

    for (let loc of locations) {
      await Destination.addLocation({ ...loc, destination_id }, conn);
    }

    const insertMultiple = async (table, columns, rows) => {
      if (!rows.length) return;
      const values = rows.map(r => [destination_id, ...columns.map(c => r[c])]);
      await conn.query(
        `INSERT INTO ${table} (destination_id, ${columns.join(', ')}) VALUES ?`,
        [values]
      );
    };

    await insertMultiple('destination_attractions', ['title', 'image_url', 'rating', 'video_url'], attractions);
    await insertMultiple('destination_ethnicities', ['title', 'image_url'], ethnicities);
    await insertMultiple('destination_cuisines', ['title', 'image_url'], cuisines);
    await insertMultiple('destination_activities', ['title', 'image_url'], activities);

    await conn.commit();
    return { message: 'Destination and related data added successfully', destination_id };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const updateDestinations = async (id, payload) => {
  const {
    title,
    image_url,
    best_time_to_visit,
    weather,
    currency,
    language,
    time_zone,
    description,
    parent_id,
    locations,
    attractions,
    cuisines,
    ethnicities,
    activities
  } = payload;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const updateFields = [];
    const updateValues = [];

    const baseFields = {
      title, image_url, best_time_to_visit, weather,
      currency, language, time_zone, description, parent_id
    };

    for (const [key, value] of Object.entries(baseFields)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length > 0) {
      await conn.query(
        `UPDATE destinations SET ${updateFields.join(', ')} WHERE id = ?`,
        [...updateValues, id]
      );
    }

    const replaceSection = async (table, columns, dataArray) => {
      if (!Array.isArray(dataArray)) return;

      await conn.query(`DELETE FROM ${table} WHERE destination_id = ?`, [id]);
      if (dataArray.length > 0) {
        const values = dataArray.map(item => [id, ...columns.map(col => item[col])]);
        const placeholders = values.map(() => `(${Array(columns.length + 1).fill('?').join(',')})`).join(',');
        const flatValues = values.flat();
        await conn.query(
          `INSERT INTO ${table} (destination_id, ${columns.join(', ')}) VALUES ${placeholders}`,
          flatValues
        );
      }
    };

    if (locations !== undefined)
      await replaceSection('locations', ['name', 'description', 'image_url', 'iframe_360'], locations);

    if (attractions !== undefined)
      await replaceSection('destination_attractions', ['title', 'image_url', 'rating', 'video_url'], attractions);

    if (cuisines !== undefined)
      await replaceSection('destination_cuisines', ['title', 'image_url'], cuisines);

    if (ethnicities !== undefined)
      await replaceSection('destination_ethnicities', ['title', 'image_url'], ethnicities);

    if (activities !== undefined)
      await replaceSection('destination_activities', ['title', 'image_url'], activities);

    await conn.commit();
    return { updated: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const deleteDestinationById = async (id) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM locations WHERE destination_id = ?', [id]);
    await conn.query('DELETE FROM destination_attractions WHERE destination_id = ?', [id]);
    await conn.query('DELETE FROM destination_cuisines WHERE destination_id = ?', [id]);
    await conn.query('DELETE FROM destination_ethnicities WHERE destination_id = ?', [id]);
    await conn.query('DELETE FROM destination_activities WHERE destination_id = ?', [id]);

    const [result] = await conn.query('DELETE FROM destinations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw { code: 404, message: 'Destination not found.' };
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  deleteDestinationById,
  updateDestinations,
  createDestinationWithDetails
};