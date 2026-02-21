import QRCode from 'qrcode';

// Generate QR code for UPI payment
export const generateUPIQRCode = async (
    upiId: string,
    amount?: number,
    name?: string
): Promise<string> => {
    try {
        // UPI payment string format
        let upiString = `upi://pay?pa=${upiId}`;

        if (name) {
            upiString += `&pn=${encodeURIComponent(name)}`;
        }

        if (amount) {
            upiString += `&am=${amount}`;
        }

        upiString += '&cu=INR';

        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(upiString, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('QR code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
};

// Generate QR code for any text/URL
export const generateQRCode = async (text: string): Promise<string> => {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(text, {
            width: 300,
            margin: 2
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('QR code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
};
