import express from 'express';
import { getCities, getCity } from '../controllers/cityController';

const router = express.Router();

// Public routes
router.get('/', getCities);
router.get('/:id', getCity);

export default router;
