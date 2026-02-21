import { Response } from 'express';
import { AuthRequest, UserRole, OwnerStatus } from '../types';
import User from '../models/User';
import Owner from '../models/Owner';
import Venue from '../models/Venue';
import Court from '../models/Court';
import Booking from '../models/Booking';
import Subscription from '../models/Subscription';
import City from '../models/City';
import Sport from '../models/Sport';

/**
 * @route   GET /api/admin/analytics
 * @desc    Get comprehensive platform analytics
 * @access  Private/Admin
 */
export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        // ===== OVERVIEW STATS =====
        const totalUsers = await User.countDocuments({ role: UserRole.USER });
        const totalOwners = await Owner.countDocuments({ status: OwnerStatus.APPROVED });
        const pendingOwners = await Owner.countDocuments({ status: OwnerStatus.PENDING });
        const totalVenues = await Venue.countDocuments({ isActive: true });
        const totalCourts = await Court.countDocuments({ isActive: true });
        const totalBookings = await Booking.countDocuments({});
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const activeCities = await City.countDocuments({ isActive: true });
        const activeSports = await Sport.countDocuments({ isActive: true });

        // Calculate total revenue from confirmed bookings
        const revenueResult = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Count active subscriptions
        const activeSubscriptions = await Subscription.countDocuments({
            status: 'active',
            endDate: { $gte: new Date() }
        });

        // ===== RECENT ACTIVITY =====
        const recentBookings = await Booking.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('venueId', 'name')
            .populate('userId', 'name')
            .select('venueId userId amount status createdAt');

        const recentOwners = await Owner.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('venueName status createdAt');

        const recentActivity = [
            ...recentBookings.map(b => ({
                id: b._id.toString(),
                type: 'booking' as const,
                message: `New booking at ${(b.venueId as any)?.name || 'Unknown'} by ${(b.userId as any)?.name || 'User'}`,
                timestamp: b.createdAt,
                amount: b.amount
            })),
            ...recentOwners.map(o => ({
                id: o._id.toString(),
                type: 'owner' as const,
                message: `New owner registration - ${o.venueName} (${o.status})`,
                timestamp: o.createdAt
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

        // ===== TOP VENUES =====
        const topVenues = await Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'pending'] } } },
            {
                $group: {
                    _id: '$venueId',
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { bookings: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'venues',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'venue'
                }
            },
            { $unwind: '$venue' },
            {
                $project: {
                    id: '$_id',
                    name: '$venue.name',
                    city: '$venue.city',
                    bookings: 1,
                    revenue: 1
                }
            }
        ]);

        // ===== MONTHLY STATS (Last 6 months) =====
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyBookings = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyStats = monthlyBookings.map(stat => ({
            month: monthNames[stat._id.month - 1],
            revenue: stat.revenue,
            bookings: stat.bookings
        }));

        // Flattened stats for the frontend dashboard
        const flatStats = {
            totalUsers,
            totalOwners,
            totalVenues,
            totalCourts,
            totalBookings,
            totalRevenue,
            pendingOwners,
            pendingBookings,
            activeCities,
            activeSports
        };

        // ===== RESPONSE =====
        res.status(200).json({
            success: true,
            data: {
                ...flatStats, // Flattened for current frontend implementation
                overview: {
                    ...flatStats,
                    activeUsers: totalUsers,
                    pendingApprovals: pendingOwners + pendingBookings,
                    activeSubscriptions
                },
                recentActivity,
                topVenues,
                monthlyStats
            }
        });
        return;
    } catch (error: any) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching analytics',
            error: error.message
        });
        return;
    }
};
