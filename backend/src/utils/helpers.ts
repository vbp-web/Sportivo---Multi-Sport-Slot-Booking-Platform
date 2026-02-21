/**
 * Generate a unique booking ID
 * Format: SPORT-VENUE-TIMESTAMP
 * Example: CKT-VEN123-1234567890
 */
export const generateBookingId = (sportName: string, venueId: string): string => {
    const sportCode = sportName.substring(0, 3).toUpperCase();
    const venueCode = venueId.substring(venueId.length - 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `${sportCode}${venueCode}${timestamp}${random}`;
};

/**
 * Generate a random OTP
 */
export const generateOTP = (length: number = 6): string => {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    return otp;
};

/**
 * Calculate OTP expiry time
 */
export const getOTPExpiry = (minutes: number = 10): Date => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
};

/**
 * Format time to 12-hour format
 */
export const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Calculate subscription end date
 */
export const calculateEndDate = (startDate: Date, durationDays: number): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    return endDate;
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date: Date): boolean => {
    return date < new Date();
};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename: string): string => {
    return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
};
