import { Response } from 'express';
import { AuthRequest } from '../types';
import Sport from '../models/Sport';

/**
 * @route   GET /api/admin/sports
 * @desc    Get all sports
 * @access  Private/Admin
 */
export const getAllSports = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sports = await Sport.find({}).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: sports.length,
            data: sports
        });
    } catch (error: any) {
        console.error('Get all sports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching sports',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/admin/sports
 * @desc    Create a new sport
 * @access  Private/Admin
 */
export const createSport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Sport name is required'
            });
            return;
        }

        // Check if sport already exists
        const existingSport = await Sport.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingSport) {
            res.status(400).json({
                success: false,
                message: 'Sport already exists'
            });
            return;
        }

        const sport = await Sport.create({
            name,
            description,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Sport created successfully',
            data: sport
        });
    } catch (error: any) {
        console.error('Create sport error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating sport',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/admin/sports/:id
 * @desc    Update a sport
 * @access  Private/Admin
 */
export const updateSport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, isActive } = req.body;

        const sport = await Sport.findById(req.params.id);

        if (!sport) {
            res.status(404).json({
                success: false,
                message: 'Sport not found'
            });
            return;
        }

        if (name) sport.name = name;
        if (description !== undefined) sport.description = description;
        if (typeof isActive !== 'undefined') sport.isActive = isActive;

        await sport.save();

        res.status(200).json({
            success: true,
            message: 'Sport updated successfully',
            data: sport
        });
    } catch (error: any) {
        console.error('Update sport error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating sport',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/admin/sports/:id
 * @desc    Delete a sport
 * @access  Private/Admin
 */
export const deleteSport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sport = await Sport.findById(req.params.id);

        if (!sport) {
            res.status(404).json({
                success: false,
                message: 'Sport not found'
            });
            return;
        }

        await sport.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Sport deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete sport error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting sport',
            error: error.message
        });
    }
};

/**
 * @route   PATCH /api/admin/sports/:id/toggle
 * @desc    Toggle sport active status
 * @access  Private/Admin
 */
export const toggleSportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sport = await Sport.findById(req.params.id);

        if (!sport) {
            res.status(404).json({
                success: false,
                message: 'Sport not found'
            });
            return;
        }

        sport.isActive = !sport.isActive;
        await sport.save();

        res.status(200).json({
            success: true,
            message: `Sport ${sport.isActive ? 'activated' : 'deactivated'} successfully`,
            data: sport
        });
    } catch (error: any) {
        console.error('Toggle sport status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error toggling sport status',
            error: error.message
        });
    }
};
