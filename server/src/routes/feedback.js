import express from 'express';
import Order from '../models/Order.js';
import AppFeedback from '../models/AppFeedback.js';
import xss from 'xss';

const router = express.Router();

// POST /api/feedback - Submit feedback
router.post('/', async (req, res) => {
    try {
        const { id, userId, rating, comment } = req.body;

        // Validate rating
        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
        }

        // Validate comment length
        if (comment && comment.length > 500) {
            return res.status(400).json({ error: 'Comment must be less than 500 characters' });
        }

        // Sanitize comment to prevent XSS
        const sanitizedComment = comment ? xss(comment.trim()) : '';

        // If no order id is provided, treat as general app feedback
        if (!id) {
            if (!userId || typeof userId !== 'string') {
                return res.status(400).json({ error: 'userId is required when submitting general feedback' });
            }

            const created = await AppFeedback.create({
                userId,
                rating,
                comment: sanitizedComment,
                createdAt: Date.now()
            });

            return res.json({ message: 'Feedback submitted successfully', feedback: created });
        }

        // Check if order exists
        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if feedback already submitted
        if (existingOrder.feedback?.rating) {
            return res.status(400).json({ error: 'Feedback already submitted for this order' });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            {
                feedback: {
                    rating,
                    comment: sanitizedComment,
                    submittedAt: Date.now()
                }
            },
            { new: true }
        ).lean();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log(`⭐ Feedback submitted for order ${id}: ${rating}/5 stars`);
        res.json({ message: 'Feedback submitted successfully', order });
    } catch (error) {
        console.error('POST /feedback error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

export default router;
