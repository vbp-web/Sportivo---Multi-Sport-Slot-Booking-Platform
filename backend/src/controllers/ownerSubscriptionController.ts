import { Response } from 'express';
import { AuthRequest } from '../types';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
// Force recompile

/**
 * @route   GET /api/owner/subscription
 * @desc    Get owner's current subscription
 * @access  Private/Owner
 */
export const getOwnerSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Get Owner record to get the ownerId
        const Owner = (await import('../models/Owner')).default;
        const owner = await Owner.findOne({ userId });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Find active or pending subscription using owner._id
        const subscription = await Subscription.findOne({
            ownerId: owner._id, // Use owner._id, not userId
            status: { $in: ['active', 'pending'] }
        })
            .populate('planId')
            .sort({ createdAt: -1 });

        if (!subscription) {
            res.status(200).json({
                success: true,
                data: null,
                message: 'No active subscription found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: subscription
        });
        return;
    } catch (error: any) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching subscription',
            error: error.message
        });
        return;
    }
};

/**
 * @route   POST /api/owner/subscription
 * @desc    Subscribe to a plan
 * @access  Private/Owner
 */
export const subscribeToPlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { planId, utr } = req.body;
        const paymentProofFile = req.file;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        if (!planId) {
            res.status(400).json({
                success: false,
                message: 'Plan ID is required'
            });
            return;
        }

        // Get Owner record to get the ownerId
        const Owner = (await import('../models/Owner')).default;
        const owner = await Owner.findOne({ userId });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Check if plan exists and is active
        const plan = await Plan.findById(planId);
        if (!plan) {
            res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
            return;
        }

        if (!plan.isActive) {
            res.status(400).json({
                success: false,
                message: 'This plan is not currently available'
            });
            return;
        }

        // Check if owner already has an active or pending (non-expired) subscription
        const existingSubscription = await Subscription.findOne({
            ownerId: owner._id,
            $or: [
                { status: 'active', endDate: { $gte: new Date() } }, // Active and not expired
                { status: 'pending' } // Pending approval
            ]
        });

        if (existingSubscription) {
            res.status(400).json({
                success: false,
                message: 'You already have an active or pending subscription. Please wait for approval or let your current subscription expire.'
            });
            return;
        }

        // Convert payment proof to base64 if provided
        let paymentProofBase64 = undefined;
        if (paymentProofFile) {
            const fs = require('fs');
            const fileBuffer = fs.readFileSync(paymentProofFile.path);
            paymentProofBase64 = `data:${paymentProofFile.mimetype};base64,${fileBuffer.toString('base64')}`;
            // Clean up uploaded file
            fs.unlinkSync(paymentProofFile.path);
        }

        // Create new subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration);

        const subscription = await Subscription.create({
            ownerId: owner._id, // FIXED: Use owner._id instead of userId
            planId: plan._id,
            startDate,
            endDate,
            amount: plan.price,
            paymentProof: paymentProofBase64,
            utr: utr || undefined,
            status: 'pending' // Pending until admin approves payment
        });

        const populatedSubscription = await Subscription.findById(subscription._id).populate('planId');

        res.status(201).json({
            success: true,
            message: 'Subscription request created successfully. Please wait for admin approval.',
            data: populatedSubscription
        });
        return;
    } catch (error: any) {
        console.error('Subscribe to plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating subscription',
            error: error.message
        });
        return;
    }
};

