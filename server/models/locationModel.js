const db = require('../db');

async function createLocation(data) {
  const { destination_id, name, description, image_url, iframe_360 } = data;
  const sql = `
    INSERT INTO locations
      (destination_id, name, description, image_url, iframe_360)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [destination_id, name, description, image_url, iframe_360];
  const [result] = await db.query(sql, values);
  // fetch and return the newly created row
  const [[row]] = await db.query('SELECT * FROM locations WHERE id = ?', [result.insertId]);
  return row;
}

async function getLocationsByDestination(destinationId) {
  const [rows] = await db.query(
    'SELECT * FROM locations WHERE destination_id = ?',
    [destinationId]
  );
  return rows;
}

async function getAllLocations() {
  const [rows] = await db.query('SELECT * FROM locations');
  return rows;
}

async function updateLocation(data) {
    const { id, destination_id, name, description, image_url, iframe_360 } = data;
    const sql = `
    UPDATE locations
    SET destination_id = ?, name = ?, description = ?, image_url = ?, iframe_360 = ?
    WHERE id = ?
  `;
    const values = [destination_id, name, description, image_url, iframe_360, id];
    await db.query(sql, values);
    // Fetch and return the updated row
    const [[row]] = await db.query('SELECT * FROM locations WHERE id = ?', [id]);
    return row;
}

async function deleteLocation(id) {
  const [[row]] = await db.query('SELECT * FROM locations WHERE id = ?', [id]);
  if (!row) {
    throw new Error('Location not found');
  }
  const sql = 'DELETE FROM locations WHERE id = ?';
  const [result] = await db.query(sql, [id]);
  return result.affectedRows;
}

module.exports = {
  createLocation,
  getLocationsByDestination,
  getAllLocations, 
  updateLocation, 
  deleteLocation
};
