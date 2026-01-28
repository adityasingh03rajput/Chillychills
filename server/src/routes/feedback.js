import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// POST /api/feedback - Submit feedback
router.post('/', async (req, res) => {
    try {
        const { id, rating, comment } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            {
                feedback: {
                    rating,
                    comment,
                    submittedAt: Date.now()
                }
            },
            { new: true }
        ).lean();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Feedback submitted successfully', order });
    } catch (error) {
        console.error('POST /feedback error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

export default router;
