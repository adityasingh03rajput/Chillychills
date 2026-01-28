import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function rawFix() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('menuitems'); // Mongoose pluralizes MenuItem

    // Find items with basePrice but no price
    const items = await collection.find({ price: { $exists: false }, basePrice: { $exists: true } }).toArray();
    console.log('Found', items.length, 'items needing fix');

    for (const item of items) {
        await collection.updateOne({ _id: item._id }, { $set: { price: item.basePrice } });
        console.log('Fixed', item.name);
    }

    await mongoose.disconnect();
}
rawFix();
