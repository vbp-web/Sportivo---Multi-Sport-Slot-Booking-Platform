import { Response } from 'express';
import { AuthRequest } from '../types';
import Venue from '../models/Venue';
import Owner from '../models/Owner';
import subscriptionService from '../services/subscriptionService';

/**
 * @route   GET /api/owner/venues
 * @desc    Get all venues for the logged-in owner
 * @access  Private/Owner
 */
export const getOwnerVenues = async (req: AuthRequest, res: Response): Promise<void> => {
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
        const venues = await Venue.find({ ownerId: owner._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: venues
        });
        return;
    } catch (error: any) {
        console.error('Get owner venues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching venues',
            error: error.message
        });
        return;
    }
};

/**
 * @route   POST /api/owner/venues
 * @desc    Create a new venue
 * @access  Private/Owner
 */
export const createVenue = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { name, description, address, city, pincode, phone, contactNumber, email, amenities } = req.body;

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

        // Use contactNumber if phone is not provided (frontend compatibility)
        const phoneNumber = phone || contactNumber;

        // Check subscription limits
        const currentVenues = await Venue.countDocuments({ ownerId: owner._id });
        const canAdd = await subscriptionService.canAddVenue(owner._id.toString(), currentVenues);
        if (!canAdd.allowed) {
            res.status(403).json({
                success: false,
                message: canAdd.message
            });
            return;
        }

        // Create venue
        const venue = await Venue.create({
            ownerId: owner._id,
            name,
            description,
            address,
            city,
            pincode,
            phone: phoneNumber,
            email,
            amenities: amenities || [],
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Venue created successfully',
            data: venue
        });
        return;
    } catch (error: any) {
        console.error('Create venue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating venue',
            error: error.message
        });
        return;
    }
};

/**
 * @route   GET /api/owner/venues/:id
 * @desc    Get a single venue by ID
 * @access  Private/Owner
 */
export const getVenueById = async (req: AuthRequest, res: Response): Promise<void> => {
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

        // Get venue (ensure it belongs to this owner)
        const venue = await Venue.findOne({ _id: id, ownerId: owner._id });

        if (!venue) {
            res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: venue
        });
        return;
    } catch (error: any) {
        console.error('Get venue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching venue',
            error: error.message
        });
        return;
    }
};

/**
 * @route   PUT /api/owner/venues/:id
 * @desc    Update a venue
 * @access  Private/Owner
 */
export const updateVenue = async (req: AuthRequest, res: Response): Promise<void> => {
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

        // Update venue (ensure it belongs to this owner)
        const venue = await Venue.findOneAndUpdate(
            { _id: id, ownerId: owner._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!venue) {
            res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Venue updated successfully',
            data: venue
        });
        return;
    } catch (error: any) {
        console.error('Update venue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating venue',
            error: error.message
        });
        return;
    }
};

/**
 * @route   PATCH /api/owner/venues/:id
 * @desc    Toggle venue active status
 * @access  Private/Owner
 */
export const toggleVenueStatus = async (req: AuthRequest, res: Response): Promise<void> => {
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

        // Update venue status
        const venue = await Venue.findOneAndUpdate(
            { _id: id, ownerId: owner._id },
            { isActive },
            { new: true }
        );

        if (!venue) {
            res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: `Venue ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: venue
        });
        return;
    } catch (error: any) {
        console.error('Toggle venue status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating venue status',
            error: error.message
        });
        return;
    }
};

/**
 * @route   DELETE /api/owner/venues/:id
 * @desc    Delete a venue
 * @access  Private/Owner
 */
export const deleteVenue = async (req: AuthRequest, res: Response): Promise<void> => {
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

        // Delete venue (ensure it belongs to this owner)
        const venue = await Venue.findOneAndDelete({ _id: id, ownerId: owner._id });

        if (!venue) {
            res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Venue deleted successfully'
        });
        return;
    } catch (error: any) {
        console.error('Delete venue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting venue',
            error: error.message
        });
        return;
    }
};
