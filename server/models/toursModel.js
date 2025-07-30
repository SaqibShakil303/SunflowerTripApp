// class Tour {
//   constructor({  title,
//     slug,
//     location,
//     description,
//     itinerary,
//     duration_days,
//     price,
//     image_url,
//     category,
//     available_from,
//     available_to}) {
//  this.title= title;
//     this.slug = slug;
//     this.location = location;
//     this.description = description;
//     this.itinerary = itinerary;
//     this.duration_days = duration_days;
//     this.price = price;
//     this.image_url = image_url;
//     this.category = category;
//     this.available_from = available_from;
//     this.available_to = available_to;
//   }
// }

// module.exports = Tour;
const db = require('../db');
const Tour = require('./tours');
// const createTour = async (data) => {
//   const {
//     title,
//     slug,
//     location,
//     description,
//     itinerary,
//     duration_days,
//     price,
//     image_url,
//     category,
//     available_from,
//     available_to
//   } = data;

//   const sql = `
//     INSERT INTO tours (
//       title, slug, location, description, itinerary,
//       duration_days, price, image_url, category, available_from, available_to
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   const values = [
//     title, slug, location, description, itinerary,
//     duration_days, price, image_url, category, available_from, available_to
//   ];

//   const [result] = await db.query(sql, values);
//   return { id: result.insertId, ...data };
// };


module.exports = {
  // getToursByCategory,
  // updateTour,
  //   getToursByLocationId,
  // createTour,
  // getAllTours,
  //  getToursByDestination
};