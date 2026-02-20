import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/signup - Create new identity
router.post('/signup', async (req, res) => {
    try {
        const { id, name, password, role } = req.body;

        // Validate password strength
        if (!password || password.length < 3) {
            return res.status(400).json({ error: 'Password must be at least 3 characters long.' });
        }

        const existingUser = await User.findOne({ id });
        if (existingUser) {
            return res.status(400).json({ error: 'Identity already exists in the registry.' });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            id,
            name,
            password: hashedPassword,
            role: role || 'student',
            balance: 500 // Welcome credit
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        console.log(`✅ New user registered: ${user.id} (${user.role})`);
        res.status(201).json({
            user: userResponse,
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to initiate sequence.' });
    }
});

// POST /api/auth/login - Authenticate identity
router.post('/login', async (req, res) => {
    try {
        const { id, password } = req.body;

        const user = await User.findOne({ id });
        if (!user) {
            return res.status(401).json({ error: 'Neural Secret mismatch or ID not found.' });
        }

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Neural Secret mismatch or ID not found.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        console.log(`🔓 User logged in: ${user.id} (${user.role})`);
        res.json({
            user: userResponse,
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication protocol failed.' });
    }
});

export default router;
