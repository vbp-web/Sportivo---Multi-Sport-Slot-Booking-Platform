import mongoose, { Schema } from 'mongoose';
import { IVenue } from '../types';

const venueSchema = new Schema<IVenue>(
    {
        ownerId: {
            type: String,
            required: true,
            ref: 'Owner'
        },
        name: {
            type: String,
            required: [true, 'Venue name is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        pincode: {
            type: String,
            required: [true, 'Pincode is required'],
            trim: true,
            match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        images: [{
            type: String
        }],
        amenities: [{
            type: String,
            trim: true
        }],
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
venueSchema.index({ ownerId: 1 });
venueSchema.index({ city: 1 });
venueSchema.index({ isActive: 1 });

const Venue = mongoose.model<IVenue>('Venue', venueSchema);

export default Venue;
