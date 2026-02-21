import { Request } from 'express';
import { Document } from 'mongoose';

// User Roles
export enum UserRole {
    USER = 'user',
    OWNER = 'owner',
    ADMIN = 'admin'
}

// Owner Status
export enum OwnerStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    SUSPENDED = 'suspended'
}

// Booking Status
export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed'
}

// Slot Status
export enum SlotStatus {
    AVAILABLE = 'available',
    BOOKED = 'booked',
    BLOCKED = 'blocked'
}

// Subscription Status
export enum SubscriptionStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    PENDING = 'pending'
}

// User Interface
export interface IUser extends Document {
    name: string;
    email?: string;
    phone: string;
    password: string;
    role: UserRole;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    otp?: string;
    otpExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Owner Interface
export interface IOwner extends Document {
    userId: string;
    ownerName: string;
    venueName: string;
    city: string;
    sportsOffered: string[];
    status: OwnerStatus;
    phone?: string;
    email?: string;
    subscriptionPlan?: any;
    upiId?: string;
    upiQrCode?: string;
    rejectionReason?: string;
    approvedAt?: Date;
    approvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Venue Interface
export interface IVenue extends Document {
    ownerId: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    pincode: string;
    phone: string;
    email?: string;
    images?: string[];
    amenities?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Sport Interface
export interface ISport extends Document {
    name: string;
    description?: string;
    icon?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Court Interface
export interface ICourt extends Document {
    venueId: string;
    sportId: string;
    name: string;
    description?: string;
    capacity?: number;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Slot Interface
export interface ISlot extends Document {
    courtId: string;
    sportId: string;
    venueId: string;
    date: Date;
    startTime: string;
    endTime: string;
    price: number;
    status: SlotStatus;
    createdAt: Date;
    updatedAt: Date;
}

// Booking Interface
export interface IBooking extends Document {
    bookingCode: string;
    userId: string;
    slotId?: string; // Made optional for backward compatibility
    slots?: string[]; // Array of slot IDs for multiple slot booking
    venueId: string;
    courtId: string;
    sportId: string;
    paymentProof?: string;
    utr?: string;
    amount: number;
    status: BookingStatus;
    rejectionReason?: string;
    confirmedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Subscription Plan Interface
export interface IPlan extends Document {
    name: string;
    description?: string;
    price: number;
    duration: number; // Duration in days (30 or 365)
    durationType: 'monthly' | 'yearly'; // Plan type
    features: string[]; // Array of feature strings (for backward compatibility)
    featureIds?: string[]; // Array of feature ObjectIds
    maxVenues: number;
    maxCourts: number;
    maxBookings?: number;
    maxMessages?: number;
    isUnlimitedBookings: boolean;
    isUnlimitedMessages: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Subscription Interface
export interface ISubscription extends Document {
    ownerId: string;
    planId: string;
    startDate: Date;
    endDate: Date;
    paymentProof?: string;
    utr?: string;
    amount: number;
    status: SubscriptionStatus;
    autoRenew: boolean;
    bookingsCount: number;
    messagesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// City Interface
export interface ICity extends Document {
    name: string;
    state: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Extended Request Interface with User
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
        email?: string;
        phone: string;
    };
}

// API Response Interface
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errors?: any[];
}

// Pagination Interface
export interface PaginationParams {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

// Analytics Interface
export interface IAnalytics {
    totalUsers: number;
    totalOwners: number;
    totalVenues: number;
    totalBookings: number;
    totalRevenue: number;
    recentBookings: any[];
    popularSports: any[];
    popularCities: any[];
}
