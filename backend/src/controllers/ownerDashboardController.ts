import { Response } from 'express';
import { AuthRequest } from '../types';
import Owner from '../models/Owner';
import Venue from '../models/Venue';
import Court from '../models/Court';
import Slot from '../models/Slot';
import Booking from '../models/Booking';

/**
 * @route   GET /api/owner/dashboard
 * @desc    Get owner dashboard statistics
 * @access  Private/Owner
 */
export const getOwnerDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Get owner record
        const owner = await Owner.findOne({ userId });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Get all owner's venues (active and inactive for historical data)
        const venues = await Venue.find({ ownerId: owner._id.toString() });
        const venueIds = venues.map(v => v._id.toString());

        // Count total courts across all venues
        const totalCourts = await Court.countDocuments({
            venueId: { $in: venueIds }
        });

        // Count active slots
        const activeSlots = await Slot.countDocuments({
            venueId: { $in: venueIds },
            status: 'available',
            date: { $gte: new Date() }
        });

        // Get all bookings for owner's venues
        const allBookings = await Booking.find({ venueId: { $in: venueIds } });

        // Count total bookings
        const totalBookings = allBookings.length;

        // Count bookings by status
        const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
        const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length;
        const rejectedBookings = allBookings.filter(b => b.status === 'rejected').length;
        const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length;

        // Calculate total revenue (sum of all confirmed bookings)
        const totalRevenue = allBookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + b.amount, 0);

        // Calculate today's revenue (confirmed bookings from today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayBookings = allBookings.filter(b =>
            b.status === 'confirmed' &&
            new Date(b.createdAt) >= today &&
            new Date(b.createdAt) < tomorrow
        );
        const todayRevenue = todayBookings.reduce((sum, b) => sum + b.amount, 0);

        // Calculate monthly revenue (confirmed bookings from this month)
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyBookings = allBookings.filter(b =>
            b.status === 'confirmed' &&
            new Date(b.createdAt) >= firstDayOfMonth
        );
        const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.amount, 0);

        // Get recent bookings (last 10)
        const recentBookings = await Booking.find({ venueId: { $in: venueIds } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name phone')
            .populate('venueId', 'name')
            .populate('courtId', 'name')
            .populate('sportId', 'name')
            .select('userId venueId courtId sportId amount status createdAt');

        // Map to recent activity format for dashboard
        const recentActivity = recentBookings.map(b => ({
            id: b._id.toString(),
            type: b.status === 'pending' ? 'pending' : 'confirmed',
            message: `${b.status === 'pending' ? 'New' : 'Confirmed'} booking at ${(b.venueId as any)?.name || 'venue'}`,
            details: `${(b.courtId as any)?.name || 'Court'} - ${(b.sportId as any)?.name || 'Sport'}`,
            user: (b.userId as any)?.name || 'User',
            amount: b.amount,
            timestamp: b.createdAt
        }));

        // Get subscription info
        const Subscription = (await import('../models/Subscription')).default;
        const activeSub = await Subscription.findOne({
            ownerId: owner._id.toString(),
            status: 'active',
            endDate: { $gte: new Date() }
        }).populate('planId');

        const stats = {
            totalBookings,
            totalRevenue,
            todayRevenue,
            monthlyRevenue,
            pendingBookings,
            confirmedBookings,
            rejectedBookings,
            cancelledBookings,
            activeSlots,
            totalCourts,
            totalVenues: venues.length,
            subscription: activeSub ? {
                planName: (activeSub.planId as any)?.name,
                bookingsUsage: activeSub.bookingsCount || 0,
                bookingsLimit: (activeSub.planId as any)?.isUnlimitedBookings ? 'Unlimited' : (activeSub.planId as any)?.maxBookings || 0,
                messagesUsage: activeSub.messagesCount || 0,
                messagesLimit: (activeSub.planId as any)?.isUnlimitedMessages ? 'Unlimited' : (activeSub.planId as any)?.maxMessages || 0,
                daysRemaining: Math.ceil((new Date(activeSub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            } : null
        };

        res.status(200).json({
            success: true,
            data: {
                ...stats, // Flattened for Analytics page
                stats,    // Nested for Dashboard page
                recentBookings,
                recentActivity
            }
        });
        return;
    } catch (error: any) {
        console.error('Get owner dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching dashboard data',
            error: error.message
        });
        return;
    }
}
