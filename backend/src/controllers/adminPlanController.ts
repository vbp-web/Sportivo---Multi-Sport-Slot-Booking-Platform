import { Response } from 'express';
import { AuthRequest } from '../types';
import Plan from '../models/Plan';

/**
 * @route   GET /api/admin/plans
 * @desc    Get all plans
 * @access  Private/Admin
 */
export const getAllPlans = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const plans = await Plan.find({}).sort({ price: 1 });

        res.status(200).json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (error: any) {
        console.error('Get all plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching plans',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/admin/plans
 * @desc    Create a new plan
 * @access  Private/Admin
 */
export const createPlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            name,
            description,
            price,
            duration,
            durationType,
            features,
            featureIds,
            maxVenues,
            maxCourts,
            maxBookings,
            maxMessages,
            isUnlimitedBookings,
            isUnlimitedMessages
        } = req.body;

        if (!name || !price || !duration || !durationType || !maxVenues || !maxCourts) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, price, duration, durationType, maxVenues, maxCourts'
            });
            return;
        }

        // Check if plan already exists
        const existingPlan = await Plan.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingPlan) {
            res.status(400).json({
                success: false,
                message: 'Plan with this name already exists'
            });
            return;
        }

        const plan = await Plan.create({
            name,
            description,
            price,
            duration,
            durationType,
            features: features || [],
            featureIds: featureIds || [],
            maxVenues,
            maxCourts,
            maxBookings: maxBookings || 0,
            maxMessages: maxMessages || 0,
            isUnlimitedBookings: isUnlimitedBookings || false,
            isUnlimitedMessages: isUnlimitedMessages || false,
            isActive: true
        });


        res.status(201).json({
            success: true,
            message: 'Plan created successfully',
            data: plan
        });
    } catch (error: any) {
        console.error('Create plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating plan',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/admin/plans/:id
 * @desc    Update a plan
 * @access  Private/Admin
 */
export const updatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            name,
            description,
            price,
            duration,
            durationType,
            features,
            featureIds,
            maxVenues,
            maxCourts,
            maxBookings,
            maxMessages,
            isUnlimitedBookings,
            isUnlimitedMessages,
            isActive
        } = req.body;

        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
            return;
        }

        if (name) plan.name = name;
        if (description !== undefined) plan.description = description;
        if (price) plan.price = price;
        if (duration) plan.duration = duration;
        if (durationType) plan.durationType = durationType;
        if (features) plan.features = features;
        if (featureIds) plan.featureIds = featureIds;
        if (maxVenues) plan.maxVenues = maxVenues;
        if (maxCourts) plan.maxCourts = maxCourts;
        if (maxBookings !== undefined) plan.set('maxBookings', maxBookings);
        if (maxMessages !== undefined) plan.set('maxMessages', maxMessages);
        if (isUnlimitedBookings !== undefined) plan.set('isUnlimitedBookings', isUnlimitedBookings);
        if (isUnlimitedMessages !== undefined) plan.set('isUnlimitedMessages', isUnlimitedMessages);
        if (typeof isActive !== 'undefined') plan.isActive = isActive;


        await plan.save();

        res.status(200).json({
            success: true,
            message: 'Plan updated successfully',
            data: plan
        });
    } catch (error: any) {
        console.error('Update plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating plan',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/admin/plans/:id
 * @desc    Delete a plan
 * @access  Private/Admin
 */
export const deletePlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
            return;
        }

        await plan.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Plan deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting plan',
            error: error.message
        });
    }
};

/**
 * @route   PATCH /api/admin/plans/:id/toggle
 * @desc    Toggle plan active status
 * @access  Private/Admin
 */
export const togglePlanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
            return;
        }

        plan.isActive = !plan.isActive;
        await plan.save();

        res.status(200).json({
            success: true,
            message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
            data: plan
        });
    } catch (error: any) {
        console.error('Toggle plan status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error toggling plan status',
            error: error.message
        });
    }
};
