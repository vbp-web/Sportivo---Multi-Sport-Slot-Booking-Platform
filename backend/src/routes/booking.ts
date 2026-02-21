import express from 'express';
import { protect } from '../middleware/auth';
import upload from '../middleware/upload';
import { createBooking, getBookingById, cancelBooking } from '../controllers/bookingController';

const router = express.Router();

// POST /api/bookings - Create booking (requires auth)
router.post('/', protect, upload.single('paymentProof'), createBooking);

// GET /api/bookings/:id - Get booking details (requires auth)
router.get('/:id', protect, getBookingById);

// PUT /api/bookings/:id/cancel - Cancel booking (requires auth)
router.put('/:id/cancel', protect, cancelBooking);

export default router;

