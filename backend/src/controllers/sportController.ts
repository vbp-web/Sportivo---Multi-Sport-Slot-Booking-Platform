import { Request, Response } from 'express';
import Sport from '../models/Sport';

// Get all sports
export const getAllSports = async (_req: Request, res: Response): Promise<void> => {
    try {
        const sports = await Sport.find({ isActive: true }).sort({ name: 1 });
        res.json({
            success: true,
            count: sports.length,
            data: sports
        });
    } catch (error) {
        console.error('Get sports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get sport by ID
export const getSportById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const sport = await Sport.findById(id);

        if (!sport) {
            res.status(404).json({
                success: false,
                message: 'Sport not found'
            });
            return;
        }

        res.json({
            success: true,
            data: sport
        });
        return;
    } catch (error) {
        console.error('Get sport error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
        return;
    }
};
