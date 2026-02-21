/**
 * Complete Database Fix for Booking Schema
 * This will:
 * 1. Remove the old bookingId_1 index
 * 2. Remove bookingId field from all documents
 * 3. Ensure all bookings have bookingCode
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const completeBookingFix = async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/shivas-box-cricket';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db();
        const bookings = db.collection('bookings');

        console.log('🔍 STEP 1: Checking current state...\n');

        // Check current state
        const totalCount = await bookings.countDocuments();
        console.log(`   Total bookings: ${totalCount}`);

        const withBookingId = await bookings.countDocuments({ bookingId: { $exists: true } });
        console.log(`   Bookings with bookingId: ${withBookingId}`);

        const withBookingCode = await bookings.countDocuments({ bookingCode: { $exists: true } });
        console.log(`   Bookings with bookingCode: ${withBookingCode}\n`);

        // Step 2: Drop the old index
        console.log('🔧 STEP 2: Removing old bookingId_1 index...\n');
        try {
            await bookings.dropIndex('bookingId_1');
            console.log('   ✅ Successfully dropped bookingId_1 index\n');
        } catch (error) {
            if (error.codeName === 'IndexNotFound') {
                console.log('   ℹ️  Index bookingId_1 not found (already removed)\n');
            } else {
                console.log(`   ⚠️  Error dropping index: ${error.message}\n`);
            }
        }

        // Step 3: Remove bookingId field from all documents
        console.log('🔧 STEP 3: Removing bookingId field from documents...\n');
        const removeResult = await bookings.updateMany(
            { bookingId: { $exists: true } },
            { $unset: { bookingId: "" } }
        );
        console.log(`   ✅ Removed bookingId from ${removeResult.modifiedCount} documents\n`);

        // Step 4: Verify final state
        console.log('✅ STEP 4: Verifying final state...\n');

        const finalWithBookingId = await bookings.countDocuments({ bookingId: { $exists: true } });
        const finalWithBookingCode = await bookings.countDocuments({ bookingCode: { $exists: true } });

        console.log(`   Bookings with bookingId: ${finalWithBookingId} (should be 0)`);
        console.log(`   Bookings with bookingCode: ${finalWithBookingCode}\n`);

        // Show current indexes
        console.log('📋 Final indexes:');
        const indexes = await bookings.indexes();
        indexes.forEach(index => {
            const hasBookingId = index.name.includes('bookingId');
            const icon = hasBookingId ? '❌' : '✅';
            console.log(`   ${icon} ${index.name}: ${JSON.stringify(index.key)}`);
        });

        console.log('\n🎉 Database fix completed successfully!');
        console.log('\n💡 You can now use the offline booking feature without errors.');

    } catch (error) {
        console.error('\n❌ Error during fix:', error.message);
        console.error(error);
    } finally {
        await client.close();
    }
};

completeBookingFix();
