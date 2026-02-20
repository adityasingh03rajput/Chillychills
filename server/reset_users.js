import mongoose from 'mongoose';
import User from './src/models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function resetUsers() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in environment');

        console.log('🔌 Connecting to database...');
        await mongoose.connect(uri);

        console.log('🗑️ Deleting old users...');
        await User.deleteMany({});

        console.log('🔐 Hashing new passwords...');
        const hashedPassword = await bcrypt.hash('chilly123', 10);

        const newUsers = [
            {
                id: 'admin_jack',
                name: 'Jack (Manager)',
                role: 'manager',
                password: hashedPassword,
                balance: 1000
            },
            {
                id: 'chef_mario',
                name: 'Mario (Cook)',
                role: 'cook',
                password: hashedPassword
            },
            {
                id: 'student_sam',
                name: 'Sam (Student)',
                role: 'student',
                password: hashedPassword,
                balance: 500
            }
        ];

        console.log('💉 Injecting new users...');
        await User.insertMany(newUsers);

        console.log('\n✅ RESET COMPLETE');
        console.log('---------------------------');
        console.log('1. Manager -> ID: admin_jack | Pwd: chilly123');
        console.log('2. Cook    -> ID: chef_mario | Pwd: chilly123');
        console.log('3. Student -> ID: student_sam | Pwd: chilly123');
        console.log('---------------------------');

    } catch (error) {
        console.error('❌ Error during reset:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

resetUsers();
