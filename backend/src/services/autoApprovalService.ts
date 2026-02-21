import Booking from '../models/Booking';
import Owner from '../models/Owner';
import User from '../models/User';
import Slot from '../models/Slot';
import AutoApprovalSettings from '../models/AutoApprovalSettings';

interface ApprovalResult {
    approved: boolean;
    method: 'automatic' | 'manual';
    reason?: string;
    checks?: {
        name: string;
        passed: boolean;
        reason?: string;
    }[];
}

class AutoApprovalService {
    /**
     * Main method to check if booking should be auto-approved
     */
    async checkAutoApproval(bookingId: string, ownerId: string): Promise<ApprovalResult> {
        try {
            // 1. Get booking details
            const booking = await Booking.findById(bookingId)
                .populate('userId')
                .populate('venueId')
                .populate('courtId')
                .populate('slots');

            if (!booking) {
                return {
                    approved: false,
                    method: 'manual',
                    reason: 'Booking not found'
                };
            }

            // 2. Get owner's subscription plan
            const owner = await Owner.findById(ownerId).populate('subscriptionPlan');
            if (!owner || !(owner as any).subscriptionPlan) {
                return {
                    approved: false,
                    method: 'manual',
                    reason: 'Owner subscription not found'
                };
            }

            const subscription = (owner as any).subscriptionPlan;

            // 3. Check if auto-approval is available in plan
            const hasAutoApproval = this.checkPlanFeature(subscription, 'autoConfirmation');
            if (!hasAutoApproval) {
                return {
                    approved: false,
                    method: 'manual',
                    reason: 'Auto-approval not available in current plan'
                };
            }

            // 4. Get auto-approval settings
            let settings = await AutoApprovalSettings.findOne({ ownerId });

            // Create default settings if not exists
            if (!settings) {
                settings = await AutoApprovalSettings.create({
                    ownerId,
                    autoApproval: {
                        enabled: true,
                        requirePaymentProof: true
                    }
                });
            }

            // 5. Check if auto-approval is enabled
            if (!settings.autoApproval.enabled) {
                return {
                    approved: false,
                    method: 'manual',
                    reason: 'Auto-approval disabled by owner'
                };
            }

            // 6. Run approval checks based on plan
            const checks = await this.runApprovalChecks(booking, settings, subscription);

            // 7. Determine if all checks passed
            const allChecksPassed = checks.every(check => check.passed);

            if (allChecksPassed) {
                // Auto-approve the booking
                await this.approveBooking(bookingId);

                return {
                    approved: true,
                    method: 'automatic',
                    checks
                };
            } else {
                return {
                    approved: false,
                    method: 'manual',
                    reason: 'Some approval conditions not met',
                    checks
                };
            }
        } catch (error) {
            console.error('Auto-approval check error:', error);
            return {
                approved: false,
                method: 'manual',
                reason: 'Error during auto-approval check'
            };
        }
    }

    /**
     * Run all approval checks
     */
    private async runApprovalChecks(
        booking: any,
        settings: any,
        subscription: any
    ): Promise<Array<{ name: string; passed: boolean; reason?: string }>> {
        const checks = [];

        // Check 1: Payment proof (if required)
        if (settings.autoApproval.requirePaymentProof) {
            checks.push({
                name: 'Payment Proof',
                passed: !!booking.paymentProof,
                reason: booking.paymentProof ? 'Payment proof uploaded' : 'Payment proof missing'
            });
        }

        // Check 2: Amount-based rules (Professional+)
        if (settings.autoApproval.amountRules?.enabled) {
            const maxAmount = settings.autoApproval.amountRules.maxAutoApproveAmount;
            const passed = !maxAmount || booking.amount <= maxAmount;

            checks.push({
                name: 'Amount Limit',
                passed,
                reason: passed
                    ? `Amount ₹${booking.amount} within limit`
                    : `Amount ₹${booking.amount} exceeds limit of ₹${maxAmount}`
            });
        }

        // Check 3: Repeat customer rules (Professional+)
        if (settings.autoApproval.customerRules?.enabled) {
            const previousBookings = await Booking.find({
                userId: booking.userId._id,
                status: 'confirmed',
                _id: { $ne: booking._id }
            });

            const minBookings = settings.autoApproval.customerRules.minimumPreviousBookings || 0;
            const passed = previousBookings.length >= minBookings;

            checks.push({
                name: 'Repeat Customer',
                passed,
                reason: passed
                    ? `Customer has ${previousBookings.length} previous bookings`
                    : `Customer needs ${minBookings} previous bookings, has ${previousBookings.length}`
            });

            // Check if phone verification required
            if (settings.autoApproval.customerRules.requireVerifiedPhone) {
                const user = await User.findById(booking.userId._id);
                const passed = user?.isPhoneVerified || false;

                checks.push({
                    name: 'Phone Verified',
                    passed,
                    reason: passed ? 'Phone verified' : 'Phone not verified'
                });
            }
        }

        // Check 4: Time-based rules (Professional+)
        if (settings.autoApproval.timeRules?.enabled) {
            const bookingDate = new Date(booking.date);
            const dayOfWeek = bookingDate.getDay(); // 0=Sunday, 6=Saturday
            const allowedDays = settings.autoApproval.timeRules.allowedDays || [1, 2, 3, 4, 5, 6, 7];

            // Convert Sunday from 0 to 7 for consistency
            const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
            const dayPassed = allowedDays.includes(normalizedDay);

            checks.push({
                name: 'Allowed Day',
                passed: dayPassed,
                reason: dayPassed ? 'Booking day allowed' : 'Booking day not allowed'
            });

            // Check business hours if slot time is available
            if (booking.slots && booking.slots.length > 0) {
                const slot = booking.slots[0];
                const startTime = slot.startTime;

                if (startTime && settings.autoApproval.timeRules.businessHours) {
                    const [hours] = startTime.split(':');
                    const bookingHour = parseInt(hours);

                    const [startHour] = settings.autoApproval.timeRules.businessHours.start.split(':');
                    const [endHour] = settings.autoApproval.timeRules.businessHours.end.split(':');

                    const withinHours = bookingHour >= parseInt(startHour) && bookingHour < parseInt(endHour);

                    checks.push({
                        name: 'Business Hours',
                        passed: withinHours,
                        reason: withinHours
                            ? 'Within business hours'
                            : `Outside business hours (${settings.autoApproval.timeRules.businessHours.start}-${settings.autoApproval.timeRules.businessHours.end})`
                    });
                }
            }
        }

        // Check 5: AI Trust Score (Enterprise only)
        const hasAIInsights = this.checkPlanFeature(subscription, 'aiInsights');
        if (settings.autoApproval.aiSettings?.enabled && hasAIInsights) {
            const trustScore = await this.calculateTrustScore(booking.userId._id);
            const minScore = settings.autoApproval.aiSettings.trustScoreThreshold || 60;
            const passed = trustScore >= minScore;

            checks.push({
                name: 'AI Trust Score',
                passed,
                reason: `Trust score: ${trustScore}/100 (minimum: ${minScore})`
            });
        }

        return checks;
    }

