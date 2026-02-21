import express from 'express';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roleCheck';
import { UserRole } from '../types';
import {
    createCity,
    getAllCities,
    updateCity,
    deleteCity,
    toggleCityStatus
} from '../controllers/adminCityController';
import {
    getAllOwners,
    getPendingOwners,
    approveOwner,
    rejectOwner,
    suspendOwner,
    activateOwner
} from '../controllers/adminOwnerController';
import {
    getAllSports,
    createSport,
    updateSport,
    deleteSport,
    toggleSportStatus
} from '../controllers/adminSportController';
import {
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus
} from '../controllers/adminPlanController';
import { getAnalytics } from '../controllers/adminAnalyticsController';
import { getAdminSettings, updateAdminSettings } from '../controllers/adminSettingsController';
import {
    getAllSubscriptions,
    getPendingSubscriptions,
    approveSubscription,
    rejectSubscription,
    getSubscriptionDetails
} from '../controllers/adminSubscriptionController';
import { getAllBookings } from '../controllers/adminBookingController';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize(UserRole.ADMIN));

// GET /api/admin/dashboard - Get admin dashboard
router.get('/dashboard', async (req, res) => {
    res.json({ success: true, message: 'Get admin dashboard endpoint' });
});

// Owner Management Routes
router.get('/owners', getAllOwners);
router.get('/owners/pending', getPendingOwners);
router.put('/owners/:id/approve', approveOwner);
router.put('/owners/:id/reject', rejectOwner);
router.patch('/owners/:id/suspend', suspendOwner);
router.patch('/owners/:id/activate', activateOwner);

// Booking Management Routes
router.get('/bookings', getAllBookings);

// City Management Routes
router.get('/cities', getAllCities);
router.post('/cities', createCity);
router.put('/cities/:id', updateCity);
router.delete('/cities/:id', deleteCity);
router.patch('/cities/:id/toggle', toggleCityStatus);

// Sport Management Routes
router.get('/sports', getAllSports);
router.post('/sports', createSport);
router.put('/sports/:id', updateSport);
router.delete('/sports/:id', deleteSport);
router.patch('/sports/:id/toggle', toggleSportStatus);

// Plan Management Routes
router.get('/plans', getAllPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);
router.patch('/plans/:id/toggle', togglePlanStatus);

// Analytics Route
router.get('/analytics', getAnalytics);

// Subscription Management Routes
router.get('/subscriptions', getAllSubscriptions);
router.get('/subscriptions/pending', getPendingSubscriptions);
router.get('/subscriptions/:id', getSubscriptionDetails);
router.put('/subscriptions/:id/approve', approveSubscription);
router.put('/subscriptions/:id/reject', rejectSubscription);

// Admin Payment Settings Routes
router.get('/settings/payment', getAdminSettings);
router.put('/settings/payment', updateAdminSettings);

export default router;



