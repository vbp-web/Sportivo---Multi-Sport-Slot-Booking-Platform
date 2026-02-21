import express from 'express';
import { getAllPlans, getPlanById } from '../controllers/planController';
import AdminSettings from '../models/AdminSettings';

const router = express.Router();

// GET /api/plans - Get all active plans
router.get('/', getAllPlans);

// GET /api/plans/settings/payment - Public endpoint to get payment settings (MUST BE BEFORE /:id)
router.get('/settings/payment', async (req, res) => {
    try {
        const settings = await AdminSettings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Admin payment settings not configured. Please contact support.'
            });
        }

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

// GET /api/plans/:id - Get plan details (MUST BE AFTER specific routes)
router.get('/:id', getPlanById);

export default router;
