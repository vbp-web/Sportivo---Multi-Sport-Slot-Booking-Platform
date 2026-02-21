import mongoose, { Schema } from 'mongoose';
import { IBooking, BookingStatus } from '../types';

const bookingSchema = new Schema<IBooking>(
    {
        bookingCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },
        userId: {
            type: String,
            required: true,
            ref: 'User'
        },
        // Support for multiple slots in one booking
        slotId: {
            type: String,
            ref: 'Slot'
        },
        slots: [{
            type: String,
            ref: 'Slot'
        }],
        venueId: {
            type: String,
            required: true,
            ref: 'Venue'
        },
        courtId: {
            type: String,
            required: true,
            ref: 'Court'
        },
        sportId: {
            type: String,
            required: true,
            ref: 'Sport'
        },
        paymentProof: {
            type: String
        },
        utr: {
            type: String,
            trim: true
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative']
        },
        status: {
            type: String,
            enum: Object.values(BookingStatus),
            default: BookingStatus.PENDING
        },
        rejectionReason: {
            type: String
        },
        confirmedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Indexes
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ venueId: 1, status: 1 });
bookingSchema.index({ slotId: 1 });
bookingSchema.index({ slots: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
