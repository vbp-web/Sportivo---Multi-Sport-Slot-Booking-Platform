/**
 * Fix Email Index to Allow Multiple Null Values
 * This will:
 * 1. Drop the old non-sparse email_1 index
 * 2. Create a new sparse unique index on email
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const fixEmailIndex = async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/shivas-box-cricket';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db();
        const users = db.collection('users');

        console.log('🔍 STEP 1: Checking current indexes...\n');

        // Show current indexes
        const currentIndexes = await users.indexes();
        console.log('   Current indexes:');
        currentIndexes.forEach(index => {
            const sparse = index.sparse ? '(sparse)' : '';
            const unique = index.unique ? '(unique)' : '';
            console.log(`   - ${index.name}: ${JSON.stringify(index.key)} ${unique} ${sparse}`);
        });
        console.log('');

        // Step 2: Drop the old email_1 index if it exists
        console.log('🔧 STEP 2: Dropping old email_1 index...\n');
        try {
            await users.dropIndex('email_1');
            console.log('   ✅ Successfully dropped email_1 index\n');
        } catch (error) {
            if (error.codeName === 'IndexNotFound') {
                console.log('   ℹ️  Index email_1 not found (already dropped or never existed)\n');
            } else {
                console.log(`   ⚠️  Error dropping index: ${error.message}\n`);
            }
        }

        // Step 3: Create new sparse unique index on email
        console.log('🔨 STEP 3: Creating new sparse unique index on email...\n');
        try {
            await users.createIndex(
                { email: 1 },
                {
                    unique: true,
                    sparse: true,
                    name: 'email_1'
                }
            );
            console.log('   ✅ New sparse unique index created on email\n');
        } catch (error) {
            console.log(`   ⚠️  Error creating index: ${error.message}\n`);
        }

        // Step 4: Verify final state
        console.log('✅ STEP 4: Verifying final indexes...\n');

        const finalIndexes = await users.indexes();
        console.log('   Final indexes:');
        finalIndexes.forEach(index => {
            const sparse = index.sparse ? '✅ sparse' : '❌ not sparse';
            const unique = index.unique ? '✅ unique' : '';
            console.log(`   - ${index.name}: ${JSON.stringify(index.key)} ${unique} ${sparse}`);
        });
        console.log('');

        // Count users with null email
        const usersWithNullEmail = await users.countDocuments({ email: null });
        const usersWithEmail = await users.countDocuments({ email: { $ne: null } });
        console.log(`   Users with email: ${usersWithEmail}`);
        console.log(`   Users with null email: ${usersWithNullEmail}\n`);

        console.log('🎉 Email index fix completed successfully!');
        console.log('💡 You can now create multiple offline bookings without email addresses.\n');

    } catch (error) {
        console.error('\n❌ Error during fix:', error.message);
        console.error(error);
    } finally {
        await client.close();
        console.log('👋 Disconnected from MongoDB');
    }
};

fixEmailIndex();
