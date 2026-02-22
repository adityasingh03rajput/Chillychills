import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const AMOUNT = 5000;

async function creditAllUsers() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not found in environment variables!');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB for wallet crediting...');

        const result = await User.updateMany({}, { $inc: { balance: AMOUNT } });

        console.log(`💰 Credited ₹${AMOUNT} to all users.`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    } catch (error) {
        console.error('❌ Wallet crediting error:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

creditAllUsers();
