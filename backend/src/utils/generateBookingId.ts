// Generate unique booking ID
export const generateBookingId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `BK${timestamp}${randomStr}`.toUpperCase();
};

// This function is already in helpers.ts but adding here for completeness
// If helpers.ts already has this, this file can import from there
