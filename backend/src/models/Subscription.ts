import mongoose, { Schema } from 'mongoose';
import { ISubscription, SubscriptionStatus } from '../types';

const subscriptionSchema = new Schema<ISubscription>(
    {
        ownerId: {
            type: String,
            required: true,
            ref: 'Owner'
        },
        planId: {
            type: String,
            required: true,
            ref: 'Plan'
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
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
            enum: Object.values(SubscriptionStatus),
            default: SubscriptionStatus.PENDING
        },
        autoRenew: {
            type: Boolean,
            default: false
        },
        bookingsCount: {
            type: Number,
            default: 0
        },
        messagesCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Indexes
subscriptionSchema.index({ ownerId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ status: 1 });

const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;
