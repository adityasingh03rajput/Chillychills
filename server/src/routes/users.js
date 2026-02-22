import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - Fetch all users in the system
router.get('/', authenticate, authorize('manager'), async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ name: 1 });
        res.json(users);
    } catch (error) {
        console.error('GET /users error:', error);
        res.status(500).json({ error: 'Failed to fetch registry' });
    }
});

// GET /api/users/:id - Fetch user data including balance
router.get('/:id', authenticate, async (req, res) => {
    try {
        const requestedId = req.params.id;

        // Only managers can fetch arbitrary user profiles
        if (req.user.role !== 'manager' && req.user.id !== requestedId) {
            return res.status(403).json({ error: 'Forbidden: You can only access your own profile.' });
        }

        const user = await User.findOne({ id: requestedId }).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
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

        // Validate amount
        if (typeof amount !== 'number' || isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid amount. Must be a number.' });
        }

        if (amount < 0) {
            return res.status(400).json({ error: 'Cannot add negative amount. Use deduction endpoint instead.' });
        }

        if (amount > 100000) {
            return res.status(400).json({ error: 'Maximum replenishment is ₹100,000.' });
        }

        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            { $inc: { balance: amount } },
            { new: true, upsert: true }
        );

        console.log(`💰 Balance updated for user ${req.params.id}: +₹${amount}. New balance: ₹${user.balance}`);
        res.json(user);
    } catch (error) {
        console.error('POST /users/:id/balance error:', error);
        res.status(500).json({ error: 'Failed to update balance' });
    }
});

export default router;
