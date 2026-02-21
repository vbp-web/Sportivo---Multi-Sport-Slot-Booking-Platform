import { Response } from 'express';
import { AuthRequest, BookingStatus } from '../types';
import User from '../models/User';
import Booking from '../models/Booking';

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select('-password -otp -otpExpiry');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user?.id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password -otp -otpExpiry');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get user bookings
export const getMyBookings = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        const bookings = await Booking.find({ userId })
            .populate('venueId', 'name city address')
            .populate('courtId', 'name')
            .populate('sportId', 'name icon')
            .populate('slotId', 'date startTime endTime price')
            .populate('slots', 'date startTime endTime price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get booking details
export const getBookingDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        const booking = await Booking.findOne({
            _id: id,
            userId: userId
        })
            .populate('venueId', 'name city address')
            .populate('courtId', 'name')
            .populate('sportId', 'name icon')
            .populate('slotId', 'date startTime endTime price')
            .populate('slots', 'date startTime endTime price');

        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
            return;
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get booking details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Cancel booking
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        const booking = await Booking.findOne({
            _id: id,
            userId: userId
        });

        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
            return;
        }

        if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
            res.status(400).json({
                success: false,
                message: 'Cannot cancel this booking'
            });
            return;
        }

        booking.status = BookingStatus.CANCELLED;
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

