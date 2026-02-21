import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixEmailIndex = async () => {
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db?.collection('users');

        if (!usersCollection) {
            throw new Error('Users collection not found');
        }

        console.log('\n📋 Current indexes:');
        const indexes = await usersCollection.indexes();
        indexes.forEach((index: any) => {
            console.log(`  - ${JSON.stringify(index.key)}: ${JSON.stringify(index)}`);
        });

        // Drop the old email_1 index if it exists and is not sparse
        console.log('\n🗑️  Dropping old email_1 index...');
        try {
            await usersCollection.dropIndex('email_1');
            console.log('✅ Old email_1 index dropped');
        } catch (error: any) {
            if (error.codeName === 'IndexNotFound') {
                console.log('ℹ️  email_1 index not found (already dropped or never existed)');
            } else {
                throw error;
            }
        }

        // Create new sparse unique index on email
        console.log('\n🔨 Creating new sparse unique index on email...');
        await usersCollection.createIndex(
            { email: 1 },
            {
                unique: true,
                sparse: true,
                name: 'email_1'
            }
        );
        console.log('✅ New sparse unique index created on email');

        console.log('\n📋 Updated indexes:');
        const newIndexes = await usersCollection.indexes();
        newIndexes.forEach((index: any) => {
            console.log(`  - ${JSON.stringify(index.key)}: sparse=${index.sparse}, unique=${index.unique}`);
        });

        console.log('\n✅ Email index fix completed successfully!');
        console.log('ℹ️  You can now create offline bookings without email addresses.');

    } catch (error) {
        console.error('❌ Error fixing email index:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

fixEmailIndex();
