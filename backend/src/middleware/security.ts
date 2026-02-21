import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import xss from 'xss-clean';

/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for authentication routes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// OTP request rate limiter
export const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 OTP requests per hour
    message: {
        success: false,
        message: 'Too many OTP requests, please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset requests per hour
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 uploads per 15 minutes
    message: {
        success: false,
        message: 'Too many file uploads, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * MongoDB Injection Protection
 * Sanitizes user input to prevent NoSQL injection attacks
 */
export const mongoSanitizeMiddleware = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Potential NoSQL injection attempt detected: ${key} in request from ${req.ip}`);
    },
});

/**
 * XSS Protection
 * Sanitizes user input to prevent Cross-Site Scripting attacks
 */
export const xssProtection = xss();

/**
 * Input Validation Middleware
 * Validates and sanitizes common input fields
 */
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
    // Remove any null bytes from strings
    const sanitizeString = (str: string): string => {
        return str.replace(/\0/g, '');
    };

    // Recursively sanitize object
    const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        if (obj !== null && typeof obj === 'object') {
            const sanitized: any = {};
            for (const key in obj) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };

    // Sanitize request body, query, and params
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

/**
 * Security Headers Middleware
 * Adds additional security headers beyond helmet
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
};

/**
 * Request Logger for Security Monitoring
 * Logs suspicious activities
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
    const suspiciousPatterns = [
        /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal
        /(union.*select|insert.*into|drop.*table)/i, // SQL injection
        /(<script|javascript:|onerror=|onload=)/i, // XSS
        /(\$where|\$ne|\$gt|\$lt)/i, // NoSQL injection
    ];

    const requestString = JSON.stringify({
        body: req.body,
        query: req.query,
        params: req.params,
    });

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestString)) {
            console.warn(`⚠️  Suspicious request detected from ${req.ip}:`, {
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('user-agent'),
                timestamp: new Date().toISOString(),
            });
            break;
        }
    }

    next();
};

/**
 * CORS Configuration Helper
 * Provides secure CORS settings
 */
export const getCorsOptions = () => {
    const allowedOrigins = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',')
        : ['http://localhost:3000'];

    return {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 600, // 10 minutes
    };
};

/**
 * Request Size Limiter
 * Prevents large payload attacks
 */
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
    const maxSize = parseInt(process.env.MAX_REQUEST_SIZE || '10485760'); // 10MB default

    let size = 0;
    req.on('data', (chunk) => {
        size += chunk.length;
        if (size > maxSize) {
            res.status(413).json({
                success: false,
                message: 'Request payload too large'
            });
            req.connection.destroy();
        }
    });

    next();
};

/**
 * API Key Validation (for external integrations)
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
        // If no API key is configured, skip validation
        return next();
    }

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or missing API key'
        });
    }

    next();
};

/**
 * IP Whitelist Middleware (for admin routes)
 */
export const ipWhitelist = (req: Request, res: Response, next: NextFunction) => {
    const whitelist = process.env.ADMIN_IP_WHITELIST?.split(',') || [];

    // Skip if no whitelist configured
    if (whitelist.length === 0) {
        return next();
    }

    const clientIp = req.ip || req.connection.remoteAddress || '';

    if (!whitelist.includes(clientIp)) {
        console.warn(`⚠️  Unauthorized IP attempt to access admin route: ${clientIp}`);
        return res.status(403).json({
            success: false,
            message: 'Access denied from this IP address'
        });
    }

    next();
};
