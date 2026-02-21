import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// User Schema (simplified for script)
const userSchema = new mongoose.Schema({
    name: String,
    phone: String,
    password: String,
    role: String,
    isPhoneVerified: Boolean,
    isEmailVerified: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ phone: '9999999999' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Phone: 9999999999');
            console.log('Password: admin123');
            await mongoose.connection.close();
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            phone: '9999999999',
            password: hashedPassword,
            role: 'admin',
            isPhoneVerified: true,
            isEmailVerified: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('==========================================');
        console.log('📱 Phone: 9999999999');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: admin');
        console.log('==========================================');
        console.log('You can now login at: http://localhost:3001/login');

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
