import axios from 'axios';
import subscriptionService from './subscriptionService';

// MSG91 Configuration
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

interface NotificationRecipient {
    id: string;
    name: string;
    phone: string;
    email?: string;
    language?: string;
}

interface NotificationResult {
    channel: 'SMS' | 'WhatsApp' | 'Email';
    status: 'sent' | 'failed';
    messageId?: string;
    error?: string;
    cost?: number;
}

export enum NotificationEvent {
    BOOKING_CREATED = 'booking_created',
    BOOKING_CONFIRMED = 'booking_confirmed',
    BOOKING_REJECTED = 'booking_rejected',
    BOOKING_CANCELLED = 'booking_cancelled',
    BOOKING_REMINDER = 'booking_reminder',
    PAYMENT_RECEIVED = 'payment_received',
    NEW_BOOKING_REQUEST = 'new_booking_request',
    REVIEW_REQUIRED = 'review_required'
}

class NotificationService {
    /**
     * Main method to send notifications
     */
    async sendNotification(
        event: NotificationEvent,
        booking: any,
        recipient: NotificationRecipient,
        subscription?: any
    ): Promise<NotificationResult[]> {
        try {
            const results: NotificationResult[] = [];

            // Check if MSG91 is configured
            if (!MSG91_AUTH_KEY) {
                console.warn('MSG91 not configured. Skipping SMS/WhatsApp notifications.');
                return results;
            }

            // Get ownerId from booking or venue
            const ownerId = booking.venue?.ownerId || (booking.venueId as any)?.ownerId;

            if (ownerId) {
                // Check message limit
                const canSend = await subscriptionService.canSendMessage(ownerId.toString());
                if (!canSend.allowed) {
                    console.warn(`Message limit reached for owner ${ownerId}. skipping notification.`);
                    return results;
                }
            }

            // Get message template
            const message = this.getMessageTemplate(event, booking, recipient);

            // Determine if SMS is enabled based on subscription
            const canSendSMS = subscription?.features?.smsNotifications || false;

            // Send SMS notification
            if (canSendSMS && recipient.phone) {
                const smsResult = await this.sendSMS(recipient.phone, message);
                results.push(smsResult);
            } else if (recipient.phone) {
                // Send even if subscription doesn't have SMS enabled (for critical notifications)
                console.log(`Sending critical notification to ${recipient.phone}`);
                const smsResult = await this.sendSMS(recipient.phone, message);
                results.push(smsResult);
            }

            // Increment message count if successfully sent
            if (ownerId && results.some(r => r.status === 'sent')) {
                await subscriptionService.incrementMessageCount(ownerId.toString());
            }

            // Log notification
            await this.logNotification(event, booking, recipient, results);

            return results;
        } catch (error) {
            console.error('Error sending notification:', error);
            return [];
        }
    }

    /**
     * Send SMS via MSG91
     */
    private async sendSMS(phone: string, message: string): Promise<NotificationResult> {
        try {
            if (!MSG91_AUTH_KEY || !MSG91_SENDER_ID) {
                console.warn('MSG91 not configured');
                return {
                    channel: 'SMS',
                    status: 'failed',
                    error: 'MSG91 not configured'
                };
            }

            // Format phone number (ensure it's 10 digits for India)
            const formattedPhone = this.formatPhoneNumber(phone);

            // MSG91 API endpoint for sending SMS
            const url = 'https://control.msg91.com/api/v5/flow/';

            const payload = {
                template_id: MSG91_TEMPLATE_ID,
                sender: MSG91_SENDER_ID,
                short_url: '0',
                mobiles: formattedPhone,
                message: message
            };

            const response = await axios.post(url, payload, {
                headers: {
                    'authkey': MSG91_AUTH_KEY,
                    'content-type': 'application/json'
                }
            });

            if (response.data.type === 'success') {
                return {
                    channel: 'SMS',
                    status: 'sent',
                    messageId: response.data.request_id
                };
            } else {
                return {
                    channel: 'SMS',
                    status: 'failed',
                    error: response.data.message || 'Unknown error'
                };
            }
        } catch (error: any) {
            console.error('SMS send error:', error.response?.data || error.message);
            return {
                channel: 'SMS',
                status: 'failed',
                error: error.message
            };
        }
    }



    /**
     * Format phone number to MSG91 format (91XXXXXXXXXX)
     */
    private formatPhoneNumber(phone: string): string {
        // Remove all non-numeric characters
        let cleaned = phone.replace(/\D/g, '');

        // If it doesn't start with country code, assume India (+91)
        if (!cleaned.startsWith('91') && cleaned.length === 10) {
            cleaned = '91' + cleaned;
        }

        return cleaned;
    }

