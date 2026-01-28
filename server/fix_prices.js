import mongoose from 'mongoose';
import MenuItem from './src/models/MenuItem.js';
import dotenv from 'dotenv';
dotenv.config();

async function fixPrices() {
    await mongoose.connect(process.env.MONGODB_URI);
    const items = await MenuItem.find();
    console.log('Found', items.length, 'items');

    for (const item of items) {
        if (!item.price && item.basePrice) {
            item.price = item.basePrice;
            await item.save();
            console.log('Fixed price for', item.name);
        }
    }

    await mongoose.disconnect();
}
fixPrices();
