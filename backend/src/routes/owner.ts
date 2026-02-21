import express from 'express';
import { protect } from '../middleware/auth';
import { authorize, checkSubscription, checkFeature } from '../middleware/roleCheck';

import { UserRole } from '../types';
import { getOwnerSubscription, subscribeToPlan } from '../controllers/ownerSubscriptionController';
import { getOwnerPaymentSettings, updateOwnerPaymentSettings } from '../controllers/ownerPaymentController';
import { getOwnerVenues, createVenue, getVenueById, updateVenue, toggleVenueStatus, deleteVenue } from '../controllers/venueController';
import { getOwnerCourts, createCourt, getCourtById, updateCourt, toggleCourtStatus, deleteCourt } from '../controllers/courtController';
import { getOwnerSlots, generateSlots, updateSlotStatus } from '../controllers/ownerSlotController';
import { getOwnerDashboard } from '../controllers/ownerDashboardController';
import { getAllBookings, approveBooking, rejectBooking, createOfflineBooking } from '../controllers/ownerController';
import upload from '../middleware/upload';

const router = express.Router();

// PUBLIC ROUTES (no authentication required)
// GET /api/owner/payment-settings/public/:ownerId - Get payment settings by owner ID (public)
router.get('/payment-settings/public/:ownerId', async (req, res) => {
    try {
        const { ownerId } = req.params;
        const Owner = (await import('../models/Owner')).default;

        const owner = await Owner.findById(ownerId);

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
            return;
        }

        if (!owner.upiId || !owner.upiQrCode) {
            res.status(404).json({
                success: false,
                message: 'Payment settings not configured'
            });
            return;
        }

        res.json({
            success: true,
            data: {
                upiId: owner.upiId,
                qrCodeUrl: owner.upiQrCode,
                businessName: owner.venueName
            }
        });
        return;
    } catch (error: any) {
        console.error('Get public payment settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
        return;
    }
});

// PROTECTED ROUTES (require authentication and owner role)
router.use(protect);
router.use(authorize(UserRole.OWNER));

// GET /api/owner/dashboard - Get dashboard stats (requires active subscription)
router.get('/dashboard', checkSubscription, getOwnerDashboard);

// Venue routes
router.get('/venues', checkSubscription, getOwnerVenues);
router.post('/venues', checkSubscription, createVenue);
router.get('/venues/:id', checkSubscription, getVenueById);
router.put('/venues/:id', checkSubscription, updateVenue);
router.patch('/venues/:id', checkSubscription, toggleVenueStatus);
router.delete('/venues/:id', checkSubscription, deleteVenue);

// Court routes
router.get('/courts', checkSubscription, getOwnerCourts);
router.post('/courts', checkSubscription, createCourt);
router.get('/courts/:id', checkSubscription, getCourtById);
router.put('/courts/:id', checkSubscription, updateCourt);
router.patch('/courts/:id', checkSubscription, toggleCourtStatus);
router.delete('/courts/:id', checkSubscription, deleteCourt);

// Slot routes
router.get('/slots', checkSubscription, getOwnerSlots);
router.post('/slots/generate', checkSubscription, generateSlots);
router.patch('/slots/:id', checkSubscription, updateSlotStatus);

// GET /api/owner/bookings - Get all bookings
router.get('/bookings', checkSubscription, getAllBookings);

// PUT /api/owner/bookings/:id/approve - Approve booking
router.put('/bookings/:id/approve', checkSubscription, approveBooking);

// PUT /api/owner/bookings/:id/reject - Reject booking
router.put('/bookings/:id/reject', checkSubscription, rejectBooking);

// POST /api/owner/bookings/offline - Create offline booking for walk-in customers
router.post('/bookings/offline', checkSubscription, createOfflineBooking);

// GET /api/owner/subscription - Get subscription status
router.get('/subscription', getOwnerSubscription);

// POST /api/owner/subscription - Subscribe to plan (with payment proof upload)
router.post('/subscription', upload.single('paymentProof'), subscribeToPlan);

// GET /api/owner/payment-settings - Get payment settings (protected)
router.get('/payment-settings', getOwnerPaymentSettings);

// PUT /api/owner/payment-settings - Update payment settings
router.put('/payment-settings', updateOwnerPaymentSettings);

// Auto-approval settings routes
import { getAutoApprovalSettings, updateAutoApprovalSettings, getAutoApprovalStats } from '../controllers/autoApprovalController';

// GET /api/owner/auto-approval - Get auto-approval settings
router.get('/auto-approval', checkSubscription, checkFeature('Auto Approval System'), getAutoApprovalSettings);

// PUT /api/owner/auto-approval - Update auto-approval settings
router.put('/auto-approval', checkSubscription, checkFeature('Auto Approval System'), updateAutoApprovalSettings);


// GET /api/owner/auto-approval/stats - Get auto-approval statistics
router.get('/auto-approval/stats', checkSubscription, checkFeature('Auto Approval System'), getAutoApprovalStats);


export default router;

