import { Response } from 'express';
import { AuthRequest } from '../types';
import Owner from '../models/Owner';

// Get owner payment settings
export const getOwnerPaymentSettings = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.id;

        const owner = await Owner.findOne({ userId });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
        }

        return res.json({
            success: true,
            data: {
                upiId: owner.upiId,
                upiQrCode: owner.upiQrCode
            }
        });
    } catch (error: any) {
        console.error('Error fetching owner payment settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payment settings',
            error: error.message
        });
    }
};

// Update owner payment settings
export const updateOwnerPaymentSettings = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.id;
        const { upiId, upiQrCode } = req.body;

        // Validation
        if (!upiId || !upiQrCode) {
            return res.status(400).json({
                success: false,
                message: 'UPI ID and QR Code URL are required'
            });
        }

        const owner = await Owner.findOne({ userId });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
        }

        // Update payment settings
        owner.upiId = upiId;
        owner.upiQrCode = upiQrCode;
        await owner.save();

        return res.json({
            success: true,
            message: 'Payment settings updated successfully',
            data: {
                upiId: owner.upiId,
                upiQrCode: owner.upiQrCode
            }
        });
    } catch (error: any) {
        console.error('Error updating owner payment settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update payment settings',
            error: error.message
        });
    }
};
