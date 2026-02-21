// Script to fix subscription ownerId values
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

const fixSubscriptions = async () => {
    await connectDB();

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Owner = mongoose.model('Owner', new mongoose.Schema({}, { strict: false }));
    const Subscription = mongoose.model('Subscription', new mongoose.Schema({}, { strict: false }));

    console.log('\n🔧 FIXING SUBSCRIPTION DATA...\n');

    const subscriptions = await Subscription.find({});
    let fixedCount = 0;
    let alreadyCorrect = 0;

    for (const sub of subscriptions) {
        console.log('─'.repeat(60));
        console.log(`📋 Checking Subscription: ${sub._id}`);
        console.log(`   Current ownerId: ${sub.ownerId}`);

        // Try to find owner by current ownerId
        const ownerById = await Owner.findById(sub.ownerId);

        if (ownerById) {
            console.log(`   ✅ Already correct! Owner: ${ownerById.ownerName}`);
            alreadyCorrect++;
        } else {
            console.log(`   ❌ Invalid ownerId!`);

            // Check if it's a userId
            const user = await User.findById(sub.ownerId);
            if (user) {
                console.log(`   ⚠️  Found User: ${user.name} (${user.phone})`);

                // Find the actual owner
                const actualOwner = await Owner.findOne({ userId: sub.ownerId });
                if (actualOwner) {
                    console.log(`   ✅ Found actual Owner: ${actualOwner.ownerName}`);
                    console.log(`   📝 Updating ownerId from ${sub.ownerId} to ${actualOwner._id}`);

                    // Update the subscription
                    sub.ownerId = actualOwner._id.toString();
                    await sub.save();

                    console.log(`   ✅ FIXED!`);
                    fixedCount++;
                } else {
                    console.log(`   ❌ Could not find Owner for this user!`);
                }
            } else {
                console.log(`   ❌ ownerId is neither a valid Owner nor User!`);
            }
        }
    }

    console.log('─'.repeat(60));
    console.log('\n📊 SUMMARY:\n');
    console.log(`Total Subscriptions: ${subscriptions.length}`);
    console.log(`Already Correct: ${alreadyCorrect}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`\n✅ Done!\n`);

    mongoose.connection.close();
};

fixSubscriptions().catch(console.error);
