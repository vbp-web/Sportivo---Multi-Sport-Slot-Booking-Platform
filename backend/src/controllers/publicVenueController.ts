import { Request, Response } from 'express';
import Venue from '../models/Venue';
import Court from '../models/Court';
import Booking from '../models/Booking';
import City from '../models/City';
import Sport from '../models/Sport';

/**
 * @route   GET /api/venues
 * @desc    Get all active venues (public)
 * @access  Public
 */
export const getAllVenues = async (req: Request, res: Response): Promise<void> => {
    try {
        const { city } = req.query;

        const filter: any = { isActive: true };

        if (city) {
            filter.city = city;
        }

        const venues = await Venue.find(filter)
            .select('-__v')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: venues
        });
        return;
    } catch (error: any) {
        console.error('Get all venues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching venues',
            error: error.message
        });
        return;
    }
};

/**
 * @route   GET /api/venues/city/:city
 * @desc    Get venues by city (public)
 * @access  Public
 */
export const getVenuesByCity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { city } = req.params;

        const venues = await Venue.find({
            city: { $regex: new RegExp(city, 'i') },
            isActive: true
        })
            .select('-__v')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: venues
        });
        return;
    } catch (error: any) {
        console.error('Get venues by city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching venues',
            error: error.message
        });
        return;
    }
};

/**
 * @route   GET /api/venues/:id
 * @desc    Get venue details (public)
 * @access  Public
 */
export const getVenueDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const venue = await Venue.findOne({ _id: id, isActive: true })
            .select('ownerId name description address city pincode phone email images amenities isActive createdAt');

        if (!venue) {
            res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
            return;
        }

        // Get courts for this venue
        const courts = await Court.find({ venueId: id, isActive: true })
            .populate('sportId', 'name icon')
            .select('-__v');

        res.status(200).json({
            success: true,
            data: {
                venue,
                courts
            }
        });
        return;
    } catch (error: any) {
        console.error('Get venue details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching venue details',
            error: error.message
        });
        return;
    }
};

/**
 * @route   GET /api/venues/:id/sports
 * @desc    Get sports offered by venue (public)
 * @access  Public
 */
export const getVenueSports = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get all courts for this venue
        const courts = await Court.find({ venueId: id, isActive: true })
            .populate('sportId')
            .select('sportId');

        if (!courts || courts.length === 0) {
            res.status(200).json({
                success: true,
                data: []
            });
            return;
        }

        // Extract unique sports
        const sportsMap = new Map();
        courts.forEach(court => {
            const sport = court.sportId as any;
            if (sport && !sportsMap.has(sport._id.toString())) {
                sportsMap.set(sport._id.toString(), sport);
            }
        });

        const sports = Array.from(sportsMap.values());

        res.status(200).json({
            success: true,
            data: sports
        });
        return;
    } catch (error: any) {
        console.error('Get venue sports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching venue sports',
            error: error.message
        });
        return;
    }
};

/**
 * @route   GET /api/venues/:id/courts
 * @desc    Get courts for a venue (public)
 * @access  Public
 */
export const getVenueCourts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { sportId } = req.query;

        const filter: any = { venueId: id, isActive: true };

        if (sportId) {
            filter.sportId = sportId;
        }

        const courts = await Court.find(filter)
            .populate('sportId', 'name icon')
            .select('-__v')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: courts
        });
        return;
    } catch (error: any) {
        console.error('Get venue courts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching courts',
            error: error.message
        });
        return;
    }
};

/**
 * @route   GET /api/venues/public/stats
 * @desc    Get public statistics for the landing page
 * @access  Public
 */
export const getPublicStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const totalVenues = await Venue.countDocuments({ isActive: true });
        const totalBookings = await Booking.countDocuments({});
        const totalCities = await City.countDocuments({ isActive: true });
        const totalSports = await Sport.countDocuments({ isActive: true });

        res.status(200).json({
            success: true,
            data: {
                totalVenues,
                totalBookings,
                totalCities,
                totalSports
            }
        });
    } catch (error: any) {
        console.error('Get public stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching public stats',
            error: error.message
        });
    }
};
