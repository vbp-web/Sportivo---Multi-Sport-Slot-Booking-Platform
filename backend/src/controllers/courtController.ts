import { Response } from 'express';
import { AuthRequest } from '../types';
import Court from '../models/Court';
import Venue from '../models/Venue';
import Owner from '../models/Owner';
import subscriptionService from '../services/subscriptionService';

/**
 * @route   GET /api/owner/courts
 * @desc    Get all courts for the logged-in owner
 * @access  Private/Owner
 */
export const getOwnerCourts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Get Owner record
        const owner = await Owner.findOne({ userId });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Get all venues for this owner
        const venues = await Venue.find({ ownerId: owner._id });
        const venueIds = venues.map(v => v._id);

        // Get all courts for these venues
        const courts = await Court.find({ venueId: { $in: venueIds } })
            .populate('venueId', 'name city')
            .populate('sportId', 'name icon')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: courts
        });
        return;
    } catch (error: any) {
        console.error('Get owner courts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching courts',
            error: error.message
        });
        return;
    }
};

/**
 * @route   POST /api/owner/courts
 * @desc    Create a new court
 * @access  Private/Owner
 */
export const createCourt = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { venueId, sportId, name, description, capacity, price, pricePerHour } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Get Owner record
        const owner = await Owner.findOne({ userId });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Verify venue belongs to this owner
        const venue = await Venue.findOne({ _id: venueId, ownerId: owner._id });

        if (!venue) {
            res.status(404).json({
                success: false,
                message: 'Venue not found or does not belong to you'
            });
            return;
        }

        // Check subscription limits
        const currentCourts = await Court.countDocuments({ venueId });
        const canAdd = await subscriptionService.canAddCourt(owner._id.toString(), currentCourts);
        if (!canAdd.allowed) {
            res.status(403).json({
                success: false,
                message: canAdd.message
            });
            return;
        }

        // Create court
        const court = await Court.create({
            venueId,
            sportId,
            name,
            description,
            capacity,
            price: price || pricePerHour || 1000,
            isActive: true
        });

        const populatedCourt = await Court.findById(court._id)
            .populate('venueId', 'name city')
            .populate('sportId', 'name icon');

        res.status(201).json({
            success: true,
            message: 'Court created successfully',
            data: populatedCourt
        });
        return;
    } catch (error: any) {
        console.error('Create court error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating court',
            error: error.message
        });
        return;
    }
};

/**
 * @route   GET /api/owner/courts/:id
 * @desc    Get a single court by ID
 * @access  Private/Owner
 */
export const getCourtById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Get Owner record
        const owner = await Owner.findOne({ userId });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Get court and verify it belongs to owner's venue
        const court = await Court.findById(id)
            .populate('venueId', 'name city ownerId')
            .populate('sportId', 'name icon');

        if (!court) {
            res.status(404).json({
                success: false,
                message: 'Court not found'
            });
            return;
        }

        // Check if venue belongs to this owner
        const venue = court.venueId as any;
        if (venue.ownerId.toString() !== owner._id.toString()) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: court
        });
        return;
    } catch (error: any) {
        console.error('Get court error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching court',
            error: error.message
        });
        return;
    }
};

/**
 * @route   PUT /api/owner/courts/:id
 * @desc    Update a court
 * @access  Private/Owner
 */
export const updateCourt = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const updateData = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Get Owner record
        const owner = await Owner.findOne({ userId });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Get court and verify ownership
        const court = await Court.findById(id).populate('venueId', 'ownerId');

        if (!court) {
            res.status(404).json({
                success: false,
                message: 'Court not found'
            });
            return;
        }

        const venue = court.venueId as any;
        if (venue.ownerId.toString() !== owner._id.toString()) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        // Update court
        if (updateData.pricePerHour && !updateData.price) {
            updateData.price = updateData.pricePerHour;
        }
        Object.assign(court, updateData);
        await court.save();

        const updatedCourt = await Court.findById(court._id)
            .populate('venueId', 'name city')
            .populate('sportId', 'name icon');

        res.status(200).json({
            success: true,
            message: 'Court updated successfully',
            data: updatedCourt
        });
        return;
    } catch (error: any) {
        console.error('Update court error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating court',
            error: error.message
        });
        return;
    }
};

/**
 * @route   PATCH /api/owner/courts/:id
 * @desc    Toggle court active status
 * @access  Private/Owner
 */
export const toggleCourtStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { isActive } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Get Owner record
        const owner = await Owner.findOne({ userId });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Get court and verify ownership
        const court = await Court.findById(id).populate('venueId', 'ownerId');

        if (!court) {
            res.status(404).json({
                success: false,
                message: 'Court not found'
            });
            return;
        }

        const venue = court.venueId as any;
        if (venue.ownerId.toString() !== owner._id.toString()) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        // Update status
        court.isActive = isActive;
        await court.save();

        res.status(200).json({
            success: true,
            message: `Court ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: court
        });
        return;
    } catch (error: any) {
        console.error('Toggle court status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating court status',
            error: error.message
        });
        return;
    }
};

/**
 * @route   DELETE /api/owner/courts/:id
 * @desc    Delete a court
 * @access  Private/Owner
 */
export const deleteCourt = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        // Get Owner record
        const owner = await Owner.findOne({ userId });

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner profile not found'
            });
            return;
        }

        // Get court and verify ownership
        const court = await Court.findById(id).populate('venueId', 'ownerId');

        if (!court) {
            res.status(404).json({
                success: false,
                message: 'Court not found'
            });
            return;
        }

        const venue = court.venueId as any;
        if (venue.ownerId.toString() !== owner._id.toString()) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        // Delete court
        await Court.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Court deleted successfully'
        });
        return;
    } catch (error: any) {
        console.error('Delete court error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting court',
            error: error.message
        });
        return;
    }
};
