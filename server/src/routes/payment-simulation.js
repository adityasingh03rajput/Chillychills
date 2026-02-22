import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const simulatedTransactions = new Map();
router.post('/simulate', authenticate, async (req, res) => {
    try {
        const { amount, paymentMethod = 'upi' } = req.body;
        const userId = req.user.id;

        const topupAmount = Number(amount);
        if (isNaN(topupAmount) || topupAmount < 1) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        const transactionId = `SIM${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const user = await User.findOneAndUpdate(
            { id: userId },
            {
                $inc: { balance: topupAmount },
                $push: {
                    transactions: {
                        type: 'topup',
                        amount: topupAmount,
                        method: `simulated_${paymentMethod}`,
                        transactionId,
                        timestamp: new Date(),
                        status: 'completed'
                    }
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        simulatedTransactions.set(transactionId, {
            userId,
            amount: topupAmount,
            method: paymentMethod,
            timestamp: new Date(),
            status: 'completed'
        });

        res.json({
            success: true,
            transactionId,
            amount: topupAmount,
            newBalance: user.balance,
            message: `Simulated payment of ₹${topupAmount} processed successfully`,
            simulated: true
        });

    } catch (error) {
        console.error('Payment simulation error:', error);
        res.status(500).json({ error: 'Payment simulation failed' });
    }
});

router.get('/simulation-status', (req, res) => {
    res.json({
        simulationMode: true,
        totalTransactions: simulatedTransactions.size,
        message: 'Payment gateway is running in simulation mode'
    });
});

router.post('/simulate-failure', authenticate, async (req, res) => {
    const { amount } = req.body;

    await new Promise(resolve => setTimeout(resolve, 1500));

    res.status(400).json({
        success: false,
        error: 'Simulated payment failure',
        message: `Payment of ₹${amount} failed - This is a simulated failure for testing purposes`,
        simulated: true
    });
});

export default router;
