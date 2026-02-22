import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';

dotenv.config();

const KEEP_USERS = [
    { id: 'aditya', name: 'aditya', role: 'student', balance: 5000 },
    { id: 'admin', name: 'admin', role: 'manager', balance: 0 },
    { id: 'cook', name: 'cook', role: 'cook', balance: 0 }
];

async function purgeUsers() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not found in environment variables!');
        process.exit(1);
    }

    const confirmDelete = String(process.env.CONFIRM_DELETE || '') === '1' || String(process.env.CONFIRM_DELETE || '').toLowerCase() === 'true';
    const defaultPassword = process.env.DEFAULT_PASSWORD || 'chilly123';

    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB for user purge...');

        const keepIds = KEEP_USERS.map(u => u.id);

        const totalUsers = await User.countDocuments({});
        const toDeleteCount = await User.countDocuments({ id: { $nin: keepIds } });
        const keepCount = await User.countDocuments({ id: { $in: keepIds } });

        console.log(`Total users: ${totalUsers}`);
        console.log(`Will keep (by id): ${keepIds.join(', ')}`);
        console.log(`Currently present to keep: ${keepCount}`);
        console.log(`Would delete: ${toDeleteCount}`);

        if (!confirmDelete) {
            console.log('🛑 Dry-run only. To actually delete, re-run with CONFIRM_DELETE=1');
            return;
        }

        const hashed = await bcrypt.hash(defaultPassword, 10);

        for (const u of KEEP_USERS) {
            await User.findOneAndUpdate(
                { id: u.id },
                {
                    $set: {
                        id: u.id,
                        name: u.name,
                        role: u.role
                    },
                    $setOnInsert: {
                        password: hashed,
                        balance: u.balance ?? 0,
                        points: 0,
                        transactions: []
                    }
                },
                { upsert: true, new: true }
            );
        }

        const deleteResult = await User.deleteMany({ id: { $nin: keepIds } });
        console.log(`🗑️ Deleted users: ${deleteResult.deletedCount}`);

        const remaining = await User.find({}).select('-password').sort({ role: 1, name: 1 }).lean();
        console.log(`✅ Remaining users: ${remaining.length}`);
        console.log(remaining.map(u => `${u.id} (${u.role})`).join('\n'));
    } catch (error) {
        console.error('❌ Purge users error:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

purgeUsers();
