// Simple direct update
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

async function fixNow() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boxcricket';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected\n');

        const db = client.db();

        // The IDs from the check script
        const wrongOwnerId = '696ef5561c04411b94e5ad38';  // User ID
        const correctOwnerId = '696ef5581c04411b94e5ad3a'; // Owner ID

        console.log(`Updating subscription...`);
        console.log(`FROM: ${wrongOwnerId}`);
        console.log(`TO:   ${correctOwnerId}\n`);

        const result = await db.collection('subscriptions').updateMany(
            { ownerId: wrongOwnerId },
            { $set: { ownerId: correctOwnerId } }
        );

        console.log(`✅ Updated ${result.modifiedCount} subscription(s)\n`);

        // Verify
        const subs = await db.collection('subscriptions').find({}).toArray();
        console.log('Current subscriptions:');
        subs.forEach(sub => {
            console.log(`  - ID: ${sub._id}, ownerId: ${sub.ownerId}, status: ${sub.status}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\n✅ Done!');
    }
}

fixNow();
