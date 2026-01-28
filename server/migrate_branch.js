import mongoose from 'mongoose';
import MenuItem from './src/models/MenuItem.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await MenuItem.updateMany({}, { $set: { branch: 'All' } });
    console.log('Migrated', result.modifiedCount, 'items to branch All');
    await mongoose.disconnect();
}
migrate();
