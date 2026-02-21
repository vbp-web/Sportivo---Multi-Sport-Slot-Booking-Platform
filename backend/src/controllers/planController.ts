import { Request, Response } from 'express';
import Plan from '../models/Plan';

// Get all active plans
export const getAllPlans = async (_req: Request, res: Response): Promise<void> => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
        res.json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get plan by ID
export const getPlanById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const plan = await Plan.findById(id);

        if (!plan) {
            res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
            return;
        }

        res.json({
            success: true,
            data: plan
        });
        return;
    } catch (error) {
        console.error('Get plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
        return;
    }
};
