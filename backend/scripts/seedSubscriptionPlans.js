/**
 * Subscription Plans Seeder
 * Run this script to populate the database with subscription plans
 * Usage: npm run seed-plans
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const subscriptionPlans = [
    {
        name: 'Free Trial',
        slug: 'free-trial',
        price: 0,
        duration: 14, // days
        features: {
            venues: 1,
            courts: 2,
            monthlyBookings: 50,
            commission: 5,
            analytics: {
                enabled: true,
                historyDays: 7
            },
            autoConfirmation: false,
            priorityListing: false,
            customBranding: false,
            staffAccounts: 1,
            support: {
                email: true,
                chat: false,
                phone: false,
                responseTime: '48 hours'
            },
            smsNotifications: false,
            offlineBooking: true,
            bulkOperations: false,
            apiAccess: false
        },
        isActive: true,
        isTrial: true,
        displayOrder: 1,
        badge: 'Try Free',
        description: 'Perfect for testing the platform',
        highlights: [
            '14-day free trial',
            'Basic slot management',
            'Manual booking approval',
            'Email support'
        ]
    },
    {
        name: 'Starter',
        slug: 'starter',
        price: 999,
        annualPrice: 9990, // 17% discount
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
            venues: 1,
            courts: 5,
            monthlyBookings: -1, // unlimited
            commission: 3,
            analytics: {
                enabled: true,
                historyDays: 30,
                reports: ['basic', 'revenue', 'bookings']
            },
            autoConfirmation: true,
            priorityListing: false,
            customBranding: false,
            staffAccounts: 1,
            support: {
                email: true,
                chat: true,
                phone: false,
                responseTime: '24 hours'
            },
            smsNotifications: false,
            offlineBooking: true,
            bulkOperations: false,
            apiAccess: false,
            promotionalTools: 'basic',
            dataExport: true
        },
        isActive: true,
        isTrial: false,
        displayOrder: 2,
        badge: 'Popular',
        description: 'Ideal for single venue owners',
        highlights: [
            'Unlimited bookings',
            'Auto-confirmation',
            'Advanced analytics (30 days)',
            '3% commission only',
            'Email & Chat support'
        ]
    },
    {
        name: 'Professional',
        slug: 'professional',
        price: 2499,
        annualPrice: 24990,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
            venues: 3,
            courts: 15,
            monthlyBookings: -1,
            commission: 2,
            analytics: {
                enabled: true,
                historyDays: 90,
                reports: ['basic', 'revenue', 'bookings', 'customer', 'trends']
            },
            autoConfirmation: true,
            priorityListing: true,
            customBranding: false,
            staffAccounts: 3,
            support: {
                email: true,
                chat: true,
                phone: true,
                responseTime: '12 hours'
            },
            smsNotifications: true,
            offlineBooking: true,
            bulkOperations: true,
            apiAccess: false,
            promotionalTools: 'advanced',
            dataExport: true,
            dynamicPricing: true,
            featuredBadge: true,
            customerMarketing: true
        },
        isActive: true,
        isTrial: false,
        displayOrder: 3,
        badge: 'Best Value',
        description: 'Perfect for growing venue chains',
        highlights: [
            'Up to 3 venues',
            'Priority listing',
            'Featured badge',
            '2% commission',
            'SMS notifications',
            'Dynamic pricing',
            'Priority support'
        ]
    },
    {
        name: 'Enterprise',
        slug: 'enterprise',
        price: 4999,
        annualPrice: 49990,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
            venues: -1, // unlimited
            courts: -1,
            monthlyBookings: -1,
            commission: 1.5,
            analytics: {
                enabled: true,
                historyDays: -1, // unlimited
                reports: ['all'],
                aiInsights: true,
                predictive: true
            },
            autoConfirmation: true,
            priorityListing: true,
            customBranding: true,
            staffAccounts: -1,
            support: {
                email: true,
                chat: true,
                phone: true,
                responseTime: 'instant',
                dedicatedManager: true
            },
            smsNotifications: true,
            whatsappNotifications: true,
            offlineBooking: true,
            bulkOperations: true,
            apiAccess: true,
            promotionalTools: 'full',
            dataExport: true,
            dynamicPricing: true,
            featuredBadge: true,
            verifiedBadge: true,
            customerMarketing: true,
            crmIntegration: true,
            customDomain: true,
            multiLanguage: true,
            accountingIntegration: true
        },
        isActive: true,
        isTrial: false,
        displayOrder: 4,
        badge: 'Premium',
        description: 'For large sports complexes and chains',
        highlights: [
            'Unlimited venues & courts',
            'Top priority listing',
            'Verified badge',
            '1.5% commission',
            'Dedicated account manager',
            '24/7 priority support',
            'API access',
            'Custom branding',
            'AI-powered insights'
        ]
    }
];

const addOns = [
    {
        name: 'Premium Listing Boost',
        slug: 'premium-listing-boost',
        price: 499,
        currency: 'INR',
        billingCycle: 'monthly',
        description: 'Get top 3 position in search results',
        features: [
            'Top 3 search position',
            'Homepage featured carousel',
            '3x visibility boost'
        ],
        isActive: true
    },
    {
        name: 'Advanced Marketing Package',
        slug: 'advanced-marketing',
        price: 999,
        currency: 'INR',
        billingCycle: 'monthly',
        description: 'Complete marketing solution',
        features: [
            'Social media promotion',
            'Email marketing campaigns',
            '1000 SMS per month',
            'Custom promotional banners'
        ],
        isActive: true
    },
    {
        name: 'Photography & Content',
        slug: 'photography-content',
        price: 2999,
        currency: 'INR',
        billingCycle: 'one-time',
        description: 'Professional venue showcase',
        features: [
            'Professional photography',
            '360° virtual tour',
            'Professional description',
            'Video showcase'
        ],
        isActive: true
    },
    {
        name: 'Additional Staff Account',
        slug: 'additional-staff',
        price: 199,
        currency: 'INR',
        billingCycle: 'monthly',
        perUnit: true,
        description: 'Add more staff members',
        features: [
            'Separate login credentials',
            'Role-based permissions',
            'Activity tracking'
        ],
        isActive: true
    },
    {
        name: 'Extended Analytics',
        slug: 'extended-analytics',
        price: 499,
        currency: 'INR',
        billingCycle: 'monthly',
        description: 'Advanced business insights',
        features: [
            'Competitor analysis',
            'Market insights',
            'Customer behavior analytics',
            'Predictive booking trends'
        ],
        isActive: true
    }
];

const seedPlans = async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db();
        const plansCollection = db.collection('subscriptionplans');
        const addOnsCollection = db.collection('addons');

        // Clear existing plans
        console.log('🗑️  Clearing existing plans...');
        await plansCollection.deleteMany({});
        await addOnsCollection.deleteMany({});
        console.log('✅ Cleared\n');

        // Insert subscription plans
        console.log('📦 Inserting subscription plans...');
        const planResult = await plansCollection.insertMany(subscriptionPlans);
        console.log(`✅ Inserted ${planResult.insertedCount} subscription plans\n`);

        // Insert add-ons
        console.log('📦 Inserting add-ons...');
        const addOnResult = await addOnsCollection.insertMany(addOns);
        console.log(`✅ Inserted ${addOnResult.insertedCount} add-ons\n`);

        // Display summary
        console.log('📋 Summary:');
        console.log('─'.repeat(50));
        subscriptionPlans.forEach(plan => {
            const price = plan.price === 0 ? 'FREE' : `₹${plan.price}/month`;
            console.log(`  ${plan.badge.padEnd(15)} ${plan.name.padEnd(20)} ${price}`);
        });
        console.log('─'.repeat(50));
        console.log('\n🎉 Subscription plans seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding plans:', error);
    } finally {
        await client.close();
        console.log('\n👋 Disconnected from MongoDB');
    }
};

seedPlans();
