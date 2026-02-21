import { Response } from 'express';
import { AuthRequest, OwnerStatus } from '../types';
import Owner from '../models/Owner';

/**
 * @route   GET /api/admin/owners
 * @desc    Get all owners
 * @access  Private/Admin
 */
export const getAllOwners = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owners = await Owner.find({})
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: owners.length,
            data: owners
        });
    } catch (error: any) {
        console.error('Get all owners error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching owners',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/admin/owners/pending
 * @desc    Get pending owner requests
 * @access  Private/Admin
 */
export const getPendingOwners = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const pendingOwners = await Owner.find({ status: OwnerStatus.PENDING })
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pendingOwners.length,
            data: pendingOwners
        });
    } catch (error: any) {
        console.error('Get pending owners error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching pending owners',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/admin/owners/:id/approve
 * @desc    Approve owner request
 * @access  Private/Admin
 */
export const approveOwner = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findById(req.params.id).populate('userId', 'name email phone');

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
            return;
        }

        if (owner.status !== OwnerStatus.PENDING) {
            res.status(400).json({
                success: false,
                message: `Owner is already ${owner.status}`
            });
            return;
        }

        owner.status = OwnerStatus.APPROVED;
        owner.approvedAt = new Date();
        await owner.save();

        // Send SMS notification to owner
        try {
            const { sendOwnerApproval } = await import('../services/smsService');
            const user = owner.userId as any;

            if (user && user.phone) {
                await sendOwnerApproval(user.phone, owner.ownerName);
                console.log('✅ Owner approval SMS sent');
            }
        } catch (smsError) {
            console.error('❌ Failed to send owner approval SMS:', smsError);
            // Don't fail the approval if SMS fails
        }

        res.status(200).json({
            success: true,
            message: 'Owner approved successfully',
            data: owner
        });
    } catch (error: any) {
        console.error('Approve owner error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error approving owner',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/admin/owners/:id/reject
 * @desc    Reject owner request
 * @access  Private/Admin
 */
export const rejectOwner = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { reason } = req.body;
        const owner = await Owner.findById(req.params.id).populate('userId', 'name email phone');

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
            return;
        }

        if (owner.status !== OwnerStatus.PENDING) {
            res.status(400).json({
                success: false,
                message: `Owner is already ${owner.status}`
            });
            return;
        }

        owner.status = OwnerStatus.REJECTED;
        owner.rejectionReason = reason || 'Not specified';
        await owner.save();

        res.status(200).json({
            success: true,
            message: 'Owner rejected successfully',
            data: owner
        });
    } catch (error: any) {
        console.error('Reject owner error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error rejecting owner',
            error: error.message
        });
    }
};

/**
 * @route   PATCH /api/admin/owners/:id/suspend
 * @desc    Suspend owner account
 * @access  Private/Admin
 */
export const suspendOwner = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findById(req.params.id).populate('userId', 'name email phone');

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
            return;
        }

        owner.status = OwnerStatus.SUSPENDED;
        await owner.save();

        res.status(200).json({
            success: true,
            message: 'Owner suspended successfully',
            data: owner
        });
    } catch (error: any) {
        console.error('Suspend owner error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error suspending owner',
            error: error.message
        });
    }
};

/**
 * @route   PATCH /api/admin/owners/:id/activate
 * @desc    Activate suspended owner account
 * @access  Private/Admin
 */
export const activateOwner = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const owner = await Owner.findById(req.params.id).populate('userId', 'name email phone');

        if (!owner) {
            res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
            return;
        }

        if (owner.status === OwnerStatus.PENDING) {
            res.status(400).json({
                success: false,
                message: 'Cannot activate pending owner. Please approve first.'
            });
            return;
        }

        owner.status = OwnerStatus.APPROVED;
        await owner.save();

        res.status(200).json({
            success: true,
            message: 'Owner activated successfully',
            data: owner
        });
    } catch (error: any) {
        console.error('Activate owner error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error activating owner',
            error: error.message
        });
    }
};
