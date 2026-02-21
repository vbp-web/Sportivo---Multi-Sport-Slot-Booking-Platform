import { Request, Response } from 'express';
import City from '../models/City';

/**
 * @route   GET /api/cities
 * @desc    Get all active cities with venue counts
 * @access  Public
 */
export const getCities = async (_req: Request, res: Response): Promise<void> => {
    try {
        const cities = await City.find({ isActive: true }).sort({ name: 1 });

        // Get venue counts for each city
        const Venue = (await import('../models/Venue')).default;
        const venueCounts = await Venue.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$city', count: { $sum: 1 } } }
        ]);

        // Create a map of city name to venue count
        const venueCountMap = new Map<string, number>();
        venueCounts.forEach(vc => {
            venueCountMap.set(vc._id, vc.count);
        });

        // Add venue count to each city
        const citiesWithCounts = cities.map(city => ({
            _id: city._id,
            name: city.name,
            state: city.state,
            isActive: city.isActive,
            venueCount: venueCountMap.get(city.name) || 0
        }));

        res.status(200).json({
            success: true,
            count: citiesWithCounts.length,
            data: citiesWithCounts
        });
        return;
    } catch (error: any) {
        console.error('Get cities error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching cities',
            error: error.message
        });
        return;
    }
};

/**
 * @route   GET /api/cities/:id
 * @desc    Get single city
 * @access  Public
 */
export const getCity = async (req: Request, res: Response): Promise<void> => {
    try {
        const city = await City.findById(req.params.id);

        if (!city) {
            res.status(404).json({
                success: false,
                message: 'City not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: city
        });
    } catch (error: any) {
        console.error('Get city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching city',
            error: error.message
        });
    }
};
