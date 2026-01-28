import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users - Fetch all users in the system
router.get('/', async (req, res) => {
    try {
        const users = await User.find().sort({ name: 1 });
        res.json(users);
    } catch (error) {
        console.error('GET /users error:', error);
        res.status(500).json({ error: 'Failed to fetch registry' });
    }
});

// GET /api/users/:id - Fetch user data including balance
router.get('/:id', async (req, res) => {
    try {
        let user = await User.findOne({ id: req.params.id });

        // Auto-create user if not exists for demo purposes
        if (!user) {
            user = new User({
                id: req.params.id,
                name: 'Student User',
                role: 'student',
                balance: 500, // Starting balance
                points: 0
            });
            await user.save();
        }

        res.json(user);
    } catch (error) {
        console.error('GET /users/:id error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// POST /api/users/:id/balance - Update user balance
router.post('/:id/balance', async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            { $inc: { balance: amount } },
            { new: true, upsert: true }
        );
        res.json(user);
    } catch (error) {
        console.error('POST /users/:id/balance error:', error);
        res.status(500).json({ error: 'Failed to update balance' });
    }
});

export default router;
