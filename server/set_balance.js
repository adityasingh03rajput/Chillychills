import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not found in environment variables!');
        process.exit(1);
    }

    const userId = process.env.USER_ID;
    const amountRaw = process.env.AMOUNT;

    if (!userId) {
        console.error('❌ USER_ID is required');
        process.exit(1);
    }

    const amount = Number(amountRaw);
    if (!Number.isFinite(amount)) {
        console.error('❌ AMOUNT must be a valid number');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB for setting balance...');

        const user = await User.findOneAndUpdate(
            { id: userId },
            { $set: { balance: amount } },
            { new: true }
        ).select('-password');

        if (!user) {
            console.error(`❌ User not found: ${userId}`);
            process.exitCode = 1;
            return;
        }

        console.log(`💰 Updated ${user.id} balance -> ₹${user.balance}`);
    } catch (error) {
        console.error('❌ Set balance error:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

main();