    /**
     * Calculate customer trust score (Enterprise feature)
     */
    private async calculateTrustScore(userId: string): Promise<number> {
        try {
            let score = 50; // Base score

            const user = await User.findById(userId);
            if (!user) return score;

            // Account age (max 10 points)
            const accountAge = Date.now() - user.createdAt.getTime();
            const daysOld = accountAge / (1000 * 60 * 60 * 24);
            score += Math.min(10, Math.floor(daysOld / 30)); // 1 point per month, max 10

            // Phone verified (15 points)
            if (user.isPhoneVerified) score += 15;

            // Email verified (10 points)
            if (user.isEmailVerified) score += 10;

            // Previous bookings (max 25 points)
            const bookings = await Booking.find({ userId, status: 'confirmed' });
            score += Math.min(25, bookings.length * 5); // 5 points per booking, max 25

            // Cancellation rate (max -20 points penalty)
            const cancelledBookings = await Booking.find({ userId, status: 'cancelled' });
            const totalBookings = bookings.length + cancelledBookings.length;
            if (totalBookings > 0) {
                const cancellationRate = cancelledBookings.length / totalBookings;
                score -= Math.floor(cancellationRate * 20);
            }

            return Math.max(0, Math.min(100, score)); // Clamp between 0-100
        } catch (error) {
            console.error('Error calculating trust score:', error);
            return 50; // Return neutral score on error
        }
    }

    /**
     * Approve a booking
     */
    private async approveBooking(bookingId: string): Promise<void> {
        const booking = await Booking.findById(bookingId);
        if (!booking) return;

        booking.status = 'confirmed' as any;
        booking.confirmedAt = new Date();
        await booking.save();

        // Mark slots as booked
        const slotIds = booking.slots && booking.slots.length > 0
            ? booking.slots
            : [booking.slotId];

        await Slot.updateMany(
            { _id: { $in: slotIds } },
            { status: 'booked' }
        );
    }

    async getAutoApprovalStats(ownerId: string, days: number = 30): Promise<any> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Get owner's venues
            const owner = await Owner.findById(ownerId);
            if (!owner) return null;

            const Venue = (await import('../models/Venue')).default;
            const venues = await Venue.find({ ownerId });
            const venueIds = venues.map(v => v._id);

            // Get all bookings
            const allBookings = await Booking.find({
                venueId: { $in: venueIds },
                createdAt: { $gte: startDate }
            });

            const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');

            // Estimate auto-approved (those confirmed within 1 minute of creation)
            const autoApproved = confirmedBookings.filter(b => {
                if (!b.confirmedAt) return false;
                const timeDiff = b.confirmedAt.getTime() - b.createdAt.getTime();
                return timeDiff < 60000; // Less than 1 minute
            });

            const manualApproved = confirmedBookings.filter(b => {
                if (!b.confirmedAt) return false;
                const timeDiff = b.confirmedAt.getTime() - b.createdAt.getTime();
                return timeDiff >= 60000; // More than 1 minute
            });

            return {
                period: `Last ${days} days`,
                totalBookings: allBookings.length,
                autoApproved: autoApproved.length,
                manualApproved: manualApproved.length,
                pending: allBookings.filter(b => b.status === 'pending').length,
                rejected: allBookings.filter(b => b.status === 'rejected').length,
                autoApprovalRate: allBookings.length > 0
                    ? ((autoApproved.length / allBookings.length) * 100).toFixed(1)
                    : 0
            };
        } catch (error) {
            console.error('Error getting auto-approval stats:', error);
            return null;
        }
    }

    /**
     * Helper to check if a plan has a specific feature
     */
    private checkPlanFeature(subscription: any, featureKey: string): boolean {
        if (!subscription || !subscription.features) return false;

        // If features is an array (strings or populated objects)
        if (Array.isArray(subscription.features)) {
            return subscription.features.some((f: any) => {
                if (typeof f === 'string') return f === featureKey;
                if (f && typeof f === 'object') {
                    // Check populated feature name or code
                    return f.name === featureKey || f.code === featureKey;
                }
                return false;
            });
        }

        // If features is an object (legacy/alternative format)
        if (typeof subscription.features === 'object') {
            return !!subscription.features[featureKey];
        }

        return false;
    }
}

export default new AutoApprovalService();
