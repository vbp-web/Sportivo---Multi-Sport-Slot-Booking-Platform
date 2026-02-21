import mongoose, { Schema } from 'mongoose';
import { ISlot, SlotStatus } from '../types';

const slotSchema = new Schema<ISlot>(
    {
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
        venueId: {
            type: String,
            required: true,
            ref: 'Venue'
        },
        date: {
            type: Date,
            required: [true, 'Date is required']
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        status: {
            type: String,
            enum: Object.values(SlotStatus),
            default: SlotStatus.AVAILABLE
        }
    },
    {
        timestamps: true
    }
);

// Indexes
slotSchema.index({ courtId: 1, date: 1 });
slotSchema.index({ venueId: 1, date: 1 });
slotSchema.index({ sportId: 1 });
slotSchema.index({ status: 1 });
slotSchema.index({ date: 1, startTime: 1 });

// Compound unique index to prevent double booking
slotSchema.index({ courtId: 1, date: 1, startTime: 1 }, { unique: true });

const Slot = mongoose.model<ISlot>('Slot', slotSchema);

export default Slot;
