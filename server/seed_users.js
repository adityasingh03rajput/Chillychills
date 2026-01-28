import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const INITIAL_USERS = [
    {
        id: 'manager_test_001',
        name: 'Prime Manager',
        role: 'manager',
        password: 'manager123',
        balance: 10000,
        points: 500
    },
    {
        id: 'cook_test_001',
        name: 'Head Chef',
        role: 'cook',
        password: 'cook123',
        balance: 5000,
        points: 200
    },
    {
        id: 'student_test',
        name: 'Demo Student',
        role: 'student',
        password: 'student123',
        balance: 500,
        points: 50
    }
];

async function seedUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding users...');

        // Clear existing users to avoid duplicates during testing
        // Only if you want a clean state:
        // await User.deleteMany({ id: { $in: INITIAL_USERS.map(u => u.id) } });

        for (const userData of INITIAL_USERS) {
            const existing = await User.findOne({ id: userData.id });
            if (existing) {
                console.log(`User ${userData.id} already exists, skipping...`);
                continue;
            }
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${userData.id}`);
        }

        console.log('Successfully completed user seeding sequence.');
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedUsers();
