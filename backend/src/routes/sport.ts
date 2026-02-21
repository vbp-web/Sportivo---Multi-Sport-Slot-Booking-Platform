import express from 'express';
import { getAllSports, getSportById } from '../controllers/sportController';

const router = express.Router();

// GET /api/sports - Get all sports
router.get('/', getAllSports);

// GET /api/sports/:id - Get sport details
router.get('/:id', getSportById);

export default router;
