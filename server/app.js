
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { renderModule } = require('@angular/platform-server');
const fs = require('fs').promises;
const AppServerModule = require('../client/dist/sunflowertrip/server/main.js').AppServerModule;
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

// CORS configuration
const allowedOrigins = [
  'http://localhost:4200',
  'https://sunflowertrip.in',
  process.env.RAILWAY_URL || 'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsers
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

  // Serve Angular static files
app.use(express.static(path.join(__dirname, 'public')));


// SSR rendering for all non-API routes
app.get(/^(?!\/api).*/, async (req, res) => {
  try {
    const indexHtml = await fs.readFile(path.join(__dirname, 'public/index.html'), 'utf8');
    const { html } = await renderModule(AppServerModule, {
      document: indexHtml,
      url: req.url
    });
    res.send(html);
  } catch (err) {
    console.error('SSR Error:', err);
    res.status(500).send('Server Error');
  }
});


  app.use((err, _, res, __) => {
    console.error(err);
    res.status(500).json({ error: err.message });
  });


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
})();

// require('./scheduler');