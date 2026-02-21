import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_WHATSAPP_TEMPLATE_ID = process.env.MSG91_WHATSAPP_TEMPLATE_ID;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;

/**
 * Send WhatsApp message using MSG91
 */
export const sendWhatsApp = async (to: string, message: string): Promise<boolean> => {
    try {
        if (!MSG91_AUTH_KEY || !MSG91_WHATSAPP_TEMPLATE_ID) {
            console.warn('MSG91 WhatsApp not configured. WhatsApp message not sent.');
            console.log(`[WhatsApp to ${to}]: ${message}`);
            return false;
        }

        // Format phone number (remove + and ensure 10 digits for India)
        const formattedPhone = to.replace(/\D/g, '').slice(-10);
        const phoneWithCountryCode = `91${formattedPhone}`;

        // MSG91 WhatsApp API endpoint
        const url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';

        const payload = {
            integrated_number: MSG91_SENDER_ID,
            content_type: 'template',
            payload: {
                to: phoneWithCountryCode,
                type: 'template',
                template: {
                    name: MSG91_WHATSAPP_TEMPLATE_ID,
                    language: {
                        code: 'en',
                        policy: 'deterministic'
                    },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: message
                                }
                            ]
                        }
                    ]
                }
            }
        };

        const response = await axios.post(url, payload, {
            headers: {
                'authkey': MSG91_AUTH_KEY,
                'content-type': 'application/json'
            }
        });

        if (response.data.type === 'success') {
            console.log(`✅ WhatsApp sent to ${phoneWithCountryCode} via MSG91`);
            return true;
        } else {
            console.error('❌ MSG91 WhatsApp Error:', response.data);
            return false;
        }
    } catch (error: any) {
        console.error('❌ Error sending WhatsApp via MSG91:', error.response?.data || error.message);
        return false;
    }
};

/**
 * Send booking confirmation via WhatsApp
 */
export const sendBookingConfirmationWhatsApp = async (
    phone: string,
    bookingCode: string,
    venueName: string,
    sportName: string,
    date: string,
    time: string,
    amount: number
): Promise<boolean> => {
    const message = `🎉 *Booking Confirmed!*

*Booking ID:* ${bookingCode}
*Venue:* ${venueName}
*Sport:* ${sportName}
*Date:* ${date}
*Time:* ${time}
*Amount:* ₹${amount}

Thank you for booking with Sportivo!`;

    return await sendWhatsApp(phone, message);
};

/**
 * Send booking rejection via WhatsApp
 */
export const sendBookingRejectionWhatsApp = async (
    phone: string,
    bookingCode: string,
    reason: string
): Promise<boolean> => {
    const message = `❌ *Booking Rejected*

*Booking ID:* ${bookingCode}
*Reason:* ${reason}

Please contact the venue for more information.`;

    return await sendWhatsApp(phone, message);
};

/**
 * Send owner approval notification via WhatsApp
 */
export const sendOwnerApprovalWhatsApp = async (
    phone: string,
    ownerName: string
): Promise<boolean> => {
    const message = `🎊 *Congratulations ${ownerName}!*

Your venue owner account has been *approved*. 

Please login and select a subscription plan to start managing your venue.

Welcome to Sportivo!`;

    return await sendWhatsApp(phone, message);
};
