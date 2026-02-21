import { Response } from 'express';
import { AuthRequest } from '../types';
import AdminSettings from '../models/AdminSettings';

// Get admin payment settings
export const getAdminSettings = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        // Get the first (and should be only) admin settings document
        let settings = await AdminSettings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Admin payment settings not configured'
            });
        }

        return res.json({
            success: true,
            data: settings
        });
    } catch (error: any) {
        console.error('Error fetching admin settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch admin settings',
            error: error.message
        });
    }
};

// Update admin payment settings
export const updateAdminSettings = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { upiId, qrCodeUrl, businessName } = req.body;

        // Validation
        if (!upiId || !qrCodeUrl) {
            return res.status(400).json({
                success: false,
                message: 'UPI ID and QR Code URL are required'
            });
        }

        // Find existing settings or create new
        let settings = await AdminSettings.findOne();

        if (settings) {
            // Update existing
            settings.upiId = upiId;
            settings.qrCodeUrl = qrCodeUrl;
            if (businessName) settings.businessName = businessName;
            await settings.save();
        } else {
            // Create new
            settings = await AdminSettings.create({
                upiId,
                qrCodeUrl,
                businessName: businessName || 'Box Cricket Platform'
            });
        }

        return res.json({
            success: true,
            message: 'Admin payment settings updated successfully',
            data: settings
        });
    } catch (error: any) {
        console.error('Error updating admin settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update admin settings',
            error: error.message
        });
    }
};
