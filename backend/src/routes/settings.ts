import express from 'express';
import AdminSettings from '../models/AdminSettings';

const router = express.Router();

// GET /api/settings/payment - Public endpoint to get payment settings (no auth required)
router.get('/payment', async (req, res) => {
    try {
        const settings = await AdminSettings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Admin payment settings not configured. Please contact support.'
            });
        }

        // Return only public payment information
        return res.json({
            success: true,
            data: {
                upiId: settings.upiId,
                qrCodeUrl: settings.qrCodeUrl,
                businessName: settings.businessName
            }
        });
    } catch (error: any) {
        console.error('Error fetching payment settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payment settings',
            error: error.message
        });
    }
});

export default router;
