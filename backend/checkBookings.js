/**
 * Check and Fix Existing Bookings
 * This script will:
 * 1. Check all existing bookings
 * 2. Show which ones have bookingId vs bookingCode
 * 3. Optionally migrate old data
 */

const { MongoClient } = require('mongodb');

const checkBookings = async () => {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shivas-box-cricket';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db();
        const bookings = db.collection('bookings');

        // Count total bookings
        const totalCount = await bookings.countDocuments();
        console.log(`📊 Total bookings in database: ${totalCount}\n`);

        // Check for bookings with bookingId
        const withBookingId = await bookings.countDocuments({ bookingId: { $exists: true } });
        console.log(`📋 Bookings with 'bookingId' field: ${withBookingId}`);

        // Check for bookings with bookingCode
        const withBookingCode = await bookings.countDocuments({ bookingCode: { $exists: true } });
        console.log(`📋 Bookings with 'bookingCode' field: ${withBookingCode}`);

        // Check for bookings with null bookingId
        const withNullBookingId = await bookings.countDocuments({ bookingId: null });
        console.log(`⚠️  Bookings with NULL 'bookingId': ${withNullBookingId}\n`);

        // Show sample of existing bookings
        console.log('📄 Sample bookings:');
        const samples = await bookings.find({}).limit(3).toArray();
        samples.forEach((booking, index) => {
            console.log(`\n  Booking ${index + 1}:`);
            console.log(`    _id: ${booking._id}`);
            console.log(`    bookingId: ${booking.bookingId || 'NOT SET'}`);
            console.log(`    bookingCode: ${booking.bookingCode || 'NOT SET'}`);
            console.log(`    status: ${booking.status}`);
        });

        // Check indexes
        console.log('\n\n📋 Current indexes on bookings collection:');
        const indexes = await bookings.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });

        // Recommendation
        console.log('\n\n💡 RECOMMENDATION:');
        if (withBookingId > 0 || withNullBookingId > 0) {
            console.log('   You have old bookings with bookingId field.');
            console.log('   Options:');
            console.log('   1. Drop the bookingId_1 index (safest)');
            console.log('   2. Remove bookingId field from all documents');
            console.log('   3. Keep both fields (not recommended)');
        } else {
            console.log('   Your bookings look good!');
            console.log('   Just drop the bookingId_1 index if it exists.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
};

checkBookings();
