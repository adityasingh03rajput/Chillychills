import mongoose from 'mongoose';
import MonthlyBalance from './src/models/MonthlyBalance.js';
import Order from './src/models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

async function deepRecalculate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- 🚀 DEEP FISCAL RECALCULATION ---');

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        console.log(`[SYNC] Purging and rebuilding ${year}-${month}...`);
        const balance = await MonthlyBalance.recalculateForMonth(year, month);

        console.log('\n[FINAL STATE]');
        console.log(`- Revenue: ₹${balance.totalRevenue}`);
        console.log(`- Total Orders: ${balance.totalOrders}`);
        console.log(`- Successful: ${balance.completedOrders} (${Math.round((balance.completedOrders / balance.totalOrders) * 100)}%)`);
        console.log(`- Revoked: ${balance.cancelledOrders}`);
        console.log(`- Averaged Flow: ₹${balance.averageOrderValue}`);

        console.log('\n--- ✅ DEEP SYNC COMPLETE ---');
    } catch (e) {
        console.error('❌ Sync failed:', e);
    } finally {
        await mongoose.disconnect();
    }
}

deepRecalculate();
