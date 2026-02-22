import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import User from './src/models/User.js';

dotenv.config();

async function exportUsers() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not found in environment variables!');
        process.exit(1);
    }

    const includePassword = String(process.env.INCLUDE_PASSWORD || '').toLowerCase() === 'true' || process.env.INCLUDE_PASSWORD === '1';

    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB for exporting users...');

        const query = User.find().sort({ name: 1 });
        if (!includePassword) query.select('-password');

        const users = await query.lean();

        const outDir = path.resolve('exports');
        await mkdir(outDir, { recursive: true });

        const filename = `users-${Date.now()}.json`;
        const outPath = path.join(outDir, filename);

        await writeFile(outPath, JSON.stringify(users, null, 2), 'utf8');

        console.log(`📦 Exported ${users.length} users to: ${outPath}`);
        if (!includePassword) {
            console.log('🔒 Password field excluded (set INCLUDE_PASSWORD=1 to include).');
        }
    } catch (error) {
        console.error('❌ Export users error:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

exportUsers();
