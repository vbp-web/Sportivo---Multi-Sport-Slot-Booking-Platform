const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });


// Feature Schema
const featureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['booking', 'communication', 'analytics', 'support', 'automation', 'other'],
        default: 'other'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Feature = mongoose.model('Feature', featureSchema);

const defaultFeatures = [
    // Core Platform Access
    {
        name: 'Venue Management',
        description: 'Complete access to create and manage your ground venues, images, and details.',
        category: 'booking',
        isActive: true
    },
    {
        name: 'Court & Slot Management',
        description: 'Full control over sports courts and time slot scheduling.',
        category: 'booking',
        isActive: true
    },
    {
        name: 'Booking Management Page',
        description: 'Access to view, manage, and track all customer bookings and history.',
        category: 'booking',
        isActive: true
    },

    // Advanced Modules
    {
        name: 'Analytics Dashboard Page',
        description: 'Full access to revenue reports, booking statistics, and customer insights.',
        category: 'analytics',
        isActive: true
    },
    {
        name: 'Communication Suite',
        description: 'Access to SMS, WhatsApp, and Email notification systems for customers.',
        category: 'communication',
        isActive: true
    },
    {
        name: 'Auto Approval System',
        description: 'Unlock automated booking approval and smart slot management.',
        category: 'automation',
        isActive: true
    },

    // Support & Admin
    {
        name: 'Priority Support Access',
        description: 'Unlock priority 24/7 support and a dedicated account manager.',
        category: 'support',
        isActive: true
    },
    {
        name: 'Custom Branding Tools',
        description: 'Ability to customize the platform with your own logo and brand colors.',
        category: 'other',
        isActive: true
    }
];

async function seedFeatures() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boxcricket');
        console.log('Connected to MongoDB');

        // Clear existing features
        await Feature.deleteMany({});
        console.log('Cleared existing features');

        // Insert default features
        const features = await Feature.insertMany(defaultFeatures);
        console.log('Seeded ' + features.length + ' features successfully');

        // Display seeded features by category
        const categories = ['booking', 'communication', 'analytics', 'support', 'automation', 'other'];
        console.log('\nSeeded Features by Category:');
        for (const category of categories) {
            const categoryFeatures = features.filter(f => f.category === category);
            if (categoryFeatures.length > 0) {
                console.log('\n' + category.toUpperCase() + ':');
                categoryFeatures.forEach(f => {
                    console.log('  - ' + f.name);
                });
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding features:', error);
        process.exit(1);
    }
}

seedFeatures();
