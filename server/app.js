
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ROUTES
const contactRoutes = require('./routes/contact');
const settingRoutes = require('./routes/setting');
// const debugRoutes = require('./routes/debug');
const authRoutes = require('./routes/authRoutes');
const { authenticateJWT } = require('./middleware/auth');
const { authorizeRoles } = require('./middleware/roles');
const itineraryRoutes = require('./routes/itinerary');
const tourRoutes = require('./routes/tours');
const destinationRoutes = require('./routes/destinationRoutes');
const locationRoutes = require('./routes/locationRoutes');
const tripPlannerRoutes = require('./routes/tripPlanner');
const tripLead = require('./routes/tripLead.routes');
const userRoutes = require('./routes/userRoutes');


// console.log('Environment variables:', {
//   GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
//   FRONTEND_URL: process.env.FRONTEND_URL
// });


// INIT APP
(async () => {
  const app = express();

   // CORS & Body Parsers
  app.use(cors({ origin: 'http://localhost:4200' }));
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ✅ API ROUTES
  app.use('/api/auth', authRoutes);
  app.use('/api/Settings', settingRoutes);
  app.use('/api/Contact', contactRoutes);
  // app.use('/api/debug', debugRoutes);
  app.use('/api/Itinerary', itineraryRoutes);
  app.use('/api/Tours', tourRoutes);
  app.use('/api/Destination', destinationRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/tripplanner', tripPlannerRoutes);
  app.use('/api/trip-leads', tripLead);
  app.use('/api/users', userRoutes);
  // app.get('/api/users',
  // authenticateJWT,
  // authorizeRoles('admin','manager'),
  // (req, res) => {
  //   // fetch & return users...
  // });

  // Authentication routes
  // app.use('/api/auth', authRoutes);
  // Basic health check route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
  });

   // ✅ Serve Angular App Only If index.html Exists
  const angularIndexPath = path.join(__dirname, 'public/index.html');
  if (fs.existsSync(angularIndexPath)) {
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('*', (req, res) => {
      res.sendFile(angularIndexPath);
    });
  } else {
    console.warn('⚠️ Angular build not found. Skipping static file serving.');
  }

  app.use((err, _, res, __) => {
    console.error(err);
    res.status(500).json({ error: err.message });
  });


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
})();

// require('./scheduler');