import { Response } from 'express';
import { AuthRequest } from '../types';
import City from '../models/City';

/**
 * @route   POST /api/admin/cities
 * @desc    Create a new city
 * @access  Private/Admin
 */
export const createCity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, state } = req.body;

        // Validation
        if (!name || !state) {
            res.status(400).json({
                success: false,
                message: 'Please provide city name and state'
            });
            return;
        }

        // Check if city already exists
        const existingCity = await City.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            state: { $regex: new RegExp(`^${state}$`, 'i') }
        });

        if (existingCity) {
            res.status(400).json({
                success: false,
                message: 'City already exists in this state'
            });
            return;
        }

        // Create city
        const city = await City.create({
            name,
            state,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'City created successfully',
            data: city
        });
    } catch (error: any) {
        console.error('Create city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating city',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/admin/cities
 * @desc    Get all cities (including inactive)
 * @access  Private/Admin
 */
export const getAllCities = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cities = await City.find({}).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: cities.length,
            data: cities
        });
    } catch (error: any) {
        console.error('Get all cities error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching cities',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/admin/cities/:id
 * @desc    Update a city
 * @access  Private/Admin
 */
export const updateCity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, state, isActive } = req.body;

        const city = await City.findById(req.params.id);

        if (!city) {
            res.status(404).json({
                success: false,
                message: 'City not found'
            });
            return;
        }

        // Update fields
        if (name) city.name = name;
        if (state) city.state = state;
        if (typeof isActive !== 'undefined') city.isActive = isActive;

        await city.save();

        res.status(200).json({
            success: true,
            message: 'City updated successfully',
            data: city
        });
    } catch (error: any) {
        console.error('Update city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating city',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/admin/cities/:id
 * @desc    Delete a city
 * @access  Private/Admin
 */
export const deleteCity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const city = await City.findById(req.params.id);

        if (!city) {
            res.status(404).json({
                success: false,
                message: 'City not found'
            });
            return;
        }

        // Check if city has venues
        // You can add this check if you have a Venue model
        // const venueCount = await Venue.countDocuments({ city: city.name });
        // if (venueCount > 0) {
        //     res.status(400).json({
        //         success: false,
        //         message: `Cannot delete city. ${venueCount} venue(s) are associated with this city.`
        //     });
        //     return;
        // }

        await city.deleteOne();

        res.status(200).json({
            success: true,
            message: 'City deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting city',
            error: error.message
        });
    }
};

/**
 * @route   PATCH /api/admin/cities/:id/toggle
 * @desc    Toggle city active status
 * @access  Private/Admin
 */
export const toggleCityStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const city = await City.findById(req.params.id);

        if (!city) {
            res.status(404).json({
                success: false,
                message: 'City not found'
            });
            return;
        }

        city.isActive = !city.isActive;
        await city.save();

        res.status(200).json({
            success: true,
            message: `City ${city.isActive ? 'activated' : 'deactivated'} successfully`,
            data: city
        });
    } catch (error: any) {
        console.error('Toggle city status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error toggling city status',
            error: error.message
        });
    }
};
