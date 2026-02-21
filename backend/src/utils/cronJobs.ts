import cron from 'node-cron';
import notificationService from '../services/notificationService';

/**
 * Cron Jobs for Automated Tasks
 */

class CronJobs {
    /**
     * Initialize all cron jobs
     */
    init() {
        console.log('🕐 Initializing cron jobs...');

        // Send booking reminders every day at 10:00 AM
        this.scheduleBookingReminders();

        console.log('✅ Cron jobs initialized');
    }

    /**
     * Schedule booking reminders
     * Runs every day at 10:00 AM
     */
    private scheduleBookingReminders() {
        // Cron format: minute hour day month day-of-week
        // '0 10 * * *' = Every day at 10:00 AM
        cron.schedule('0 10 * * *', async () => {
            console.log('📧 Running booking reminder job...');

            try {
                await notificationService.sendBookingReminders();
                console.log('✅ Booking reminders sent successfully');
            } catch (error) {
                console.error('❌ Error sending booking reminders:', error);
            }
        }, {
            timezone: "Asia/Kolkata" // Indian timezone
        });

        console.log('✅ Booking reminder cron job scheduled (10:00 AM daily)');
    }

    /**
     * Test function to send reminders immediately
     * Can be called manually for testing
     */
    async testBookingReminders() {
        console.log('🧪 Testing booking reminders...');
        await notificationService.sendBookingReminders();
    }
}

export default new CronJobs();
