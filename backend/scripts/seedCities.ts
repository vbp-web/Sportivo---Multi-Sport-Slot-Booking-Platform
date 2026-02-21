import mongoose from 'mongoose';
import dotenv from 'dotenv';
import City from '../src/models/City';

// Load environment variables
dotenv.config({ path: '.env' });

const sampleCities = [
    { name: 'Mumbai', state: 'Maharashtra', isActive: true },
    { name: 'Delhi', state: 'Delhi', isActive: true },
    { name: 'Bangalore', state: 'Karnataka', isActive: true },
    { name: 'Hyderabad', state: 'Telangana', isActive: true },
    { name: 'Chennai', state: 'Tamil Nadu', isActive: true },
    { name: 'Pune', state: 'Maharashtra', isActive: true },
    { name: 'Kolkata', state: 'West Bengal', isActive: true },
    { name: 'Ahmedabad', state: 'Gujarat', isActive: true },
    { name: 'Jaipur', state: 'Rajasthan', isActive: true },
    { name: 'Lucknow', state: 'Uttar Pradesh', isActive: true },
];

const seedCities = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('✅ Connected to MongoDB');

        // Check existing cities
        const existingCities = await City.find({});
        console.log(`\n📋 Found ${existingCities.length} existing cities`);

        if (existingCities.length > 0) {
            console.log('\n🔄 Clearing existing cities...');
            await City.deleteMany({});
            console.log('✅ Cleared!');
        }

        // Insert sample cities
        console.log('\n📥 Inserting sample cities...');
        const cities = await City.insertMany(sampleCities);

        console.log(`\n✅ Successfully added ${cities.length} cities:`);
        cities.forEach((city, index) => {
            console.log(`${index + 1}. ${city.name}, ${city.state}`);
        });

        console.log('\n🎉 Cities seeded successfully!');
        console.log('\n📍 You can now:');
        console.log('   - Visit http://localhost:3001/cities');
        console.log('   - See all cities in the app');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedCities();
