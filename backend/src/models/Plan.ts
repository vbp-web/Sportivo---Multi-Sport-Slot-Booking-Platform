import mongoose, { Schema } from 'mongoose';
import { IPlan } from '../types';

const planSchema = new Schema<IPlan>(
    {
        name: {
            type: String,
            required: [true, 'Plan name is required'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            enum: {
                values: [30, 365],
                message: 'Duration must be either 30 days (Monthly) or 365 days (Yearly)'
            }
        },
        durationType: {
            type: String,
            enum: ['monthly', 'yearly'],
            required: [true, 'Duration type is required']
        },
        features: [Schema.Types.Mixed], // Can be ObjectId or String for backward compatibility
        featureIds: [{
            type: Schema.Types.ObjectId,
            ref: 'Feature'
        }],
        maxVenues: {
            type: Number,
            required: [true, 'Max venues is required'],
            min: [1, 'Max venues must be at least 1']
        },
        maxCourts: {
            type: Number,
            required: [true, 'Max courts is required'],
            min: [1, 'Max courts must be at least 1']
        },
        maxBookings: {
            type: Number,
            default: 0
        },
        maxMessages: {
            type: Number,
            default: 0
        },
        isUnlimitedBookings: {
            type: Boolean,
            default: false
        },
        isUnlimitedMessages: {
            type: Boolean,
            default: false
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
planSchema.index({ isActive: 1 });
planSchema.index({ price: 1 });

const Plan = mongoose.model<IPlan>('Plan', planSchema);

export default Plan;

