import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

export const authorize = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized. Please login.'
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
            return;
        }

        next();
    };
};

// Check if owner has active subscription
export const checkSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== UserRole.OWNER) {
            next();
            return;
        }

        // Import here to avoid circular dependency
        const Owner = (await import('../models/Owner')).default;
        const Subscription = (await import('../models/Subscription')).default;

        const owner = await Owner.findOne({ userId: req.user.id });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Check for active subscription
        const activeSubscription = await Subscription.findOne({
            ownerId: owner._id,
            status: 'active',
            endDate: { $gte: new Date() }
        });

        if (!activeSubscription) {
            res.status(403).json({
                success: false,
                message: 'No active subscription. Please subscribe to a plan to access this feature.',
                requiresSubscription: true
            });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking subscription status'
        });
        return;
    }
};

/**
 * Check if owner's active plan has a specific feature
 * @param featureName Name of the feature to check
 */
export const checkFeature = (featureName: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user || req.user.role !== UserRole.OWNER) {
                next();
                return;
            }

            const Owner = (await import('../models/Owner')).default;
            const Subscription = (await import('../models/Subscription')).default;
            await import('../models/Feature');


            const owner = await Owner.findOne({ userId: req.user.id });
            if (!owner) {
                res.status(404).json({ success: false, message: 'Owner profile not found' });
                return;
            }

            // Find active subscription and populate plan with feature details
            const activeSubscription = await Subscription.findOne({
                ownerId: owner._id,
                status: 'active',
                endDate: { $gte: new Date() }
            }).populate({
                path: 'planId',
                populate: {
                    path: 'featureIds',
                    model: 'Feature'
                }
            });

            if (!activeSubscription) {
                res.status(403).json({
                    success: false,
                    message: 'No active subscription found',
                    requiresSubscription: true
                });
                return;
            }

            const plan = activeSubscription.planId as any;

            // Check if feature exists in the plan
            // We check both the featureIds (populated) and the legacy features array
            const hasFeature =
                (plan.featureIds && plan.featureIds.some((f: any) => f.name === featureName && f.isActive)) ||
                (plan.features && plan.features.some((f: string) => f === featureName));

            if (!hasFeature) {
                res.status(403).json({
                    success: false,
                    message: `Your current plan does not include the '${featureName}' feature. Please upgrade your plan.`,
                    requiresUpgrade: true,
                    missingFeature: featureName
                });
                return;
            }

            next();
        } catch (error) {
            console.error('Check feature error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking feature access'
            });
            return;
        }
    };
};
