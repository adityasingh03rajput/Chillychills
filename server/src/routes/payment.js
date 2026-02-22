import express from 'express';
import User from '../models/User.js';
import UpiTransaction from '../models/UpiTransaction.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const SIMULATION_MODE = process.env.PAYMENT_SIMULATION_MODE === 'true' || process.env.NODE_ENV !== 'production';

// GET /api/payment/upi-details - Get merchant UPI details for QR generation
router.get('/upi-details', authenticate, async (req, res) => {
    res.json({
        upiId: process.env.MERCHANT_UPI_ID || 'adityasingh03rajput@ibl',
        name: process.env.MERCHANT_NAME || 'Chilly Chills',
        currency: 'INR'
    });
});

// POST /api/payment/verify-utr - Submit UTR for manager verification
router.post('/verify-utr', authenticate, async (req, res) => {
    if (SIMULATION_MODE) {
        try {
            const { amount, paymentMethod = 'upi' } = req.body;
            const userId = req.user.id;

            // Validate amount
            const topupAmount = Number(amount);
            if (isNaN(topupAmount) || topupAmount < 1) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate simulated transaction ID
            const transactionId = `SIM${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            // Update user balance directly
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
        return;
    }

    try {
        const { utr, amount } = req.body;
        const userId = req.user.id;
        const role = req.user.role;

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
        // Students: credit instantly (as requested)
        if (role === 'student') {
            const upiTx = new UpiTransaction({
                utr,
                userId,
                amount: topupAmount,
                status: 'verified'
            });
            await upiTx.save();

            const user = await User.findOneAndUpdate(
                { id: userId },
                {
                    $inc: { balance: topupAmount },
                    $push: {
                        transactions: {
                            type: 'topup',
                            amount: topupAmount,
                            method: 'upi',
                            orderId: `UTR-${utr}`,
                            timestamp: new Date()
                        }
                    }
                },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.json({
                success: true,
                amount: topupAmount,
                newBalance: user.balance,
                message: `Wallet credited with ₹${topupAmount}`
            });
        }

        // Non-students: keep manager-verification workflow
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
        if (error?.code === 11000) {
            return res.status(400).json({ error: 'This Transaction ID has already been used or is pending' });
        }
        console.error('UTR Submission error:', error);
        res.status(500).json({ error: 'Submission failed' });
    }
});

// POST /api/payment/manual-topup - Admin manual topup
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

// GET /api/payment/simulation-status - Get simulation status
router.get('/simulation-status', (req, res) => {
    res.json({
        simulationMode: SIMULATION_MODE,
        message: SIMULATION_MODE ? 
            'Payment gateway is running in simulation mode - No real payments will be processed' : 
            'Payment gateway is running in production mode - Real payments will be processed'
    });
});

export default router;
