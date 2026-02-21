import Booking from '../models/Booking';
import Slot from '../models/Slot';
import { BookingStatus, SlotStatus } from '../types';

// Check if slot is available for booking
export const isSlotAvailable = async (slotId: string): Promise<boolean> => {
    const slot = await Slot.findById(slotId);
    return slot?.status === SlotStatus.AVAILABLE;
};

// Get booking statistics for a venue
export const getVenueBookingStats = async (venueId: string) => {
    const totalBookings = await Booking.countDocuments({ venue: venueId });
    const confirmedBookings = await Booking.countDocuments({
        venue: venueId,
        status: BookingStatus.CONFIRMED
    });
    const pendingBookings = await Booking.countDocuments({
        venue: venueId,
        status: BookingStatus.PENDING
    });

    const revenue = await Booking.aggregate([
        { $match: { venue: venueId, status: BookingStatus.CONFIRMED } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalRevenue: revenue[0]?.total || 0
    };
};

// Cancel expired bookings
export const cancelExpiredBookings = async () => {
    const now = new Date();

    const expiredBookings = await Booking.find({
        status: BookingStatus.PENDING,
        createdAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } // 24 hours old
    });

    for (const booking of expiredBookings) {
        booking.status = BookingStatus.CANCELLED;
        await booking.save();

        // Free up the slots
        if (booking.slotId) {
            await Slot.findByIdAndUpdate(booking.slotId, { status: SlotStatus.AVAILABLE });
        } else if (booking.slots && booking.slots.length > 0) {
            for (const slotId of booking.slots) {
                await Slot.findByIdAndUpdate(slotId, { status: SlotStatus.AVAILABLE });
            }
        }
    }

    return expiredBookings.length;
};
