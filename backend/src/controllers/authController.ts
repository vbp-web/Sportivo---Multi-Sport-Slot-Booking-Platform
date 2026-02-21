import { Request, Response } from 'express';
import { AuthRequest, UserRole, OwnerStatus } from '../types';
import User from '../models/User';
import Owner from '../models/Owner';
import { sendTokenResponse } from '../middleware/auth';
import { generateOTP, getOTPExpiry } from '../utils/helpers';
import { sendNewOwnerNotification } from '../services/smsService';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, password, role, ownerDetails } = req.body;

        // Validation
        if (!name || !email || !phone || !password || !role) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields (name, email, phone, password, role)'
            });
            return;
        }

        // Check if user already exists by phone
        const existingUserByPhone = await User.findOne({ phone });
        if (existingUserByPhone) {
            res.status(400).json({
                success: false,
                message: 'User with this phone number already exists'
            });
            return;
        }

        // Check if user already exists by email
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role
        });

        // If role is owner, create owner profile
        if (role === UserRole.OWNER) {
            if (!ownerDetails || !ownerDetails.ownerName || !ownerDetails.venueName || !ownerDetails.city) {
                res.status(400).json({
                    success: false,
                    message: 'Please provide owner details (ownerName, venueName, city, sportsOffered)'
                });
                return;
            }

            await Owner.create({
                userId: user._id,
                ownerName: ownerDetails.ownerName,
                venueName: ownerDetails.venueName,
                city: ownerDetails.city,
                sportsOffered: ownerDetails.sportsOffered || [],
                status: OwnerStatus.PENDING
            });

            // Send SMS notification to admin
            try {
                // Get admin user (assuming role is 'admin')
                const adminUser = await User.findOne({ role: UserRole.ADMIN });
                if (adminUser && adminUser.phone) {
                    await sendNewOwnerNotification(
                        adminUser.phone,
                        ownerDetails.ownerName,
                        phone,
                        ownerDetails.venueName,
                        ownerDetails.city
                    );
                    console.log('✅ Admin notified about new owner registration');
                }
            } catch (smsError) {
                console.error('❌ Failed to send admin notification:', smsError);
                // Don't fail registration if SMS fails
            }

            res.status(201).json({
                success: true,
                message: 'Owner registration successful. Your account is pending admin approval.',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        phone: user.phone,
                        role: user.role
                    }
                }
            });
            return;
        }

        // For regular users, send token
        sendTokenResponse(user, 201, res);
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role } = req.body;

        // Validation
        if (!email || !password || !role) {
            res.status(400).json({
                success: false,
                message: 'Please provide email, password, and role'
            });
            return;
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Check if role matches
        if (user.role !== role) {
            res.status(401).json({
                success: false,
                message: `Invalid credentials. Please select the correct role.`
            });
            return;
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // If owner, check approval status
        if (user.role === UserRole.OWNER) {
            const owner = await Owner.findOne({ userId: user._id });

            if (!owner) {
                res.status(404).json({
                    success: false,
                    message: 'Owner profile not found'
                });
                return;
            }

            if (owner.status === OwnerStatus.PENDING) {
                res.status(403).json({
                    success: false,
                    message: 'Your account is pending admin approval',
                    status: 'pending'
                });
                return;
            }

            if (owner.status === OwnerStatus.REJECTED) {
                res.status(403).json({
                    success: false,
                    message: `Your account has been rejected. Reason: ${owner.rejectionReason || 'Not specified'}`,
                    status: 'rejected'
                });
                return;
            }

            if (owner.status === OwnerStatus.SUSPENDED) {
                res.status(403).json({
                    success: false,
                    message: 'Your account has been suspended. Please contact support.',
                    status: 'suspended'
                });
                return;
            }
        }

        sendTokenResponse(user, 200, res);
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to phone
 * @access  Public
 */
export const sendOTPCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone } = req.body;

        if (!phone) {
            res.status(400).json({
                success: false,
                message: 'Please provide phone number'
            });
            return;
        }

        const user = await User.findOne({ phone }).select('+otp +otpExpiry');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Generate OTP
        const otp = generateOTP(6);
        const otpExpiry = getOTPExpiry(10);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Note: OTP SMS sending is currently disabled
        // If you need OTP functionality, implement it using sendSMS() from smsService
        console.log(`[OTP for ${phone}]: ${otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            // In development, you might want to return OTP for testing
            ...(process.env.NODE_ENV === 'development' && { otp })
        });
    } catch (error: any) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error sending OTP',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP
 * @access  Public
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            res.status(400).json({
                success: false,
                message: 'Please provide phone and OTP'
            });
            return;
        }

        const user = await User.findOne({ phone }).select('+otp +otpExpiry');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        if (!user.otp || !user.otpExpiry) {
            res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new OTP.'
            });
            return;
        }

        if (user.otpExpiry < new Date()) {
            res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP.'
            });
            return;
        }

        if (user.otp !== otp) {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
            return;
        }

        // Mark phone as verified
        user.isPhoneVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Phone verified successfully'
        });
    } catch (error: any) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error verifying OTP',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/forgot-password-manual
 * @desc    Manual password reset without OTP (User request)
 * @access  Public
 */
export const forgotPasswordManual = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (!email || !newPassword || !confirmPassword) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and both password fields'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User with this email not found'
            });
            return;
        }

        // Set new password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully. You can now login with your new password.'
        });
    } catch (error: any) {
        console.error('Forgot password manual error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};
