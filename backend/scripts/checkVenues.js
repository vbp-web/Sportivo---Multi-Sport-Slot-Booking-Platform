// Check venues in database
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkVenues() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/boxcricket';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected\n');

        const db = client.db();

        // Get all venues
        const venues = await db.collection('venues').find({}).toArray();
        console.log(`📊 Found ${venues.length} venue(s)\n`);

        for (const venue of venues) {
            console.log('─'.repeat(60));
            console.log(`📍 Venue: ${venue.name}`);
            console.log(`   ID: ${venue._id}`);
            console.log(`   ownerId: ${venue.ownerId}`);
            console.log(`   City: ${venue.city}`);
            console.log(`   Address: ${venue.address}`);
            console.log('');

            // Check if ownerId is valid
            const owner = await db.collection('owners').findOne({ _id: venue.ownerId });
            if (owner) {
                console.log(`   ✅ Found Owner: ${owner.ownerName}`);
            } else {
                console.log(`   ❌ No Owner found with _id: ${venue.ownerId}`);

                // Check if it's a userId
                const user = await db.collection('users').findOne({ _id: venue.ownerId });
                if (user) {
                    console.log(`   ⚠️  This is a USER ID! User: ${user.name}`);

                    // Find actual owner
                    const actualOwner = await db.collection('owners').findOne({ userId: venue.ownerId });
                    if (actualOwner) {
                        console.log(`   ✅ Found actual Owner: ${actualOwner.ownerName}`);
                        console.log(`   📝 Correct ownerId should be: ${actualOwner._id}`);
                        console.log(`   🐛 BUG: Venue has userId instead of ownerId!`);
                    }
                }
            }
        }

        console.log('─'.repeat(60));

        // Also show all owners
        const owners = await db.collection('owners').find({}).toArray();
        console.log(`\n👥 All Owners (${owners.length}):\n`);
        for (const owner of owners) {
            console.log(`  - Owner ID: ${owner._id}`);
            console.log(`    User ID: ${owner.userId}`);
            console.log(`    Name: ${owner.ownerName}`);
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('✅ Done!');
    }
}

checkVenues();
