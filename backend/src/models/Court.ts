import mongoose, { Schema } from 'mongoose';
import { ICourt } from '../types';

const courtSchema = new Schema<ICourt>(
    {
        venueId: {
            type: String,
            required: true,
            ref: 'Venue'
        },
        sportId: {
            type: String,
            required: true,
            ref: 'Sport'
        },
        name: {
            type: String,
            required: [true, 'Court name is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        capacity: {
            type: Number,
            min: 1
        },
        price: {
            type: Number,
            required: [true, 'Default price is required'],
            default: 1000,
            min: [0, 'Price cannot be negative']
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes
courtSchema.index({ venueId: 1 });
courtSchema.index({ sportId: 1 });
courtSchema.index({ isActive: 1 });

const Court = mongoose.model<ICourt>('Court', courtSchema);

export default Court;
