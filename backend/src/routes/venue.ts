import express from 'express';
import { getAllVenues, getVenuesByCity, getVenueDetails, getVenueSports, getVenueCourts, getPublicStats } from '../controllers/publicVenueController';

const router = express.Router();

// GET /api/venues - Get all venues (with filters)
router.get('/', getAllVenues);

// GET /api/venues/stats - Get public statistics
router.get('/stats', getPublicStats);

// GET /api/venues/city/:city - Get venues by city
router.get('/city/:city', getVenuesByCity);

// GET /api/venues/:id - Get venue details
router.get('/:id', getVenueDetails);

// GET /api/venues/:id/sports - Get sports offered by venue
router.get('/:id/sports', getVenueSports);

// GET /api/venues/:id/courts - Get courts for venue
router.get('/:id/courts', getVenueCourts);

export default router;
