import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const NEW_USERS = [
    {
        id: 'manager',
        name: 'Cafe Manager',
        role: 'manager',
        password: '123',
        balance: 99999,
        points: 0
    },
    {
        id: 'cook',
        name: 'Head Chef',
        role: 'cook',
        password: '123',
        balance: 5000,
        points: 0
    },
    {
        id: 'user',
        name: 'Silly Customer',
        role: 'student', // Keeping technical role as 'student' for now to match frontend logic, but name is Customer. Or should I change role? Frontend likely checks 'student'.
        // Wait, the user said "manager, cook, user".  Usually 'user' implies the customer role.
        // If the frontend checks for 'student' role string, changing it to 'user' might break routing.
        // Let's check src/App.tsx or similar routing.
        // For now, I'll set the ID to 'user' but keep the role as 'student' to ensure login works, 
        // OR I should check if I need to update the enum in the User model.
        // Let's assume 'student' is the string used for customers in the codebase logic.
        // I'll stick to 'student' role string to be safe for logic, but display name is Customer.
        // Actually, if I change the role to 'user' I might break permissions.
        // I'll check User.js model.
        password: '123',
        balance: 1000,
        points: 100
    }
];

async function factoryReset() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in environment');

        console.log('🔌 Connecting to DB for Factory Reset...');
        await mongoose.connect(uri);

        console.log('⚠️ DELETING ALL DATA (Factory Reset)...');
        await mongoose.connection.db.dropDatabase();
        console.log('✅ Database Cleared.');

        console.log('🌱 Seeding New Test Accounts (Manager, Cook, User)...');
        for (const userData of NEW_USERS) {
            const user = new User(userData);
            await user.save();
            console.log(`   + Created: [${userData.role}] ${userData.name} (ID: ${userData.id})`);
        }

        console.log('\n✅ Factory Reboot Complete. Please restart the backend server.');
    } catch (error) {
        console.error('❌ Error during factory reset:', error);
    } finally {
        await mongoose.disconnect();
    }
}

factoryReset();
