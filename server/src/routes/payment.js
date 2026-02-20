import express from 'express';
import User from '../models/User.js';
import UpiTransaction from '../models/UpiTransaction.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/payment/upi-details - Get merchant UPI details for QR generation
router.get('/upi-details', authenticate, async (req, res) => {
    res.json({
        upiId: process.env.MERCHANT_UPI_ID || 'your-vpa@upi',
        name: process.env.MERCHANT_NAME || 'Chilly Chills',
        currency: 'INR'
    });
});

// POST /api/payment/verify-utr - Submit UTR for manager verification
router.post('/verify-utr', authenticate, async (req, res) => {
    try {
        const { utr, amount } = req.body;
        const userId = req.user.id;

        // 1. Basic Validation
        if (!utr || utr.length !== 12 || isNaN(utr)) {
            return res.status(400).json({ error: 'Invalid 12-digit UTR/Transaction ID' });
        }

        const topupAmount = Number(amount);
        if (isNaN(topupAmount) || topupAmount < 1) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // 2. Check for UTR reuse (Prevent Fraud)
        const existingTx = await UpiTransaction.findOne({ utr });
        if (existingTx) {
            return res.status(400).json({ error: 'This Transaction ID has already been used or is pending' });
        }

        // 3. Create UTR record as PENDING
        const upiTx = new UpiTransaction({
            utr,
            userId,
            amount: topupAmount,
            status: 'pending' // Manager must approve this
        });
        await upiTx.save();

        res.json({
            success: true,
            message: 'UTR submitted! Wallet will be credited after manager verification.'
        });

    } catch (error) {
        console.error('UTR Submission error:', error);
        res.status(500).json({ error: 'Submission failed' });
    }
});

// POST /api/payment/manual-topup - Admin manual topup
import { authorize } from '../middleware/auth.js';
router.post('/manual-topup', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { userId, amount } = req.body;
        if (!userId || !amount) return res.status(400).json({ error: 'UserId and amount required' });

        const user = await User.findOneAndUpdate(
            { id: userId },
            {
                $inc: { balance: Number(amount) },
                $push: {
                    transactions: {
                        type: 'topup',
                        amount: Number(amount),
                        method: 'admin_manual',
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, newBalance: user.balance });
    } catch (error) {
        res.status(500).json({ error: 'Manual topup failed' });
    }
});

export default router;
