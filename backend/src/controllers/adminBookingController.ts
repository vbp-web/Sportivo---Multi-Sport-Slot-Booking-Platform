import { Response } from 'express';
import { AuthRequest } from '../types';
import Booking from '../models/Booking';

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings for admin
 * @access  Private/Admin
 */
export const getAllBookings = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const bookings = await Booking.find({})
            .populate('userId', 'name phone email')
            .populate('venueId', 'name city address')
            .populate('courtId', 'name')
            .populate('sportId', 'name icon')
            .populate('slots', 'date startTime endTime price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error: any) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bookings',
            error: error.message
        });
    }
};
