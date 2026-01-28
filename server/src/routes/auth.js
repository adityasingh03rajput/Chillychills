import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/signup - Create new identity
router.post('/signup', async (req, res) => {
    try {
        const { id, name, password, role } = req.body;

        const existingUser = await User.findOne({ id });
        if (existingUser) {
            return res.status(400).json({ error: 'Identity already exists in the registry.' });
        }

        const user = new User({
            id,
            name,
            password, // In a real app, hash this!
            role: role || 'student',
            balance: 500 // Welcome credit
        });

        await user.save();
        res.status(201).json(user);
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
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Neural Secret mismatch or ID not found.' });
        }

        res.json(user);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication protocol failed.' });
    }
});

export default router;
