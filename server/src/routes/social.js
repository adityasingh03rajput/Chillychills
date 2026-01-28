import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Mock data for recommendations (since we don't have a complex social graph yet)
const MOCK_RECS = [
    { friendName: 'Sahil', item: 'Double Cheese Burger', avatar: 'Sahil' },
    { friendName: 'Ananya', item: 'Chilled Oreo Shake', avatar: 'Ananya' },
    { friendName: 'Rohan', item: 'Peri Peri Fries', avatar: 'Rohan' },
];

// GET /api/social/recommendations/:userId
router.get('/recommendations/:userId', async (req, res) => {
    try {
        // Just return mock data for now
        res.json(MOCK_RECS);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /api/social/recommend
router.post('/recommend', async (req, res) => {
    try {
        const { userId, friendName, item } = req.body;
        // In a real app, we'd save this to a 'Recommendations' table
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/social/collection/:userId
router.get('/collection/:userId', async (req, res) => {
    try {
        // Mock collection data
        const collection = {
            badges: [
                { id: '1', name: 'Early Bird', icon: '🌅', color: 'from-yellow-400 to-orange-500' },
                { id: '2', name: 'Burger King', icon: '👑', color: 'from-red-500 to-orange-600' }
            ],
            achievements: [
                { id: 'a1', name: 'First Order', desc: 'Secure your first meal', completed: true },
                { id: 'a2', name: 'Socialite', desc: 'Recommend 5 items', completed: false }
            ]
        };
        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
