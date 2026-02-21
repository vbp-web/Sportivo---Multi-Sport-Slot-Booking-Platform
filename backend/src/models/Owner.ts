import mongoose, { Schema } from 'mongoose';
import { IOwner, OwnerStatus } from '../types';

const ownerSchema = new Schema<IOwner>(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
            unique: true
        },
        ownerName: {
            type: String,
            required: [true, 'Owner name is required'],
            trim: true
        },
        venueName: {
            type: String,
            required: [true, 'Venue name is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        sportsOffered: [{
            type: String,
            trim: true
        }],
        status: {
            type: String,
            enum: Object.values(OwnerStatus),
            default: OwnerStatus.PENDING
        },
        phone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        subscriptionPlan: {
            type: Schema.Types.ObjectId,
            ref: 'Plan'
        },
        upiId: {
            type: String,
            trim: true
        },
        upiQrCode: {
            type: String
        },
        rejectionReason: {
            type: String
        },
        approvedAt: {
            type: Date
        },
        approvedBy: {
            type: String,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
ownerSchema.index({ status: 1 });
ownerSchema.index({ city: 1 });

const Owner = mongoose.model<IOwner>('Owner', ownerSchema);

export default Owner;
