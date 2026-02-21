import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Owner from '../models/Owner';
import City from '../models/City';
import Sport from '../models/Sport';
import Plan from '../models/Plan';
import Booking from '../models/Booking';
import Venue from '../models/Venue';
import User from '../models/User';

// Get pending owner approvals
export const getPendingOwners = async (_req: AuthRequest, res: Response) => {
    try {
        const owners = await Owner.find({ approvalStatus: 'pending' })
            .populate('user', 'name phone email')
            .sort({ createdAt: -1 });

        return res.json(owners);
    } catch (error) {
        console.error('Get pending owners error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Approve owner
export const approveOwner = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const owner = await Owner.findByIdAndUpdate(
            id,
            { approvalStatus: 'approved' },
            { new: true }
        );

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        return res.json({ message: 'Owner approved successfully', owner });
    } catch (error) {
        console.error('Approve owner error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Reject owner
export const rejectOwner = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const owner = await Owner.findByIdAndUpdate(
            id,
            {
                approvalStatus: 'rejected',
                rejectionReason: reason
            },
            { new: true }
        );

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        return res.json({ message: 'Owner rejected', owner });
    } catch (error) {
        console.error('Reject owner error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// City Management
export const getAllCities = async (_req: Request, res: Response) => {
    try {
        const cities = await City.find().sort({ name: 1 });
        return res.json(cities);
    } catch (error) {
        console.error('Get cities error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const createCity = async (req: AuthRequest, res: Response) => {
    try {
        const city = await City.create(req.body);
        return res.status(201).json({ message: 'City created successfully', city });
    } catch (error) {
        console.error('Create city error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const updateCity = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const city = await City.findByIdAndUpdate(id, req.body, { new: true });

        if (!city) {
            return res.status(404).json({ message: 'City not found' });
        }

        return res.json({ message: 'City updated successfully', city });
    } catch (error) {
        console.error('Update city error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCity = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await City.findByIdAndDelete(id);
        return res.json({ message: 'City deleted successfully' });
    } catch (error) {
        console.error('Delete city error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Sport Management
export const createSport = async (req: AuthRequest, res: Response) => {
    try {
        const sport = await Sport.create(req.body);
        return res.status(201).json({ message: 'Sport created successfully', sport });
    } catch (error) {
        console.error('Create sport error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const updateSport = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const sport = await Sport.findByIdAndUpdate(id, req.body, { new: true });

        if (!sport) {
            return res.status(404).json({ message: 'Sport not found' });
        }

        return res.json({ message: 'Sport updated successfully', sport });
    } catch (error) {
        console.error('Update sport error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const deleteSport = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Sport.findByIdAndDelete(id);
        return res.json({ message: 'Sport deleted successfully' });
    } catch (error) {
        console.error('Delete sport error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Plan Management
export const getAllPlans = async (_req: Request, res: Response) => {
    try {
        const plans = await Plan.find().sort({ price: 1 });
        return res.json(plans);
    } catch (error) {
        console.error('Get plans error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const createPlan = async (req: AuthRequest, res: Response) => {
    try {
        const plan = await Plan.create(req.body);
        return res.status(201).json({ message: 'Plan created successfully', plan });
    } catch (error) {
        console.error('Create plan error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const updatePlan = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findByIdAndUpdate(id, req.body, { new: true });

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        return res.json({ message: 'Plan updated successfully', plan });
    } catch (error) {
        console.error('Update plan error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const deletePlan = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Plan.findByIdAndDelete(id);
        return res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        console.error('Delete plan error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Analytics
export const getPlatformAnalytics = async (_req: AuthRequest, res: Response) => {
    try {
        // Overview stats
        const totalRevenue = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalBookings = await Booking.countDocuments();
        const totalVenues = await Venue.countDocuments({ isActive: true });
        const totalOwners = await Owner.countDocuments({ approvalStatus: 'approved' });
        const activeUsers = await User.countDocuments({ isActive: true });
        const pendingApprovals = await Owner.countDocuments({ approvalStatus: 'pending' });

        // Monthly stats (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    status: 'confirmed'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Top venues
        const topVenues = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            {
                $group: {
                    _id: '$venue',
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'venues',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'venueDetails'
                }
            }
        ]);

        // Recent activity
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name')
            .populate('venueId', 'name');

        const recentActivity = recentBookings.map((booking: any) => ({
            id: booking._id,
            type: 'booking',
            message: `${booking.userId?.name || 'Someone'} booked ${booking.venueId?.name || 'a venue'}`,
            timestamp: booking.createdAt
        }));

        return res.json({
            overview: {
                totalRevenue: totalRevenue[0]?.total || 0,
                totalBookings,
                totalVenues,
                totalOwners,
                activeUsers,
                pendingApprovals
            },
            monthlyStats: monthlyStats.map(stat => ({
                month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
                revenue: stat.revenue,
                bookings: stat.bookings
            })),
            topVenues: topVenues.map(v => ({
                id: v._id,
                name: v.venueDetails[0]?.name,
                city: v.venueDetails[0]?.city,
                bookings: v.bookings,
                revenue: v.revenue
            })),
            recentActivity
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
