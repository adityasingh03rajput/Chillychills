import mongoose from 'mongoose';
import User from './src/models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MIGRATION SCRIPT: Hash Existing Plaintext Passwords
 * 
 * This script finds all users with plaintext passwords and hashes them.
 * Run this ONCE after deploying the bcrypt update.
 */

async function migratePasswords() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in environment');

        console.log('🔌 Connecting to database...');
        await mongoose.connect(uri);

        console.log('🔍 Finding users with plaintext passwords...');
        const users = await User.find({});

        let migratedCount = 0;
        let alreadyHashedCount = 0;

        for (const user of users) {
            // Check if password is already hashed (bcrypt hashes start with $2b$)
            if (user.password && user.password.startsWith('$2b$')) {
                console.log(`✅ User ${user.id} already has hashed password`);
                alreadyHashedCount++;
                continue;
            }

            // Hash the plaintext password
            const hashedPassword = await bcrypt.hash(user.password, 10);

            await User.findByIdAndUpdate(user._id, {
                password: hashedPassword
            });

            console.log(`🔒 Migrated password for user: ${user.id}`);
            migratedCount++;
        }

        console.log('\n✅ MIGRATION COMPLETE');
        console.log(`   - Migrated: ${migratedCount} users`);
        console.log(`   - Already hashed: ${alreadyHashedCount} users`);
        console.log(`   - Total: ${users.length} users`);

    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

migratePasswords();
