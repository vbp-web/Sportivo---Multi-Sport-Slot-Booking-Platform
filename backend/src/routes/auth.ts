import express from 'express';
import {
    register,
    login,
    sendOTPCode,
    verifyOTP,
    forgotPasswordManual,
    getMe,
    logout
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTPCode);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password-manual', forgotPasswordManual);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
