import { Response } from 'express';
import { AuthRequest } from '../types';
import Owner from '../models/Owner';
import AutoApprovalSettings from '../models/AutoApprovalSettings';
import autoApprovalService from '../services/autoApprovalService';

// Get auto-approval settings
export const getAutoApprovalSettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findOne({ userId: req.user?.id });

        if (!owner) {
            res.status(404).json({ message: 'Owner profile not found' });
            return;
        }

        let settings = await AutoApprovalSettings.findOne({ ownerId: owner._id });

        // Create default settings if not exists
        if (!settings) {
            settings = await AutoApprovalSettings.create({
                ownerId: owner._id,
                autoApproval: {
                    enabled: true,
                    requirePaymentProof: true
                }
            });
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get auto-approval settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update auto-approval settings
export const updateAutoApprovalSettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findOne({ userId: req.user?.id });

        if (!owner) {
            res.status(404).json({ message: 'Owner profile not found' });
            return;
        }

        const settings = await AutoApprovalSettings.findOneAndUpdate(
            { ownerId: owner._id },
            { autoApproval: req.body },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Auto-approval settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Update auto-approval settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get auto-approval statistics
export const getAutoApprovalStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findOne({ userId: req.user?.id });

        if (!owner) {
            res.status(404).json({ message: 'Owner profile not found' });
            return;
        }

        const days = parseInt(req.query.days as string) || 30;
        const stats = await autoApprovalService.getAutoApprovalStats(owner._id.toString(), days);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get auto-approval stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
