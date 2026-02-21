import express from 'express';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roleCheck';
import { UserRole } from '../types';
import { getProfile, updateProfile, getMyBookings, getBookingDetails } from '../controllers/userController';

const router = express.Router();

// All routes require authentication and user role
router.use(protect);
router.use(authorize(UserRole.USER));

// GET /api/user/profile - Get user profile
router.get('/profile', getProfile);

// PUT /api/user/profile - Update user profile
router.put('/profile', updateProfile);

// PATCH /api/user/profile - Update user profile (alternative method)
router.patch('/profile', updateProfile);

// GET /api/user/bookings - Get user bookings
router.get('/bookings', getMyBookings);

// GET /api/user/bookings/:id - Get booking details
router.get('/bookings/:id', getBookingDetails);

export default router;

