// Direct database check with fresh connection
require('dotenv').config();
const mongoose = require('mongoose');

const checkNow = async () => {
    try {
        // Fresh connection
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boxcricket', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // Get subscription directly
        const db = mongoose.connection.db;
        const subscriptions = await db.collection('subscriptions').find({}).toArray();

        console.log('📊 CURRENT DATABASE STATE:\n');

        for (const sub of subscriptions) {
            console.log('Subscription:', sub._id);
            console.log('  ownerId:', sub.ownerId);
            console.log('  status:', sub.status);
            console.log('  amount:', sub.amount);
            console.log('');
        }

        // Check owners
        const owners = await db.collection('owners').find({}).toArray();
        console.log('👥 OWNERS:\n');
        for (const owner of owners) {
            console.log('Owner:', owner._id);
            console.log('  userId:', owner.userId);
            console.log('  name:', owner.ownerName);
            console.log('');
        }

        await mongoose.connection.close();
        console.log('✅ Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkNow();
