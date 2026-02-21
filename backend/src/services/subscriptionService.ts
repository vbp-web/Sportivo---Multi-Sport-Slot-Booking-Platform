import Subscription from '../models/Subscription';
import { IPlan, ISubscription } from '../types';

class SubscriptionService {
    /**
     * Get active subscription for an owner
     */
    async getActiveSubscription(ownerId: string): Promise<ISubscription | null> {
        return await Subscription.findOne({
            ownerId,
            status: 'active',
            endDate: { $gte: new Date() }
        }).populate('planId');
    }

    /**
     * Check if owner can create a booking
     */
    async canCreateBooking(ownerId: string): Promise<{ allowed: boolean; message?: string }> {
        const sub = await this.getActiveSubscription(ownerId);
        if (!sub) {
            // For backward compatibility or if no subscription sub/plan is found, we might allow it 
            // or check if there's a default plan
            return { allowed: true };
        }

        const plan = sub.planId as any as IPlan;
        if (!plan) return { allowed: true };

        if (plan.isUnlimitedBookings) return { allowed: true };

        if (sub.bookingsCount >= (plan.maxBookings || 0)) {
            return { allowed: false, message: 'Booking limit reached for this venue. Please contact owner to upgrade plan.' };
        }

        return { allowed: true };
    }

    /**
     * Increment booking count
     */
    async incrementBookingCount(ownerId: string): Promise<void> {
        const sub = await this.getActiveSubscription(ownerId);
        if (sub) {
            sub.bookingsCount = (sub.bookingsCount || 0) + 1;
            await sub.save();
        }
    }

    /**
     * Check if owner can send a message
     */
    async canSendMessage(ownerId: string): Promise<{ allowed: boolean; message?: string }> {
        const sub = await this.getActiveSubscription(ownerId);
        if (!sub) return { allowed: true };

        const plan = sub.planId as any as IPlan;
        if (!plan) return { allowed: true };

        if (plan.isUnlimitedMessages) return { allowed: true };

        if (sub.messagesCount >= (plan.maxMessages || 0)) {
            return { allowed: false, message: 'Message limit reached for this venue.' };
        }

        return { allowed: true };
    }

    /**
     * Increment message count
     */
    async incrementMessageCount(ownerId: string): Promise<void> {
        const sub = await this.getActiveSubscription(ownerId);
        if (sub) {
            sub.messagesCount = (sub.messagesCount || 0) + 1;
            await sub.save();
        }
    }

    /**
     * Check if owner can add a venue
     */
    async canAddVenue(ownerId: string, currentVenueCount: number): Promise<{ allowed: boolean; message?: string }> {
        const sub = await this.getActiveSubscription(ownerId);
        if (!sub) return { allowed: true };

        const plan = sub.planId as any as IPlan;
        if (!plan) return { allowed: true };

        if (currentVenueCount >= (plan.maxVenues || 0)) {
            return { allowed: false, message: `Venue limit reached. Your ${plan.name} plan allows only ${plan.maxVenues} venue(s).` };
        }

        return { allowed: true };
    }

    /**
     * Check if owner can add a court to a venue
     */
    async canAddCourt(ownerId: string, currentCourtCount: number): Promise<{ allowed: boolean; message?: string }> {
        const sub = await this.getActiveSubscription(ownerId);
        if (!sub) return { allowed: true };

        const plan = sub.planId as any as IPlan;
        if (!plan) return { allowed: true };

        if (currentCourtCount >= (plan.maxCourts || 0)) {
            return { allowed: false, message: `Court limit reached. Your ${plan.name} plan allows only ${plan.maxCourts} court(s) per venue.` };
        }

        return { allowed: true };
    }
}

export default new SubscriptionService();
