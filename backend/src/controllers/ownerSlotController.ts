import { Response } from 'express';
import { AuthRequest, SlotStatus } from '../types';
import Slot from '../models/Slot';
import Court from '../models/Court';
import Venue from '../models/Venue';
import Owner from '../models/Owner';

/**
 * @route   GET /api/owner/slots
 * @desc    Get all slots for venues owned by the logged-in owner
 * @access  Private/Owner
 */
export const getOwnerSlots = async (req: AuthRequest, res: Response): Promise<void> => {
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

        // Get all slots for these venues
        const slots = await Slot.find({ venueId: { $in: venueIds } })
            .populate({
                path: 'courtId',
                select: 'name sportId venueId',
                populate: [
                    {
                        path: 'venueId',
                        select: 'name'
                    },
                    {
                        path: 'sportId',
                        select: 'name'
                    }
                ]
            })
            .sort({ date: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            data: slots
        });
        return;
    } catch (error: any) {
        console.error('Get owner slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching slots',
            error: error.message
        });
        return;
    }
};

/**
 * @route   POST /api/owner/slots/generate
 * @desc    Generate slots for a court on a specific date
 * @access  Private/Owner
 */
export const generateSlots = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { courtId, date, price } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        if (!courtId || !date) {
            res.status(400).json({
                success: false,
                message: 'Court ID and Date are required'
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

        // Verify court belongs to owner's venue
        const court = await Court.findById(courtId).populate('venueId');
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
                message: 'Access denied. You do not own this court.'
            });
            return;
        }

        // Check if slots already exist for this court and date
        const existingSlots = await Slot.find({ courtId, date: new Date(date) });
        if (existingSlots.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Slots already exist for this date and court'
            });
            return;
        }

        // Use price from request, or court's default price, or fallback 1000
        const slotPrice = price || court.price || 1000;

        // Generate hourly slots (e.g., 06:00 to 23:00)
        const slotsToCreate = [];
        for (let hour = 6; hour < 23; hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00`;
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

            slotsToCreate.push({
                courtId,
                venueId: venue._id,
                sportId: court.sportId,
                date: new Date(date),
                startTime,
                endTime,
                price: slotPrice,
                status: SlotStatus.AVAILABLE
            });
        }

        const createdSlots = await Slot.insertMany(slotsToCreate);

        res.status(201).json({
            success: true,
            message: `Successfully generated ${createdSlots.length} slots`,
            count: createdSlots.length,
            data: createdSlots
        });
        return;
    } catch (error: any) {
        console.error('Generate slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating slots',
            error: error.message
        });
        return;
    }
};

/**
 * @route   PATCH /api/owner/slots/:id
 * @desc    Update slot status (block/unblock)
 * @access  Private/Owner
 */
export const updateSlotStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { status } = req.body;

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

        // Get slot and verify ownership
        const slot = await Slot.findById(id).populate({
            path: 'courtId',
            populate: { path: 'venueId' }
        });

        if (!slot) {
            res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
            return;
        }

        const venue = (slot.courtId as any).venueId;
        if (venue.ownerId.toString() !== owner._id.toString()) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        // Update status
        slot.status = status;
        await slot.save();

        res.status(200).json({
            success: true,
            message: 'Slot status updated successfully',
            data: slot
        });
        return;
    } catch (error: any) {
        console.error('Update slot status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating slot',
            error: error.message
        });
        return;
    }
};
