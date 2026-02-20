import express from 'express';
import GiftCard from '../models/GiftCard.js';
import User from '../models/User.js';
import crypto from 'crypto';

const router = express.Router();

// Helper to generate a unique code
const generateCode = () => {
    return 'CHILL-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// POST /api/giftcards/purchase - Generate a redeemable code for a specific target user
router.post('/purchase', async (req, res) => {
    try {
        const { purchaserId, targetUserId, amount, bonus } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ error: 'Recipient ID is mandatory' });
        }

        // Validate amount
        if (!amount || typeof amount !== 'number' || amount < 10) {
            return res.status(400).json({ error: 'Minimum gift amount is ₹10' });
        }

        if (amount > 10000) {
            return res.status(400).json({ error: 'Maximum gift amount is ₹10,000' });
        }

        // Validate bonus
        const bonusAmount = bonus || 0;
        if (bonusAmount < 0 || bonusAmount > amount * 0.5) {
            return res.status(400).json({ error: 'Invalid bonus amount' });
        }

        const totalCost = amount + bonusAmount;

        // Check purchaser balance and deduct atomically
        const purchaser = await User.findOneAndUpdate(
            {
                id: purchaserId,
                balance: { $gte: totalCost } // Atomic balance check
            },
            {
                $inc: { balance: -totalCost },
                $push: {
                    transactions: {
                        type: 'gift_sent',
                        amount: totalCost,
                        method: 'wallet',
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!purchaser) {
            return res.status(400).json({ error: 'Insufficient balance or user not found' });
        }

        const code = generateCode();
        const giftCard = new GiftCard({
            code,
            amount,
            bonus: bonusAmount,
            targetUserId,
            purchasedBy: purchaserId
        });

        await giftCard.save();

        console.log(`🎁 Gift card purchased: ${code} for ₹${amount}+₹${bonusAmount} by ${purchaserId} for ${targetUserId}`);
        res.json({ success: true, code, targetUserId, amount, bonus: bonusAmount, newBalance: purchaser.balance });
    } catch (error) {
        console.error('POST /giftcards/purchase error:', error);
        res.status(500).json({ error: 'Failed to generate gift code' });
    }
});

// POST /api/giftcards/redeem - Redeem a code (Must match targetUserId)
router.post('/redeem', async (req, res) => {
    try {
        const { code, userId } = req.body;

        // Validate inputs
        if (!code || !userId) {
            return res.status(400).json({ error: 'Code and userId are required' });
        }

        // Atomic operation: find unredeemed card for this user and mark as redeemed in one step
        const giftCard = await GiftCard.findOneAndUpdate(
            {
                code,
                isRedeemed: false,
                targetUserId: userId // Security: Only target user can redeem
            },
            {
                $set: {
                    isRedeemed: true,
                    redeemedBy: userId,
                    redeemedAt: new Date()
                }
            },
            { new: true }
        );

        if (!giftCard) {
            // Either code doesn't exist, already redeemed, or wrong user
            return res.status(404).json({ error: 'Invalid code, already redeemed, or not authorized for this user' });
        }

        // Add balance to user
        const user = await User.findOneAndUpdate(
            { id: userId },
            {
                $inc: { balance: giftCard.amount + giftCard.bonus },
                $push: {
                    transactions: {
                        type: 'gift_received',
                        amount: giftCard.amount + giftCard.bonus,
                        method: 'wallet',
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!user) {
            // Rollback redemption if user not found (edge case)
            await GiftCard.findByIdAndUpdate(giftCard._id, {
                $set: { isRedeemed: false, redeemedBy: null, redeemedAt: null }
            });
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`🎁 Gift card redeemed: ${code} by ${userId} for ₹${giftCard.amount + giftCard.bonus}`);
        res.json({ success: true, amount: giftCard.amount, bonus: giftCard.bonus, newBalance: user.balance });
    } catch (error) {
        console.error('POST /giftcards/redeem error:', error);
        res.status(500).json({ error: 'Failed to redeem gift card' });
    }
});

// GET /api/giftcards/all - Fetch all gift cards for Manager Dashboard
router.get('/all', async (req, res) => {
    try {
        const giftCards = await GiftCard.find().sort({ createdAt: -1 });
        res.json(giftCards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch registry' });
    }
});

export default router;
