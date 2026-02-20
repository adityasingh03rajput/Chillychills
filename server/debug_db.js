import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';
import User from './src/models/User.js';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const orders = await Order.find({}, { _id: 1, status: 1, userId: 1, token: 1 }).sort({ createdAt: -1 }).limit(10);
        console.log('--- LATEST ORDERS ---');
        console.log(JSON.stringify(orders, null, 2));

        const users = await User.find({}, { id: 1, role: 1, balance: 1 });
        console.log('--- USERS ---');
        console.log(JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
