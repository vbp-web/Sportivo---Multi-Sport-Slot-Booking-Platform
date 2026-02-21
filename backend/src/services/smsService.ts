import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

/**
 * Send SMS using MSG91
 */
export const sendSMS = async (to: string, message: string): Promise<boolean> => {
    try {
        if (!MSG91_AUTH_KEY || !MSG91_SENDER_ID) {
            console.warn('MSG91 not configured. SMS not sent.');
            console.log(`[SMS to ${to}]: ${message}`);
            return false;
        }

        // Format phone number (remove + and ensure 10 digits for India)
        const formattedPhone = to.replace(/\D/g, '').slice(-10);

        // MSG91 API endpoint for sending SMS
        const url = 'https://control.msg91.com/api/v5/flow/';

        const payload = {
            template_id: MSG91_TEMPLATE_ID,
            sender: MSG91_SENDER_ID,
            short_url: '0',
            mobiles: `91${formattedPhone}`,
            message: message
        };

        const response = await axios.post(url, payload, {
            headers: {
                'authkey': MSG91_AUTH_KEY,
                'content-type': 'application/json'
            }
        });

        if (response.data.type === 'success') {
            console.log(`✅ SMS sent to ${formattedPhone} via MSG91`);
            return true;
        } else {
            console.error('❌ MSG91 Error:', response.data);
            return false;
        }
    } catch (error: any) {
        console.error('❌ Error sending SMS via MSG91:', error.response?.data || error.message);
        return false;
    }
};

/**
 * Send booking rejection SMS
 */
export const sendBookingRejection = async (
    phone: string,
    bookingCode: string,
    reason: string
): Promise<boolean> => {
    const message = `❌ Booking Rejected

Booking ID: ${bookingCode}
Reason: ${reason}

Please contact the venue for more information.
- Sportivo`;

    return await sendSMS(phone, message);
};

/**
 * Send booking confirmation SMS
 */
export const sendBookingConfirmation = async (
    phone: string,
    bookingCode: string,
    venueName: string,
    sportName: string,
    date: string,
    time: string,
    amount?: number
): Promise<boolean> => {
    const message = `🎉 Booking Confirmed!

Booking ID: ${bookingCode}
Venue: ${venueName}
Sport: ${sportName}
Date: ${date}
Time: ${time}${amount ? `\nAmount: ₹${amount}` : ''}

Thank you for booking with Sportivo!`;

    return await sendSMS(phone, message);
};

/**
 * Send owner approval notification
 */
export const sendOwnerApproval = async (
    phone: string,
    ownerName: string
): Promise<boolean> => {
    const message = `🎊 Congratulations ${ownerName}!

Your venue owner account has been approved.

Please login and select a subscription plan to start managing your venue.

Welcome to Sportivo!`;
    return await sendSMS(phone, message);
};

/**
 * Send booking request to owner
 */
export const sendBookingRequest = async (
    phone: string,
    bookingCode: string,
    userName: string,
    sportName: string,
    date: string,
    time: string
): Promise<boolean> => {
    const message = `New Booking Request!
Booking ID: ${bookingCode}
User: ${userName}
Sport: ${sportName}
Date: ${date}
Time: ${time}
Please login to approve or reject.`;

    return await sendSMS(phone, message);
};

/**
 * Send subscription expiry reminder
 */
export const sendSubscriptionReminder = async (
    phone: string,
    ownerName: string,
    daysLeft: number
): Promise<boolean> => {
    const message = `Hi ${ownerName}, your subscription will expire in ${daysLeft} days. Please renew to continue accessing your dashboard.`;
    return await sendSMS(phone, message);
};

/**
 * Send new owner registration notification to admin
 */
export const sendNewOwnerNotification = async (
    adminPhone: string,
    ownerName: string,
    ownerPhone: string,
    venueName: string,
    city: string
): Promise<boolean> => {
    const message = `🔔 New Owner Registration!

Owner: ${ownerName}
Phone: ${ownerPhone}
Venue: ${venueName}
City: ${city}

Please login to review and approve.
- Sportivo Admin`;

    return await sendSMS(adminPhone, message);
};
