import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import Booking from '../models/Booking';
import Slot from '../models/Slot';
import Venue from '../models/Venue';
import Owner from '../models/Owner';
import { generateBookingId } from '../utils/generateBookingId';
import autoApprovalService from '../services/autoApprovalService';
import notificationService, { NotificationEvent } from '../services/notificationService';
import { sendBookingRequest } from '../services/smsService';
import User from '../models/User';
import subscriptionService from '../services/subscriptionService';

// Create booking
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { slotId, slots, venueId, courtId, sportId, amount, utr } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Get venue owner
        const venue = await Venue.findById(venueId);
        if (!venue) {
            res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
            return;
        }

        // Check subscription limits
        const canBook = await subscriptionService.canCreateBooking(venue.ownerId.toString());
        if (!canBook.allowed) {
            res.status(403).json({
                success: false,
                message: canBook.message
            });
            return;
        }

        // Support both single and multiple slots
        let slotIds: string[] = [];

        if (slots) {
            // Multiple slots (comma-separated string or array)
            slotIds = typeof slots === 'string' ? slots.split(',') : slots;
        } else if (slotId) {
            // Single slot
            slotIds = [slotId];
        }

        if (!slotIds || slotIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Please provide at least one slot'
            });
            return;
        }

        // Validate all required fields
        if (!venueId || !courtId || !sportId || !amount) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
            return;
        }

        // Check if all slots exist and are available
        const slotsData = await Slot.find({ _id: { $in: slotIds } });

        if (slotsData.length !== slotIds.length) {
            res.status(404).json({
                success: false,
                message: 'Some slots not found'
            });
            return;
        }

        const unavailableSlots = slotsData.filter(s => s.status !== 'available');
        if (unavailableSlots.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Some slots are not available'
            });
            return;
        }

        // Get payment proof from uploaded file
        const paymentProof = req.file ? `/uploads/${req.file.filename}` : undefined;

        // Generate unique booking code
        const bookingCode = generateBookingId();

        // Create booking
        const booking = await Booking.create({
            bookingCode,
            userId,
            slotId: slotIds[0], // For backward compatibility
            slots: slotIds, // Array of slot IDs
            venueId,
            courtId,
            sportId,
            amount: parseFloat(amount),
            paymentProof,
            utr,
            status: 'pending'
        });

        // Mark all slots as booked
        await Slot.updateMany(
            { _id: { $in: slotIds } },
            { status: 'booked' }
        );

        // Populate booking details for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name email phone')
            .populate('venueId', 'name city address ownerId')
            .populate('courtId', 'name')
            .populate('sportId', 'name icon')
            .populate('slots', 'date startTime endTime price');

        if (!populatedBooking) {
            res.status(404).json({
                success: false,
                message: 'Booking details not found'
            });
            return;
        }

        // Increment booking count in subscription
        await subscriptionService.incrementBookingCount(venue.ownerId.toString());

        const owner = await Owner.findById(venue.ownerId).populate('subscriptionPlan');

        // ========================================
        // AUTO-APPROVAL CHECK
        // ========================================
        let approvalResult = null;
        if (owner) {
            approvalResult = await autoApprovalService.checkAutoApproval(
                booking._id.toString(),
                owner._id.toString()
            );

            console.log('Auto-approval result:', approvalResult);
        }

        // ========================================
        // SEND NOTIFICATIONS
        // ========================================
        const customer = (populatedBooking as any).userId as any;
        const subscription = owner?.subscriptionPlan;

        if (approvalResult?.approved) {
            // Booking was auto-approved
            await notificationService.sendNotification(
                NotificationEvent.BOOKING_CONFIRMED,
                populatedBooking,
                {
                    id: customer._id.toString(),
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email
                },
                subscription
            );

            // Notify owner about auto-approved booking
            if (owner) {
                await notificationService.sendNotification(
                    NotificationEvent.NEW_BOOKING_REQUEST,
                    populatedBooking as any,
                    {
                        id: (owner as any).userId.toString(),
                        name: 'Owner',
                        phone: (owner as any).phone || '',
                        email: (owner as any).email || ''
                    },
                    subscription
                );

                // Send direct SMS to owner about new booking (auto-approved)
                try {
                    const ownerUser = await User.findById((owner as any).userId);
                    const slot = (populatedBooking as any).slots && (populatedBooking as any).slots.length > 0
                        ? (populatedBooking as any).slots[0]
                        : null;

                    if (ownerUser && ownerUser.phone && slot) {
                        const date = new Date(slot.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        });
                        const time = `${slot.startTime} - ${slot.endTime}`;

                        await sendBookingRequest(
                            ownerUser.phone,
                            booking.bookingCode,
                            customer.name,
                            ((populatedBooking as any).sportId as any)?.name || 'N/A',
                            date,
                            time
                        );
                        console.log('✅ Auto-approved booking SMS sent to owner');
                    }
                } catch (smsError) {
                    console.error('❌ Failed to send auto-approved booking SMS to owner:', smsError);
                    // Don't fail booking creation if SMS fails
                }
            }

            res.status(201).json({
                success: true,
                message: `✅ Booking confirmed instantly! ${slotIds.length} slot(s) booked.`,
                autoApproved: true,
                data: populatedBooking
            });
        } else {
            // Booking requires manual approval
            await notificationService.sendNotification(
                NotificationEvent.BOOKING_CREATED,
                populatedBooking,
                {
                    id: customer._id.toString(),
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email
                },
                subscription
            );

            // Notify owner for review
            if (owner) {
                await notificationService.sendNotification(
                    NotificationEvent.NEW_BOOKING_REQUEST,
                    populatedBooking as any,
                    {
                        id: (owner as any).userId.toString(),
                        name: 'Owner',
                        phone: (owner as any).phone || '',
                        email: (owner as any).email || ''
                    },
                    subscription
                );

                // Send direct SMS to owner about new booking request
                try {
                    const ownerUser = await User.findById((owner as any).userId);
                    const slot = (populatedBooking as any).slots && (populatedBooking as any).slots.length > 0
                        ? (populatedBooking as any).slots[0]
                        : null;

                    if (ownerUser && ownerUser.phone && slot) {
                        const date = new Date(slot.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        });
                        const time = `${slot.startTime} - ${slot.endTime}`;

                        await sendBookingRequest(
                            ownerUser.phone,
                            booking.bookingCode,
                            customer.name,
                            ((populatedBooking as any).sportId as any)?.name || 'N/A',
                            date,
                            time
                        );
                        console.log('✅ Booking request SMS sent to owner');
                    }
                } catch (smsError) {
                    console.error('❌ Failed to send booking request SMS to owner:', smsError);
                    // Don't fail booking creation if SMS fails
                }
            }

            res.status(201).json({
                success: true,
                message: `Successfully booked ${slotIds.length} slot(s). Waiting for owner approval.`,
                autoApproved: false,
                approvalReason: approvalResult?.reason,
                data: populatedBooking
            });
        }
    } catch (error: any) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate('userId', 'name phone email')
            .populate('venueId', 'name city address')
            .populate('courtId', 'name')
            .populate('sportId', 'name icon')
            .populate('slots', 'date startTime endTime price');

        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
            return;
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error: any) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Cancel booking
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const booking = await Booking.findById(id);

        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
            return;
        }

        // Check if user owns this booking
        if (booking.userId !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
            return;
        }

        // Check if booking can be cancelled
        if (booking.status === 'confirmed') {
            res.status(400).json({
                success: false,
                message: 'Cannot cancel confirmed booking. Please contact venue owner.'
            });
            return;
        }

        // Update booking status
        booking.status = 'cancelled' as any; // BookingStatus.CANCELLED
        await booking.save();

        // Release the slots
        const slotIds = booking.slots && booking.slots.length > 0
            ? booking.slots
            : [booking.slotId];

        await Slot.updateMany(
            { _id: { $in: slotIds } },
            { status: 'available' }
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error: any) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
