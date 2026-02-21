import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    bookingId: mongoose.Types.ObjectId;
    recipientId: mongoose.Types.ObjectId;
    event: string;
    channels: Array<{
        type: 'SMS' | 'WhatsApp' | 'Email';
        status: 'sent' | 'failed' | 'delivered' | 'read';
        messageId?: string;
        sentAt?: Date;
        deliveredAt?: Date;
        readAt?: Date;
        cost?: number;
        error?: string;
    }>;
    message: string;
    template?: string;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
            required: true
        },
        recipientId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        event: {
            type: String,
            required: true,
            enum: [
                'booking_created',
                'booking_confirmed',
                'booking_rejected',
                'booking_cancelled',
                'booking_reminder',
                'payment_received',
                'new_booking_request',
                'review_required'
            ]
        },
        channels: [{
            type: {
                type: String,
                enum: ['SMS', 'WhatsApp', 'Email'],
                required: true
            },
            status: {
                type: String,
                enum: ['sent', 'failed', 'delivered', 'read'],
                default: 'sent'
            },
            messageId: String,
            sentAt: {
                type: Date,
                default: Date.now
            },
            deliveredAt: Date,
            readAt: Date,
            cost: {
                type: Number,
                default: 0
            },
            error: String
        }],
        message: {
            type: String,
            required: true
        },
        template: String
    },
    {
        timestamps: true
    }
);

// Indexes
notificationSchema.index({ bookingId: 1 });
notificationSchema.index({ recipientId: 1 });
notificationSchema.index({ event: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
