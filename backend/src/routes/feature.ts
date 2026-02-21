import express from 'express';
import {
    getAllFeatures,
    getActiveFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    toggleFeatureStatus
} from '../controllers/featureController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roleCheck';
import { UserRole } from '../types';

const router = express.Router();

// Public routes (for displaying features to users)
router.get('/active', getActiveFeatures);

// Admin routes (protected)
router.get('/', protect, authorize(UserRole.ADMIN), getAllFeatures);
router.post('/', protect, authorize(UserRole.ADMIN), createFeature);
router.put('/:id', protect, authorize(UserRole.ADMIN), updateFeature);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteFeature);
router.patch('/:id/toggle', protect, authorize(UserRole.ADMIN), toggleFeatureStatus);

export default router;
