import { Response } from 'express';
import { AuthRequest, SubscriptionStatus } from '../types';
import Subscription from '../models/Subscription';


// Get all subscriptions (with filters)
export const getAllSubscriptions = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { status } = req.query;

        const filter: any = {};
        if (status) {
            filter.status = status;
        }

        const subscriptions = await Subscription.find(filter)
            .populate('ownerId', 'ownerName venueName city')
            .populate('planId', 'name price durationDays')
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: subscriptions
        });
    } catch (error: any) {
        console.error('Error fetching subscriptions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch subscriptions',
            error: error.message
        });
    }
};

// Get pending subscription payments
export const getPendingSubscriptions = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const subscriptions = await Subscription.find({ status: SubscriptionStatus.PENDING })
            .populate('ownerId', 'ownerName venueName city userId')
            .populate('planId', 'name price duration')
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: subscriptions
        });
    } catch (error: any) {
        console.error('Error fetching pending subscriptions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch pending subscriptions',
            error: error.message
        });
    }
};

// Approve subscription payment
export const approveSubscription = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findById(id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (subscription.status !== SubscriptionStatus.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'Subscription is not in pending status'
            });
        }

        // Update subscription status
        subscription.status = SubscriptionStatus.ACTIVE;
        await subscription.save();

        // Update owner record with the new plan
        const Owner = (await import('../models/Owner')).default;
        await Owner.findByIdAndUpdate(subscription.ownerId, {
            subscriptionPlan: subscription.planId
        });

        return res.json({
            success: true,
            message: 'Subscription approved successfully',
            data: subscription
        });
    } catch (error: any) {
        console.error('Error approving subscription:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to approve subscription',
            error: error.message
        });
    }
};

// Reject subscription payment
export const rejectSubscription = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findById(id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (subscription.status !== SubscriptionStatus.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'Subscription is not in pending status'
            });
        }

        // Delete the subscription (or you could add a 'rejected' status)
        await Subscription.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: 'Subscription rejected successfully'
        });
    } catch (error: any) {
        console.error('Error rejecting subscription:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reject subscription',
            error: error.message
        });
    }
};

// Get subscription details
export const getSubscriptionDetails = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findById(id)
            .populate('ownerId', 'ownerName venueName city phone email userId')
            .populate('planId', 'name price duration features');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        return res.json({
            success: true,
            data: subscription
        });
    } catch (error: any) {
        console.error('Error fetching subscription details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription details',
            error: error.message
        });
    }
};
