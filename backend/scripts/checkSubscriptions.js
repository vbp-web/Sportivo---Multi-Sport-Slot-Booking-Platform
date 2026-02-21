// Script to check and display subscription data
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boxcricket');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const checkSubscriptions = async () => {
    await connectDB();

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Owner = mongoose.model('Owner', new mongoose.Schema({}, { strict: false }));
    const Subscription = mongoose.model('Subscription', new mongoose.Schema({}, { strict: false }));

    console.log('\n📊 CHECKING SUBSCRIPTION DATA...\n');

    // Get all subscriptions
    const subscriptions = await Subscription.find({}).lean();
    console.log(`Found ${subscriptions.length} subscription(s)\n`);

    for (const sub of subscriptions) {
        console.log('─'.repeat(60));
        console.log(`📋 Subscription ID: ${sub._id}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Amount: ₹${sub.amount}`);
        console.log(`   Start: ${sub.startDate}`);
        console.log(`   End: ${sub.endDate}`);
        console.log(`   ownerId: ${sub.ownerId}`);

        // Try to find owner by this ID
        const ownerById = await Owner.findById(sub.ownerId);
        if (ownerById) {
            console.log(`   ✅ Found Owner by ID: ${ownerById.ownerName} (${ownerById.venueName})`);
        } else {
            console.log(`   ❌ No Owner found with _id: ${sub.ownerId}`);

            // Check if it's actually a userId
            const user = await User.findById(sub.ownerId);
            if (user) {
                console.log(`   ⚠️  This is a USER ID! User: ${user.name} (${user.phone})`);

                // Find the actual owner
                const actualOwner = await Owner.findOne({ userId: sub.ownerId });
                if (actualOwner) {
                    console.log(`   ✅ Found actual Owner: ${actualOwner.ownerName}`);
                    console.log(`   📝 Correct ownerId should be: ${actualOwner._id}`);
                    console.log(`   🐛 BUG: Subscription has userId instead of ownerId!`);
                }
            }
        }
    }

    console.log('─'.repeat(60));
    console.log('\n📊 SUMMARY:\n');

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const pendingSubscriptions = subscriptions.filter(s => s.status === 'pending');

    console.log(`Total Subscriptions: ${subscriptions.length}`);
    console.log(`Active: ${activeSubscriptions.length}`);
    console.log(`Pending: ${pendingSubscriptions.length}`);

    mongoose.connection.close();
    console.log('\n✅ Done!\n');
};

checkSubscriptions().catch(console.error);
