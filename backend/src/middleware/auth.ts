import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserRole } from '../types';

export { AuthRequest, UserRole };
import User from '../models/User';

interface JwtPayload {
    id: string;
    role: UserRole;
}

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
            return;
        }

        try {
            // Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key'
            ) as JwtPayload;

            // Get user from database
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found. Token invalid.'
                });
                return;
            }

            // Attach user to request
            req.user = {
                id: user._id.toString(),
                role: user.role,
                email: user.email,
                phone: user.phone
            };

            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token is invalid or has expired. Please login again.'
            });
            return;
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
        return;
    }
};

// Generate JWT Token
export const generateToken = (id: string, role: UserRole): string => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET || 'your-secret-key',
        {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        } as jwt.SignOptions
    );
};

// Send token response
export const sendTokenResponse = (
    user: any,
    statusCode: number,
    res: Response
): void => {
    const token = generateToken(user._id, user.role);

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
};
