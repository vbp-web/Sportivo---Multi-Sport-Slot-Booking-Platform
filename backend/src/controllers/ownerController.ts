import { Response } from 'express';
import { AuthRequest } from '../types';
import Owner from '../models/Owner';
import Venue from '../models/Venue';
import Court from '../models/Court';
import Slot from '../models/Slot';
import Booking from '../models/Booking';
import User from '../models/User';
import { generateBookingId } from '../utils/generateBookingId';
import { sendBookingConfirmation, sendBookingRejection } from '../services/smsService';

// Get owner dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findOne({ userId: req.user?.id });

        if (!owner) {
            res.status(404).json({ message: 'Owner profile not found' });
            return;
        }

        // Get venues
        const venues = await Venue.find({ ownerId: owner._id });
        const venueIds = venues.map(v => v._id);

        // Get courts
        const courts = await Court.find({ venueId: { $in: venueIds } });
        const courtIds = courts.map(c => c._id);

        // Get bookings
        const bookings = await Booking.find({ venueId: { $in: venueIds } });
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;

        // Calculate revenue
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
        const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.amount, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRevenue = confirmedBookings
            .filter(b => b.createdAt >= today)
            .reduce((sum, b) => sum + b.amount, 0);

        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyRevenue = confirmedBookings
            .filter(b => b.createdAt >= firstDayOfMonth)
            .reduce((sum, b) => sum + b.amount, 0);

        // Get active slots
        const activeSlots = await Slot.countDocuments({
            courtId: { $in: courtIds },
            status: 'available'
        });

        res.json({
            totalBookings: bookings.length,
            pendingBookings,
            todayRevenue,
            monthlyRevenue,
            totalRevenue,
            activeSlots,
            totalCourts: courts.length,
            totalVenues: venues.length
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get owner venues
export const getMyVenues = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findOne({ userId: req.user?.id });

        if (!owner) {
            res.status(404).json({ message: 'Owner profile not found' });
            return;
        }

        const venues = await Venue.find({ ownerId: owner._id });
        res.json(venues);
    } catch (error) {
        console.error('Get venues error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create venue
export const createVenue = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findOne({ userId: req.user?.id });

        if (!owner) {
            res.status(404).json({ message: 'Owner profile not found' });
            return;
        }

        const venue = await Venue.create({
            ...req.body,
            ownerId: owner._id
        });

        res.status(201).json({ message: 'Venue created successfully', venue });
    } catch (error) {
        console.error('Create venue error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get booking requests
export const getBookingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findOne({ userId: req.user?.id });

        if (!owner) {
            res.status(404).json({ message: 'Owner profile not found' });
            return;
        }

        const venues = await Venue.find({ ownerId: owner._id });
        const venueIds = venues.map(v => v._id);

        const bookings = await Booking.find({
            venueId: { $in: venueIds },
            status: 'pending'
        })
            .populate('userId', 'name phone')
            .populate('venueId', 'name')
            .populate('courtId', 'name')
            .populate('sportId', 'name')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Get booking requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all bookings (not just pending)
export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findOne({ userId: req.user?.id });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        const venues = await Venue.find({ ownerId: owner._id });
        const venueIds = venues.map(v => v._id);

        const bookings = await Booking.find({
            venueId: { $in: venueIds }
        })
            .populate('userId', 'name phone email')
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
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Approve booking
export const approveBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate('userId', 'name phone')
            .populate('venueId', 'name')
            .populate('courtId', 'name')
            .populate('sportId', 'name')
            .populate('slotId', 'date startTime endTime')
            .populate('slots', 'date startTime endTime');

        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
            return;
        }

        booking.status = 'confirmed' as any;
        booking.confirmedAt = new Date();
        await booking.save();

        // Send SMS notification to user
        try {
            const user = booking.userId as any;
            const venue = booking.venueId as any;
            const sport = booking.sportId as any;

            // Get slot details (either from slotId or first slot in slots array)
            const slot = booking.slotId ? (booking.slotId as any) : (booking.slots && booking.slots.length > 0 ? (booking.slots[0] as any) : null);

            if (user && user.phone && slot) {
                const date = new Date(slot.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });

                const time = `${slot.startTime} - ${slot.endTime}`;

                await sendBookingConfirmation(
                    user.phone,
                    booking.bookingCode,
                    venue?.name || 'N/A',
                    sport?.name || 'N/A',
                    date,
                    time,
                    booking.amount
                );
                console.log('✅ Booking confirmation SMS sent to user');
            }
        } catch (smsError) {
            console.error('❌ Failed to send booking confirmation SMS:', smsError);
            // Don't fail the approval if SMS fails
        }

        res.json({
            success: true,
            message: 'Booking approved successfully',
            data: booking
        });
    } catch (error) {
        console.error('Approve booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Reject booking
export const rejectBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const booking = await Booking.findById(id)
            .populate('userId', 'name phone');

        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
            return;
        }

        booking.status = 'rejected' as any;
        if (reason) {
            booking.rejectionReason = reason;
        }
        await booking.save();

        // Send SMS notification to user
        try {
            const user = booking.userId as any;
            if (user && user.phone) {
                await sendBookingRejection(
                    user.phone,
                    booking.bookingCode,
                    reason || 'No reason provided'
                );
                console.log('✅ Booking rejection SMS sent to user');
            }
        } catch (smsError) {
            console.error('❌ Failed to send booking rejection SMS:', smsError);
            // Don't fail the rejection if SMS fails
        }

        // Free up the slots
        const slotIds = booking.slots && booking.slots.length > 0 ? booking.slots : [booking.slotId];
        await Slot.updateMany({ _id: { $in: slotIds } }, { status: 'available' });

        res.json({
            success: true,
            message: 'Booking rejected',
            data: booking
        });
    } catch (error) {
        console.error('Reject booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create offline booking (for walk-in customers)
export const createOfflineBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { slotIds, customerName, customerPhone, venueId, courtId, sportId, amount } = req.body;

        // Validate required fields
        if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Please provide at least one slot'
            });
            return;
        }

        if (!customerName || !customerPhone) {
            res.status(400).json({
                success: false,
                message: 'Customer name and phone are required'
            });
            return;
        }

        if (!venueId || !courtId || !sportId || !amount) {
            res.status(400).json({
                success: false,
                message: 'Missing required booking details'
            });
            return;
        }

        // Verify owner owns this venue
        const owner = await Owner.findOne({ userId: req.user?.id });
        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        const venue = await Venue.findOne({ _id: venueId, ownerId: owner._id });
        if (!venue) {
            res.status(403).json({
                success: false,
                message: 'You do not own this venue'
            });
            return;
        }

        // Check if all slots exist and are available
        const slotsData = await Slot.find({ _id: { $in: slotIds } });

        if (slotsData.length !== slotIds.length) {
            res.status(404).json({
                success: false,
                message: 'Some slots not found'
            });
            return;
        }

        const unavailableSlots = slotsData.filter(s => s.status !== 'available');
        if (unavailableSlots.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Some slots are not available'
            });
            return;
        }

        // Find or create user with phone number
        let user = await User.findOne({ phone: customerPhone });

        if (!user) {
            // Create a new user for offline booking with a random password
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            user = await User.create({
                name: customerName,
                phone: customerPhone,
                password: randomPassword, // Random password for offline bookings
                role: 'user',
                isPhoneVerified: true // Auto-verify for offline bookings
            });
        }

        // Generate unique booking code
        const bookingCode = generateBookingId();

        // Create booking (directly confirmed for offline bookings)
        const booking = await Booking.create({
            bookingCode,
            userId: user._id,
            slotId: slotIds[0], // For backward compatibility
            slots: slotIds, // Array of slot IDs
            venueId,
            courtId,
            sportId,
            amount: parseFloat(amount),
            status: 'confirmed', // Offline bookings are auto-confirmed
            confirmedAt: new Date(),
            paymentProof: undefined, // No payment proof for offline
            utr: undefined
        });

        // Mark all slots as booked
        await Slot.updateMany(
            { _id: { $in: slotIds } },
            { status: 'booked' }
        );

        // Populate booking details for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name phone')
            .populate('venueId', 'name city address')
            .populate('courtId', 'name')
            .populate('sportId', 'name icon')
            .populate('slots', 'date startTime endTime price');

        res.status(201).json({
            success: true,
            message: `Offline booking created successfully for ${slotIds.length} slot(s)`,
            data: populatedBooking
        });
    } catch (error: any) {
        console.error('Create offline booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
