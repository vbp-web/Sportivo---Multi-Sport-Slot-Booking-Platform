// OTP Service for phone verification

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isOTPValid = (otpExpiry: Date): boolean => {
    return new Date() < otpExpiry;
};

export const getOTPExpiryTime = (): Date => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid for 10 minutes
    return expiry;
};
