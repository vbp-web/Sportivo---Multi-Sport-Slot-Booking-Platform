import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config({ path: '.env' });

const testRegister = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('✅ Connected to MongoDB');

        // Check if test user exists
        const existingUser = await User.findOne({ email: 'test@example.com' });

        if (existingUser) {
            console.log('\n📧 User already exists:');
            console.log('Name:', existingUser.name);
            console.log('Email:', existingUser.email);
            console.log('Phone:', existingUser.phone);
            console.log('Role:', existingUser.role);
            console.log('\n✅ You can login with:');
            console.log('Email: test@example.com');
            console.log('Password: test123');
            console.log('Role:', existingUser.role);
        } else {
            console.log('\n❌ User does not exist!');
            console.log('\nCreating test user...');

            const user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                phone: '9876543210',
                password: 'test123',
                role: 'user',
                isPhoneVerified: true,
                isEmailVerified: true
            });

            console.log('\n✅ Test user created successfully!');
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('Phone:', user.phone);
            console.log('Role:', user.role);
            console.log('\n✅ You can now login with:');
            console.log('Email: test@example.com');
            console.log('Password: test123');
            console.log('Role: user');
        }

        // List all users
        const allUsers = await User.find({}).select('name email phone role');
        console.log('\n📋 All users in database:');
        allUsers.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email || 'NO EMAIL'}`);
            console.log(`   Phone: ${user.phone}`);
            console.log(`   Role: ${user.role}`);
        });

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testRegister();