    /**
     * Get message template based on event
     */
    private getMessageTemplate(
        event: NotificationEvent,
        booking: any,
        recipient: NotificationRecipient
    ): string {
        const platformName = process.env.PLATFORM_NAME || 'Sportivo';

        switch (event) {
            case NotificationEvent.BOOKING_CONFIRMED:
                return `✅ Booking Confirmed!

Venue: ${booking.venue?.name || 'N/A'}
Court: ${booking.court?.name || 'N/A'}
Date: ${this.formatDate(booking.date)}
Time: ${this.formatTime(booking.startTime)}-${this.formatTime(booking.endTime)}
Code: ${booking.bookingCode}

Show this code at venue.
${booking.venue?.address || ''}

- ${platformName}`;

            case NotificationEvent.BOOKING_CREATED:
                return `📝 Booking Request Received!

Hi ${recipient.name},

Your booking request has been received and is under review.

Venue: ${booking.venue?.name || 'N/A'}
Date: ${this.formatDate(booking.date)}
Time: ${this.formatTime(booking.startTime)}-${this.formatTime(booking.endTime)}
Code: ${booking.bookingCode}

You'll receive confirmation within 24 hours.

- ${platformName}`;

            case NotificationEvent.BOOKING_REMINDER:
                return `⏰ Reminder: Booking Tomorrow!

Hi ${recipient.name},

Your booking at ${booking.venue?.name || 'N/A'} is tomorrow!

📅 ${this.formatDate(booking.date)}
⏰ ${this.formatTime(booking.startTime)}-${this.formatTime(booking.endTime)}
🎫 Code: ${booking.bookingCode}

See you there! 🏏

- ${platformName}`;

            case NotificationEvent.BOOKING_REJECTED:
                return `❌ Booking Not Confirmed

Hi ${recipient.name},

Unfortunately, your booking request could not be confirmed.

Venue: ${booking.venue?.name || 'N/A'}
Date: ${this.formatDate(booking.date)}
Time: ${this.formatTime(booking.startTime)}-${this.formatTime(booking.endTime)}

${booking.rejectionReason ? `Reason: ${booking.rejectionReason}` : ''}

Please try booking another slot.

- ${platformName}`;

            case NotificationEvent.NEW_BOOKING_REQUEST:
                return `🔔 New Booking Request

Customer: ${booking.user?.name || 'N/A'}
Phone: ${booking.user?.phone || 'N/A'}
Court: ${booking.court?.name || 'N/A'}
Date: ${this.formatDate(booking.date)} at ${this.formatTime(booking.startTime)}
Amount: ₹${booking.amount}

${booking.paymentProof ? '✅ Payment proof uploaded' : '⚠️ No payment proof'}

Login to approve/reject.

- ${platformName}`;

            case NotificationEvent.BOOKING_CANCELLED:
                return `🚫 Booking Cancelled

Your booking has been cancelled.

Venue: ${booking.venue?.name || 'N/A'}
Date: ${this.formatDate(booking.date)}
Code: ${booking.bookingCode}

If you didn't request this, please contact us.

- ${platformName}`;

            default:
                return `Booking Update: ${booking.bookingCode}`;
        }
    }

    /**
     * Format date for display
     */
    private formatDate(date: Date | string): string {
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    /**
     * Format time for display
     */
    private formatTime(time: string): string {
        if (!time) return 'N/A';

        // If time is in HH:mm format
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;

        return `${displayHour}:${minutes} ${ampm}`;
    }

    /**
     * Log notification to database
     */
    private async logNotification(
        event: NotificationEvent,
        booking: any,
        recipient: NotificationRecipient,
        results: NotificationResult[]
    ): Promise<void> {
        try {
            // Import Notification model dynamically to avoid circular dependencies
            const Notification = (await import('../models/Notification')).default;

            await Notification.create({
                bookingId: booking._id,
                recipientId: recipient.id,
                event,
                channels: results,
                sentAt: new Date()
            });
        } catch (error) {
            console.error('Error logging notification:', error);
        }
    }

    /**
     * Send booking reminder (called by cron job)
     */
    async sendBookingReminders(): Promise<void> {
        try {
            const Booking = (await import('../models/Booking')).default;
            const Owner = (await import('../models/Owner')).default;

            // Get bookings for tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

            const bookings = await Booking.find({
                date: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                },
                status: 'confirmed'
            })
                .populate('userId', 'name phone')
                .populate('venueId', 'name address ownerId')
                .populate('courtId', 'name')
                .populate('slots', 'startTime endTime');

            console.log(`Found ${bookings.length} bookings for tomorrow`);

            for (const booking of bookings) {
                // Get owner's subscription to check if SMS is enabled
                const venue = booking.venueId as any;
                const owner = await Owner.findById(venue.ownerId).populate('subscriptionPlan');
                if (!owner) continue;

                const subscription = (owner as any).subscriptionPlan;

                // Send reminder to customer
                await this.sendNotification(
                    NotificationEvent.BOOKING_REMINDER,
                    booking,
                    {
                        id: (booking.userId as any)._id.toString(),
                        name: (booking.userId as any).name,
                        phone: (booking.userId as any).phone
                    },
                    subscription
                );
            }

            console.log('Booking reminders sent successfully');
        } catch (error) {
            console.error('Error sending booking reminders:', error);
        }
    }
}

export default new NotificationService();
