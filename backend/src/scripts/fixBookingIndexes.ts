/**
 * Database Fix Script for Offline Booking Feature
 * 
 * This script removes the old 'bookingId' index that's causing conflicts
 * Run this once to fix the database schema
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixBookingIndexes = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shivas-box-cricket';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get the bookings collection
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        const collection = db.collection('bookings');

        // Get all indexes
        const indexes = await collection.indexes();
        console.log('\n📋 Current indexes:');
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, index.key);
        });

        // Check if bookingId_1 index exists
        const hasOldIndex = indexes.some(index => index.name === 'bookingId_1');

        if (hasOldIndex) {
            console.log('\n🔧 Dropping old bookingId_1 index...');
            await collection.dropIndex('bookingId_1');
            console.log('✅ Successfully dropped bookingId_1 index');
        } else {
            console.log('\n✅ No old bookingId_1 index found - database is clean');
        }

        // Verify final indexes
        const finalIndexes = await collection.indexes();
        console.log('\n📋 Final indexes:');
        finalIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, index.key);
        });

        console.log('\n✅ Database fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing database:', error);
        process.exit(1);
    }
};

// Run the fix
fixBookingIndexes();
